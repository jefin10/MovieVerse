import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { attachRoomSockets, closeRoomSockets } from './realtime/rooms.js';
import { startScheduler, stopScheduler } from './services/scheduler.js';

const app = createApp();

if (env.otpEscapeCode) console.warn('[auth] OTP_ESCAPE_CODE is set: that code signs in to any account');

const server = app.listen(env.port, () => {
  console.log(`[api] listening on :${env.port} (${env.nodeEnv})`);
});

attachRoomSockets(server);
if (env.schedulerEnabled) startScheduler();

async function shutdown() {
  stopScheduler();
  closeRoomSockets();
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
