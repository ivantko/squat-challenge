import { kv } from '@vercel/kv';

export function isKvConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function kvGetJson<T>({ key }: { key: string }): Promise<T | null> {
  if (!isKvConfigured()) {
    return null;
  }

  return await kv.get<T>(key);
}

export async function kvSetJson<T>({
  key,
  value,
  ttlSeconds,
}: {
  key: string;
  value: T;
  ttlSeconds: number;
}) {
  if (!isKvConfigured()) {
    return;
  }

  await kv.set(key, value, { ex: ttlSeconds });
}

export async function kvDel({ key }: { key: string }) {
  if (!isKvConfigured()) {
    return;
  }

  await kv.del(key);
}

