import { readJsonResponse } from './http-json.mjs';
import {orderRequest,orderResult,providerError} from './ai-contract.mjs';

export async function interpret(text, currentCart, key, model = 'gemini-3.1-flash-lite', history = [], {timeoutMs=60000,retryTransient=true} = {}) {
  const {cart,conversation,schema,instruction}=orderRequest(text,currentCart,history);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: instruction }] },
      contents: [{ role: 'user', parts: [{ text: JSON.stringify({ cart, conversation, utterance: text }) }] }],
      generationConfig: { responseMimeType: 'application/json', responseJsonSchema: schema },
    }),
    signal: AbortSignal.timeout(timeoutMs),
  };
  const response = await (async () => {
    const first = await fetch(url, options);
    // Interpretation does not submit an order. Retry transient gateway failures once.
    if (!retryTransient || ![502, 503, 504].includes(first.status)) return first;
    await first.body?.cancel();
    await new Promise(resolve => setTimeout(resolve, 600));
    return fetch(url, options);
  })().catch(error => {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw providerError(`Gemini did not respond within ${timeoutMs/1000} seconds. Your cart has not changed. Try again.`,true);
    }
    throw providerError('Could not reach Gemini. Check your internet connection. Your cart has not changed.',true);
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const invalidKey = Array.isArray(body?.error?.details) && body.error.details.some(detail => detail?.reason === 'API_KEY_INVALID');
    const reason = invalidKey || response.status === 401
      ? 'Gemini rejected the API key. Check GEMINI_API_KEY and restart the server.'
      : response.status === 403
        ? 'Gemini access is denied. Check the key restrictions and Google project access.'
        : response.status === 404
          ? 'The configured Gemini model is unavailable. Check GEMINI_MODEL for your Google project.'
          : response.status === 429
            ? 'Gemini quota or rate limit reached. Check your Google AI Studio usage and quota before retrying.'
            : response.status === 400
              ? 'Gemini rejected the request. Run the Gemini diagnostic to check the key, model and request format.'
              : 'Gemini is temporarily unavailable. Try again later or use menu controls.';
    // Never expose the raw provider response, which may include account details.
    throw providerError(`${reason} (HTTP ${response.status}) Your cart has not changed.`,response.status===429||response.status>=500);
  }
  let data;try{data=await readJsonResponse(response,'Gemini');}catch{throw providerError('Gemini returned an unreadable response. Your cart has not changed.',true);}
  const parts=data?.candidates?.[0]?.content?.parts;
  if(!Array.isArray(parts))throw providerError('Invalid AI response. Your cart has not changed.',true);
  return orderResult(parts.map(p=>typeof p?.text==='string'?p.text:'').join(''),cart);
}
