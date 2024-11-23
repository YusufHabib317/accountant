/* eslint-disable @typescript-eslint/no-explicit-any */
import { betterFetch } from '@better-fetch/fetch';
import { NextRequest } from 'next/server';

export async function getUserId(req: NextRequest): Promise<string | null> {
  try {
    const baseURL = process.env.NODE_ENV === 'production'
      ? `https://${req.headers.get('host')}`
      : `${req.nextUrl.origin}`;

    const { data: session } = await betterFetch<any>('/api/auth/get-session', {
      baseURL,
      headers: {
        cookie: req.headers.get('cookie') || '',
      },
    });

    return session?.session?.userId || null;
  } catch {
    return null;
  }
}
