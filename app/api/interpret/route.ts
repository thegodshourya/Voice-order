import { getSession } from '@/app/session';
import { interpretOrder } from '@/lib/ai-provider.mjs';

export async function GET() {
  await getSession();
  return Response.json({ configured: Boolean(process.env.GEMINI_API_KEY?.trim()||(process.env.NVIDIA_ENABLED==='true'&&process.env.NVIDIA_API_KEY?.trim()&&process.env.NVIDIA_MODEL?.trim())) });
}

export async function POST(req: Request) {
  await getSession();
  if (!process.env.GEMINI_API_KEY?.trim()&&!(process.env.NVIDIA_ENABLED==='true'&&process.env.NVIDIA_API_KEY?.trim())) return Response.json({ error: 'AI is not connected yet. Use menu controls or guided commands.' }, { status: 503 });
  try {
    const body = await req.json();
    return Response.json(await interpretOrder(body.text, body.cart, body.history));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Could not interpret order. Cart unchanged.' }, { status: 400 });
  }
}
