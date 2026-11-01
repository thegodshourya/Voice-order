import { getSession } from '@/app/session';
import { interpret } from '@/lib/gemini.mjs';

export async function GET() {
  await getSession();
  return Response.json({ configured: Boolean(process.env.GEMINI_API_KEY) });
}

export async function POST(req: Request) {
  await getSession();
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ error: 'AI is not connected yet. Use menu controls or guided commands.' }, { status: 503 });
  try {
    const body = await req.json();
    return Response.json(await interpret(body.text, body.cart, key, process.env.GEMINI_MODEL, body.history));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Could not interpret order. Cart unchanged.' }, { status: 400 });
  }
}
