import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../auth/api';

/**
 * Changes made with no connection, sent in order once it's back. Every endpoint
 * used here is safe to repeat, so a request that lands twice does no harm.
 */
export interface OutboxItem {
  id: string;
  method: 'post' | 'delete';
  url: string;
  body?: Record<string, unknown>;
}

const KEY = 'movieverse-outbox';
let flushing = false;

const read = async (): Promise<OutboxItem[]> => {
  try {
    return JSON.parse((await AsyncStorage.getItem(KEY)) ?? '[]');
  } catch {
    return [];
  }
};

const write = (items: OutboxItem[]) => AsyncStorage.setItem(KEY, JSON.stringify(items));

const send = (item: Pick<OutboxItem, 'method' | 'url' | 'body'>) =>
  item.method === 'delete' ? api.delete(item.url) : api.post(item.url, item.body ?? {});

export const isNetworkError = (err: any) => !err?.response;

/** Sends now, or queues if there's no connection. A real rejection from the server still throws. */
export const sendOrQueue = async (item: Pick<OutboxItem, 'method' | 'url' | 'body'>) => {
  try {
    const res = await send(item);
    return { queued: false, data: res.data };
  } catch (err) {
    if (!isNetworkError(err)) throw err;
    const items = await read();
    await write([...items, { ...item, id: `${Date.now()}-${items.length}` }]);
    return { queued: true, data: null };
  }
};

/** Cancels a queued change, e.g. removing a movie that was only added offline. */
export const dropQueued = async (match: (item: OutboxItem) => boolean) => {
  const items = await read();
  await write(items.filter((i) => !match(i)));
};

export const flushOutbox = async (): Promise<number> => {
  if (flushing) return 0;
  flushing = true;
  let sent = 0;
  try {
    let items = await read();
    while (items.length) {
      try {
        await send(items[0]);
        sent += 1;
      } catch (err) {
        // Still offline, or the server is struggling: keep the rest for next time.
        const status = (err as any)?.response?.status;
        if (isNetworkError(err) || status >= 500) break;
        // Otherwise the server refused it, and retrying would never succeed.
      }
      items = items.slice(1);
      await write(items);
    }
  } finally {
    flushing = false;
  }
  return sent;
};
