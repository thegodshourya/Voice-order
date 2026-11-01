# Gemini setup

Create an API key in Google AI Studio. Set `GEMINI_API_KEY` in `.env.local` locally or in Render's Environment settings. Never commit a key or put it in a NEXT_PUBLIC variable. Restart after changing configuration.

The server uses Gemini's `generateContent` API with structured JSON output. `GEMINI_MODEL` defaults to `gemini-2.5-flash`; model access and quotas depend on your Google project. “Gemini enabled” means a key is configured, not that a live request has succeeded.

Try English, Hindi and Hinglish orders and corrections. Validate quantities and totals before confirmation. Ambiguous requests should ask a question without changing the cart; provider errors must preserve it. Test unavailable Cola, negative quantities, unsupported toppings and “Margherita ek kar do”.

Browser speech recognition produces a reviewable transcript first. It requires microphone permission, a supporting browser and HTTPS or localhost. Gemini receives the submitted transcript and current cart, not microphone audio.
