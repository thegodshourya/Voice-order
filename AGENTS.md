# VoiceOrder continuation brief

Read README.md and docs/GEMINI_SETUP.md first. This is a normal Round 2 functional prototype, not a production restaurant platform. Preserve the proposed PPT experience and keep the scope narrow.

## Design to preserve
- Warm cream #F7F5EF, forest green #214F43, sage #E7ECE2, dark text #253D36.
- Customer interface: menu at left, visible conversation in the middle, editable cart at right on desktop. Stack sensibly on mobile.
- Conversation example: one medium Farmhouse, two regular Margheritas and garlic bread, followed by `Margherita ek kar do`. Highlight the corrected quantity in the cart.
- Kitchen interface: a clean confirmed ticket, table label, item quantities and preparation status.
- Calm typography, generous spacing and clear confirmation. Keep the existing visual direction. No payments, loyalty features, complex analytics, signup system, invented metrics or fake success claims.

## Existing implementation
React/Vinext on Cloudflare Workers. D1 binding DB stores user-scoped orders. GET/PATCH/POST /api/orders handle kitchen flow. POST /api/interpret calls Gemini only when GEMINI_API_KEY exists on the server. Otherwise the UI clearly says Guided mode and supports explicit add/set/remove commands. Native browser speech fills a reviewable transcript; a microphone button alone is not proof of speech accuracy.

## Immediate work
1. Configure Gemini securely and verify the API request/response format with the chosen available model.
2. Test Hindi, English and Hinglish corrections. Preserve cart on ambiguous or unsupported requests and provider failures.
3. Verify the full signed-in confirmation -> D1 -> kitchen flow on the deployed Site. That end-to-end backend test is still outstanding; browser UI tests established cart corrections and INR 248 total only. Preview API calls correctly required sign-in.
4. Keep server-owned prices, available-item checks, integer quantity limits, duplicate confirmation protection and explicit confirmation.
5. Improve review-dialog error visibility, keyboard focus containment, stale concurrent request handling and meaningful API tests before final submission.
6. Run node scripts/test-orders.mjs, pnpm exec tsc --noEmit and pnpm build. Report actual results, never claim live AI or microphone tests without running them.

Do not replace authentication or storage casually. The source .openai/hosting.json points to the existing Site; do not create another Site. Use its supported Sites workflow for redeployment. Pushing to this GitHub repository alone does not deploy the existing Site. Keep API keys and local credentials out of every commit. The final hackathon requires an accessible repo, working project, final presentation and a 2-minute demo. The current Site is owner-private; changing its audience requires the user's request.
