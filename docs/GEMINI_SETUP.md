# Gemini setup

Create an API key in Google AI Studio. Set `GEMINI_API_KEY` in `.env.local` locally or in Render's Environment settings. Never commit a key or put it in a NEXT_PUBLIC variable. Restart after changing configuration.

The server uses Gemini's `generateContent` API with structured JSON output. `GEMINI_MODEL` defaults to `gemini-3.1-flash-lite`; model access and quotas depend on your Google project. “Gemini enabled” means a key is configured, not that a live request has succeeded.

Try English, Hindi and Hinglish orders and corrections. Validate quantities and totals before confirmation. Ambiguous requests should ask a question without changing the cart; provider errors must preserve it. Test unavailable Cola, negative quantities, unsupported toppings and “Margherita ek kar do”.

Browser speech recognition produces a reviewable transcript first. It requires microphone permission, a supporting browser and HTTPS or localhost. Gemini receives the submitted transcript and current cart, not microphone audio.

If interpretation fails, run `node --env-file=.env.local scripts/check-gemini.mjs` from the project folder. This sends one small live request using the app's actual schema and reports Google's HTTP status and error description without printing the key. A 429 means quota/rate limits; 403 means access restrictions; 404 means model availability; 400 can mean an invalid key or rejected request format. Inspect the specific error before changing configuration. Never paste your `.env.local` contents.

## NVIDIA fallback

Keep `GEMINI_API_KEY` and add `NVIDIA_API_KEY` privately in Render Environment. The NVIDIA hosted endpoint is `https://integrate.api.nvidia.com/v1/chat/completions`. `NVIDIA_MODEL` defaults to `meta/llama-3.3-70b-instruct`; the selected model must be enabled for your build.nvidia.com account and support JSON output. You may override the model using the exact API model ID from NVIDIA's model page.

With both keys present, Gemini gets 12 seconds; a network failure, timeout, HTTP 429, 5xx, or invalid response triggers one NVIDIA attempt with a 20-second budget. Authentication/model configuration errors (400/401/403/404) are reported instead of silently falling back. NVIDIA receives the same utterance, current cart, recent conversation and server-owned menu. Both providers use identical cart validation. Neither provider submits orders. If both fail, the cart stays unchanged and queued voice commands are cancelled.

With only NVIDIA configured, it is used directly. With only Gemini configured, the existing 60-second budget and one transient gateway retry remain. Keys being configured is not evidence of a successful provider connection. Browser speech recognition still handles audio; this fallback handles text interpretation.

`node scripts/check-ai.mjs` sends one live order interpretation with the configured keys without printing them. Provider account access, quota and real microphone accuracy need deployment testing.
