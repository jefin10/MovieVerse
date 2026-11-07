import axios from 'axios';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export type NotificationType = 'daily_pick' | 'provider' | 'follow' | 'room_match';

export interface NewNotification {
  userId: number;
  type: NotificationType;
  title: string;
  body: string;
  imageUrl?: string;
  /** Where tapping it goes, e.g. { movieId } or { username }. */
  data?: Record<string, string | number>;
  dedupeKey: string;
}

// Each type has its own Android channel, so people can silence one in system settings.
const CHANNEL: Record<NotificationType, string> = {
  daily_pick: 'tonights-pick',
  provider: 'streaming-alerts',
  follow: 'friends',
  room_match: 'watch-together',
};

async function push(n: NewNotification, id: number) {
  const tokens = await prisma.pushToken.findMany({ where: { userId: n.userId }, select: { token: true } });
  if (!tokens.length) return;
  const messages = tokens.map(({ token }) => ({
    to: token,
    title: n.title,
    body: n.body,
    sound: 'default',
    channelId: CHANNEL[n.type],
    data: { ...n.data, type: n.type, notificationId: id },
    ...(n.imageUrl ? { richContent: { image: n.imageUrl } } : {}),
  }));
  try {
    const { data } = await axios.post(EXPO_PUSH_URL, messages, { timeout: 10_000 });
    const results: { status: string; details?: { error?: string } }[] = data?.data ?? [];
    const dead = tokens.filter((_, i) => results[i]?.details?.error === 'DeviceNotRegistered').map((t) => t.token);
    if (dead.length) await prisma.pushToken.deleteMany({ where: { token: { in: dead } } });
  } catch (err) {
    // The inbox already has it; a failed push must never fail the action behind it.
    console.error('[push] send failed:', (err as Error).message);
  }
}

/** Saves to the in-app inbox and pushes to the user's devices. False if it was already sent. */
export async function notify(n: NewNotification): Promise<boolean> {
  try {
    const row = await prisma.notification.create({
      data: {
        userId: n.userId,
        type: n.type,
        title: n.title,
        body: n.body,
        imageUrl: n.imageUrl ?? '',
        data: n.data ?? {},
        dedupeKey: n.dedupeKey,
      },
    });
    await push(n, row.id);
    return true;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') return false;
    throw err;
  }
}
