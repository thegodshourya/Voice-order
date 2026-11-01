import { cookies } from 'next/headers';
import { randomUUID } from 'node:crypto';

// Demo orders belong to this browser. No personal data or third-party login required.
export async function getSession() {
  const jar = await cookies();
  let userId = jar.get('voiceorder_session')?.value;
  if (!userId || !/^[a-f0-9-]{36}$/.test(userId)) {
    userId = randomUUID();
    jar.set('voiceorder_session', userId, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7,
    });
  }
  return { userId };
}
