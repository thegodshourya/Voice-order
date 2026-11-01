# VoiceOrder

A voice-assisted food-ordering demo: speak in English or Hindi, review the transcript, let Gemini interpret the order, then confirm the cart before sending a kitchen ticket. Hinglish interpretation depends on Gemini and speech recognition quality.

## Run locally

Use Node 24 and the pinned pnpm version:

```sh
corepack pnpm install --frozen-lockfile
cp .env.example .env.local
# Set GEMINI_API_KEY privately in .env.local.
corepack pnpm dev
```

Without a key, the app uses explicit guided commands. Microphone input uses the browser's SpeechRecognition API and requires permission and HTTPS (or localhost). Chrome is recommended; other browsers may not support speech recognition. Gemini interprets the reviewed text; it does not record audio.

## Judge walkthrough

1. Add two Margheritas and one garlic bread.
2. With Gemini configured, submit “Margherita ek kar do”. In Guided mode, use “set margherita to 1”.
3. Verify one Margherita + one garlic bread, total ₹248.
4. Review and explicitly confirm. Open Kitchen in the same browser.
5. Move the ticket through Preparing, Ready and Completed.

This is a public prototype. Each browser has a private random session cookie and sees its own tickets; it is not a shared restaurant kitchen or an individual account system. Clearing cookies loses access to that browser's tickets. No payments or actual food fulfilment occur.

## Deploy on Render

Create a Blueprint from this repository using `render.yaml`. Set `GEMINI_API_KEY` securely when prompted. The Blueprint selects a paid Starter instance and a persistent disk for SQLite. Review pricing before deploying. `GEMINI_MODEL` defaults to `gemini-3.8-flash`; select an available model for your Google project if needed.

Render runs the production Next.js server and provides HTTPS for microphone permission. Orders persist at `/var/data/orders.sqlite`. Use one service instance with this SQLite configuration. The previous Cloudflare Site is independent and is not updated by this repository deployment; existing D1 orders are not migrated.

## Checks

```sh
corepack pnpm test
corepack pnpm typecheck
corepack pnpm build
corepack pnpm start
# In another terminal, against the running server:
node scripts/test-api.mjs
```

`app/` contains the interface and API routes; `lib/order-engine.mjs` owns the menu, prices and validation; `db/` stores orders; `scripts/` contains checks. See [Gemini setup](docs/GEMINI_SETUP.md).

Built with AI coding assistance. Browser speech services and Gemini are external services. Live Gemini and microphone accuracy must be evaluated with your own key and browser; automated checks do not establish those results.
