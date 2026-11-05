# Submission recording: 60–90 seconds

Use Chrome on the deployed HTTPS site. Open it once before recording so Render has time to wake up. Allow microphone permission and choose the speech language that matches your voice. Record the actual interaction; payments are simulated.

1. Show the Bomb Squad intro, then click **Step inside**. The centered mic starts listening and the menu stays visible on both sides on desktop.
2. Say **“one farmhouse and garlic bread”**. The size popup shows the draft and fixed-size garlic bread.
3. Say **“medium”**. Review opens automatically: **₹368**.
4. Say **“add one lemonade”**: **₹437**. Then **“remove garlic bread”**: **₹338**.
5. Say **“change size”**, then **“large”**. The pizza changes size without duplicating it: **₹468**.
6. Say **“confirm”**. Once browser recognition finalizes that word, submission starts without the extra phrase delay. No money is collected.
7. Show the centered microphone still listening. Open **Kitchen** to show the ticket.

These exact menu commands do not require Gemini interpretation. Browser speech recognition and the order server still need connectivity. Free-form English/Hindi/Hinglish requests use Gemini and depend on provider availability. After confirmation, further items start a new cart; they do not alter the submitted ticket.

If recognition mishears a word, show the transcript and correct it before confirmation. Typed commands and menu controls remain available. Pending size choices block confirmation; cancelling a draft leaves the previous cart untouched.

If voice stops, read the error code shown in the voice panel. For `network`, try a stable connection and restart after automatic retries finish. For `not-allowed` or `audio-capture`, check both browser microphone permission and your system input/privacy settings; recording software may also be holding the device. For `service-not-allowed`, try opening the HTTPS site directly in Chrome. These errors belong to browser speech recognition, so changing Gemini/NVIDIA keys will not fix them. Typing and menu controls preserve the same ordering flow.
