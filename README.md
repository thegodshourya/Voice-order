<div align="center">

# VoiceOrder
### By Bomb Squad
**Say what you’re craving. Make it yours. Confirm with confidence.**

A voice-assisted restaurant ordering prototype built with Next.js, Gemini and SQLite.

[Quick start](#quick-start) · [Demo walkthrough](#demo-walkthrough) · [Deploy on Render](#deploy-on-render) · [Gemini setup](docs/GEMINI_SETUP.md)

</div>

---

## The experience

| Step | What happens |
| --- | --- |
| **Explore** | Browse pizzas, sides, topping pots and a sample combo offer. |
| **Speak** | Start the microphone once. Recognized speech submits automatically; typing and menu buttons also work. |
| **Make it yours** | Ask about offers, change quantities or add extras. Gemini interprets English, Hindi and Hinglish text. |
| **Review** | Say “done” to open the centered cart dialog. Edit quantities before continuing. |
| **Checkout** | Accept or skip an optional dip, choose simulated UPI or card payment, then explicitly confirm. |
| **Kitchen** | Follow the ticket through Queued, Preparing, Ready and Completed in the same browser. |

The interface includes a Bomb Squad introduction, responsive menu cards, a listening indicator and reduced-motion support.

## Demo walkthrough

1. Open the app in Chrome and allow microphone access.
2. Order **two Margheritas and one garlic bread**.
3. Say **“Margherita ek kar do”** with Gemini configured.
4. Check that the cart contains one Margherita and one garlic bread: **₹248**.
5. Say **“done”**, review the cart, skip the optional dip, and select a demo payment method.
6. Confirm and open **Kitchen** in the same browser.

**Try an offer:** the Margherita + lemonade combo is ₹199, saving ₹19 compared with separate items. Cheese and pepper topping pots are served on the side. Extras require customer acceptance.

## Quick start

**Requirements:** Node.js 24, an optional Google Gemini API key, and Chrome for the recommended microphone experience.

```sh
git clone https://github.com/thegodshourya/Voice-order.git
cd Voice-order
corepack pnpm install --frozen-lockfile
```

Copy `.env.example` to **`.env.local`** beside `package.json`, then enter your key privately:

```dotenv
GEMINI_API_KEY=your_private_key
GEMINI_MODEL=gemini-3.1-flash-lite
DATABASE_PATH=./data/orders.sqlite
```

```sh
corepack pnpm dev
```

Open **http://localhost:3000**. Without a key, Guided mode supports commands such as `add 2 margherita`, `set margherita to 1` and `remove garlic`.

**Windows PowerShell:** use `npx.cmd --yes pnpm@11.25.0 install --frozen-lockfile` and `npx.cmd --yes pnpm@11.25.0 dev` if Corepack is unavailable or PowerShell blocks the `npx.ps1` wrapper.

> Downloading a fresh GitHub ZIP does not include your private `.env.local`. Copy it from your previous local folder, then restart the server. Never commit or share your key.

## Deploy on Render

1. Redeem any hosting credit and review the current service pricing.
2. Create a **Blueprint** from this repository’s `main` branch. Render reads [`render.yaml`](render.yaml).
3. Enter `GEMINI_API_KEY` in Render’s private environment settings. The model defaults to `gemini-3.1-flash-lite`.
4. Deploy and test voice ordering, cart confirmation and the kitchen flow using the provided HTTPS URL.

The Blueprint uses a **paid Starter service and a 1 GB persistent disk**. Orders are stored at `/var/data/orders.sqlite`; keep one service instance for this SQLite setup. Render hosting credits do not pay for Google API usage.

Once deployed, Render runs independently of your computer. Local SQLite data is not uploaded automatically. Back up any local orders you want to keep before deleting your PC copy. The previous Cloudflare deployment is separate and its orders are not migrated.

## Validation

```sh
corepack pnpm test
corepack pnpm typecheck
corepack pnpm build
corepack pnpm start
```

Against a running server:

```sh
node scripts/test-api.mjs
```

For one live Gemini diagnostic using your private configuration:

```sh
node --env-file=.env.local scripts/check-gemini.mjs
```

The API checks cover server-owned prices, explicit confirmation, duplicate protection, kitchen updates and browser isolation. They leave a Completed test ticket. Gemini unit checks use mocked responses; live interpretation and microphone accuracy require testing with your own key and browser.

## Project map

| Location | Purpose |
| --- | --- |
| `app/` | Ordering interface, styles and API routes |
| `lib/` | Menu, cart rules and Gemini interpretation |
| `db/` | SQLite storage and order schema |
| `scripts/` | Order checks, API checks and Gemini diagnostics |
| `docs/` | Gemini setup instructions |
| `public/` | Static assets |
| `render.yaml` | Render deployment configuration |

## Prototype boundaries

- **No real payments:** UPI and card checkout are simulations. No payment details are collected.
- **Browser-scoped orders:** each browser has a random private session cookie. Clearing cookies loses access to its tickets; this is not a shared restaurant kitchen or account system.
- **Speech support varies:** recognition requires a supporting browser, permission and HTTPS or localhost. The browser produces text; Gemini receives the submitted transcript and cart, not microphone audio.
- **Connection status is explicit:** a detected key is not a verified connection. The app displays “Gemini connected” after a successful interpretation.
- **Illustrative menu:** no actual restaurant fulfilment or measured commercial claims.

Built with AI coding assistance. Gemini and browser speech recognition are external services. Dependency versions are recorded in `package.json` and `pnpm-lock.yaml`.

Voice checkout commands run locally without Gemini: “review my order”, “skip extras”, “confirm with UPI”, and “confirm with card”. Saying only “UPI” or “card” selects a method without submitting. Pause voice at any time. On interpretation failure the cart is preserved and queued speech is cancelled so stale instructions cannot submit an incomplete order. Browser speech support varies; Chrome is recommended. Free Render instances may need time to wake up.
