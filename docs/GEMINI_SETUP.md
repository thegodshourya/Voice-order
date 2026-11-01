# Gemini connection

1. Create a key in Google AI Studio: https://aistudio.google.com/apikey . Follow the official guide at https://ai.google.dev/gemini-api/docs/api-key . Review account quotas and billing before enabling paid usage.
2. For local development, copy `.dev.vars.example` to `.dev.vars` and replace the placeholder in your own editor. Never commit `.dev.vars` or paste the key in a chat, screenshot or source file.
3. For the existing hosted Site, configure `GEMINI_API_KEY` as a server-only runtime secret using Sites environment-variable controls. A secret added to a Codex development environment does not automatically configure the deployed Site.
4. Set `GEMINI_MODEL` to a model available to your Google project. The current route uses the documented Interactions API and defaults to `gemini-3.8-flash`; verify availability with a real call before claiming it works.
5. Restart the local dev server, or apply the hosted runtime update. Reload VoiceOrder. The AI connected indicator currently means only that a key is present, not that a provider call has passed.
6. Test: add two Margheritas and one garlic bread; then say `Margherita ek kar do`. The corrected cart should contain 1 Margherita and 1 garlic bread, total INR 248. Also test `remove garlic bread`, an unavailable Cola, unsupported toppings, and ambiguous corrections. Verify no changes on provider errors and no kitchen ticket before confirmation.

Flow: browser speech recognition -> reviewable transcript -> POST /api/interpret -> Gemini -> server menu/quantity validation -> editable cart -> explicit customer confirmation -> server-calculated total and persistent kitchen ticket.

The key belongs only on the server. The UI does not call Gemini directly. No live Gemini validation has been performed yet because no key is configured. Speech recognition is browser-dependent and is separate from Gemini intent interpretation.
