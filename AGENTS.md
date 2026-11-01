# VoiceOrder

Read README.md and docs/GEMINI_SETUP.md. This is a narrow restaurant-ordering prototype using Next.js on Node 24, Gemini text interpretation and persistent SQLite on Render.

Preserve the cream/forest-green design, visible conversation, editable cart and explicit confirmation. Prices, available items and quantity limits are server-owned. Preserve per-browser order isolation, duplicate confirmation protection and cart contents on interpretation failures.

Run `corepack pnpm test`, `corepack pnpm typecheck`, `corepack pnpm build` and the HTTP check `node scripts/test-api.mjs` against a running server. Never claim live Gemini or microphone accuracy from mocked or guided tests. Never commit keys or database files. The old hosted Cloudflare Site is separate; do not redeploy it or change its audience without a request.
