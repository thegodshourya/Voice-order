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
| **Speak** | Start the microphone once. Speech fragments join after a 1.8-second pause; typing and menu buttons also work. |
| **Make it yours** | Ask about offers, change quantities or add extras. Gemini interprets English, Hindi and Hinglish text. |
| **Review** | After a successful voice order, pause for three seconds or say “review my order” to open the full checkout. New speech delays automatic review. |
| **Checkout** | Review items, optionally add a dip, and confirm with UPI or card on one screen. Voice confirmation needs no extra screen taps. |
| **Kitchen** | Follow the ticket through Queued, Preparing, Ready and Completed in the same browser. |

The restored Bomb Squad intro offers “Step inside” and “Start with voice”. The cream and rust menu uses distinct representative food photographs, a visible live transcript, a voice panel that floats to the center on desktop, single-screen checkout and reduced-motion support. Photo sources and licenses are in `public/food/credits.html`. On phones the voice panel starts compact so the menu is visible immediately; starting voice or opening the conversation expands it.

## Demo walkthrough

1. Open the app in Chrome, choose the speech language that matches your accent, and allow microphone access.
2. Order **two Margheritas and one garlic bread**.
3. Say **“Margherita ek kar do”** with Gemini configured.
4. Check that the cart contains one Margherita and one garlic bread: **₹248**.
5. Pause for three seconds to open review automatically, or say **“review my order”**. Say **“skip extras”**, then **“confirm with UPI”** or **“confirm with card”**.
6. After spoken confirmation, open **Kitchen** in the same browser to see the ticket.

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

Voice checkout commands run locally without Gemini: “review my order”, “skip extras”, “confirm with UPI”, and “confirm with card”. Saying only “UPI” or “card” selects a method without submitting. Pause voice at any time. On interpretation failure the cart is preserved and queued speech is cancelled so stale instructions cannot submit an incomplete order. Browser speech support varies; Chrome is recommended. Free Render instances may need time to wake up. HTML proxy error pages now produce a readable retry message instead of a JSON parsing error. A failed request keeps the cart and cancels automatic review; retry once the service is ready.

Speech recognition shows interim words live and waits for finalized text before submission. A quantity fragment such as “one” prompts a repeat instead of changing the cart. Recognition restarts retain pending finalized fragments; pause, failures and completed checkout cancel pending speech. Optional menu phrase hints are used only in browsers that support them. This does not add audio denoising: microphone placement, ambient noise, browser recognition and the selected speech language still affect accuracy. Transient Gemini HTTP 502/503/504 errors are retried once within the existing timeout; quota and authentication failures are not retried.

Browser validation covers the restored intro and focus handling, split speech, repeated recognition endings, automatic full checkout, local UPI/card confirmation, cart preservation after malformed or HTML responses, responsive widths, and reduced motion. These simulated speech checks do not establish real microphone accuracy or live Gemini availability.

The liquid-glass menu and checkout retain the cream/rust palette. Starting the microphone brings its panel to the foreground on phones, tablets and desktops; “Back to menu” docks it without stopping recognition. The Bomb Squad intro is visible in the initial HTML and can be reopened with “Replay intro”. The HTTP regression check verifies the initial intro markup.
