# VoiceOrder

Round 2 prototype for Build The AI For YOU. React / Vinext, server-validated carts, Cloudflare D1 kitchen orders, optional Gemini interpretation and browser speech recognition.

## Current status

Menu, cart corrections, review/confirmation, server pricing, persistent user-scoped kitchen tickets and fulfilment status are implemented. Speech recognition is browser-dependent and fills a reviewable text box. Without a server-side GEMINI_API_KEY, the app explicitly runs guided commands, not AI interpretation. The AI route is implemented but needs a real service key and live evaluation before it can be claimed as tested. No real payments, POS integration or food fulfilment.

## Run

Install with the Sites dependency helper or pnpm install. Run pnpm dev. Use pnpm build for production. Set the D1 binding DB and apply the generated drizzle migration through the hosting workflow. Local D1 instructions: build once, then use wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_curly_infant_terrible.sql. Only apply each migration once per database. Orders require the hosted ChatGPT identity headers and are scoped to that identity.

## Check

node scripts/test-orders.mjs

The runnable check covers cart totals, corrections, removal, unavailable/unknown products, invalid quantities and duplicate items. Type checking: pnpm exec tsc --noEmit.

## Walkthrough

Use add 2 margherita, set margherita to 1, then add 1 garlic. Total must be INR 248. Review before confirming. Kitchen should contain one Margherita and one Garlic Bread. Retrying the same confirmation ID must not create a second ticket. Try unavailable Cola and verify rejection. Kitchen status progresses through Queued, Preparing, Ready and Completed.

## AI configuration

Use server-only GEMINI_API_KEY and optional GEMINI_MODEL (default gemini-3.8-flash). Never put the key in a public variable or commit it. Implementation follows Google's Interactions API structured-output documentation: https://ai.google.dev/gemini-api/docs/structured-output . A schema does not guarantee semantic correctness: server code validates every returned item and quantity and owns pricing. Clarifications preserve the original cart. Test Hindi, English, Hinglish, negative requests, ambiguous corrections, background noise and unsupported modifiers before submission.

## Attribution

Built with AI coding assistance from ChatGPT/Codex. Open-source dependencies are listed in package.json. Gemini is an external model service when configured. Browser speech recognition may use the browser vendor's remote recognition service. Menu prices are illustrative, not a branded restaurant menu. No performance or commercial savings have been measured yet.
