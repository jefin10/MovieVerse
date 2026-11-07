import type { Server } from 'node:http';
import jwt from 'jsonwebtoken';
import { WebSocket, WebSocketServer } from 'ws';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import type { AuthUser } from '../middleware/auth.js';

/**
 * Live updates for Watch Together. Swipes themselves go over REST so they're
 * saved even on a bad connection; sockets only announce what changed, and a
 * client that reconnects re-reads the room to catch up.
 *
 * Connections live in this process's memory, so this assumes one API instance.
 * Running several would need a shared channel such as Redis pub/sub.
 */

const AUTH_TIMEOUT_MS = 5000;
const HEARTBEAT_MS = 30_000;

interface Client extends WebSocket {
  userId?: number;
  roomId?: number;
  alive?: boolean;
}

const rooms = new Map<number, Set<Client>>();
let wss: WebSocketServer | undefined;
let heartbeat: NodeJS.Timeout | undefined;

export function broadcast(roomId: number, event: Record<string, unknown>) {
  const message = JSON.stringify(event);
  for (const client of rooms.get(roomId) ?? []) {
    if (client.readyState === WebSocket.OPEN) client.send(message);
  }
}

export function isConnected(roomId: number, userId: number) {
  return [...(rooms.get(roomId) ?? [])].some((c) => c.userId === userId && c.readyState === WebSocket.OPEN);
}

function leave(client: Client) {
  if (client.roomId === undefined) return;
  const set = rooms.get(client.roomId);
  set?.delete(client);
  if (set?.size === 0) rooms.delete(client.roomId);
}

// The token goes in the first message, not the URL, so it can't end up in proxy logs.
async function authenticate(client: Client, raw: string) {
  const { token, code } = JSON.parse(raw) as { token?: string; code?: string };
  const user = jwt.verify(String(token), env.jwt.secret) as AuthUser;
  const member = await prisma.roomMember.findFirst({
    where: { userId: user.id, room: { code: String(code).toUpperCase() } },
    select: { roomId: true },
  });
  if (!member) throw new Error('not a member');
  client.userId = user.id;
  client.roomId = member.roomId;
  if (!rooms.has(member.roomId)) rooms.set(member.roomId, new Set());
  rooms.get(member.roomId)!.add(client);
  client.send(JSON.stringify({ type: 'ready' }));
}

export function attachRoomSockets(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws/rooms', maxPayload: 4096 });
  wss.on('connection', (socket) => {
    const client = socket as Client;
    client.alive = true;
    client.on('pong', () => (client.alive = true));

    const authTimer = setTimeout(() => client.close(4401, 'auth timeout'), AUTH_TIMEOUT_MS);
    client.once('message', (data) => {
      authenticate(client, String(data))
        .then(() => clearTimeout(authTimer))
        .catch(() => {
          clearTimeout(authTimer);
          client.close(4401, 'unauthorized');
        });
    });
    client.on('close', () => {
      clearTimeout(authTimer);
      leave(client);
    });
    client.on('error', () => client.terminate());
  });

  // Phones drop off networks without saying goodbye; this clears the dead ones.
  heartbeat = setInterval(() => {
    for (const socket of wss?.clients ?? []) {
      const client = socket as Client;
      if (!client.alive) {
        client.terminate();
        continue;
      }
      client.alive = false;
      client.ping();
    }
  }, HEARTBEAT_MS);
  heartbeat.unref();
}

export function closeRoomSockets() {
  if (heartbeat) clearInterval(heartbeat);
  for (const socket of wss?.clients ?? []) socket.terminate();
  wss?.close();
}
