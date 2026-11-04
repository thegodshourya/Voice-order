import {voiceCommand} from './voice-commands.mjs';
// Browser recognition may finalize one sentence in several separate results.
// Submit only stable, finalized text; interim words are a preview, never payment intent.
export function createSpeechBuffer({onCommit, onPreview, onUnclear, delay = 1800}) {
  let parts = [], interim = '', consumed = 0, speaking = false, timer;
  const clearTimer = () => { clearTimeout(timer); timer = undefined; };
  const preview = () => [...parts, interim].filter(Boolean).join(' ').trim();
  function cancel() { clearTimer(); parts = []; interim = ''; onPreview(''); }
  function settle() {
    if (timer !== undefined || !preview() || speaking) return;
    timer = setTimeout(() => {
      const text = preview();
      const incomplete = !!interim || /^(?:(?:i want|give me|add|please|एक|दो)\s+)?(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|a|an|ek|do|teen|एक|दो|तीन)[.!?]?$/i.test(text);
      cancel();
      if (incomplete) onUnclear(text);
      else onCommit(text);
    }, delay);
  }
  return {
    startSession() { consumed = 0; },
    speechStart() { speaking = true; clearTimer(); },
    speechEnd() { speaking = false; settle(); },
    result(event) {
      clearTimer(); interim = '';
      for (let i = consumed; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript.trim();
        if (result.isFinal) { if (text) parts.push(text); consumed = i + 1; }
        else interim += (interim ? ' ' : '') + text;
      }
      onPreview(preview());
      const text=preview();
      // Only an entire finalized confirmation bypasses the phrase delay.
      // Never extract "confirm" from a negative, interim, or combined order.
      if(!interim&&['confirm','confirm-upi','confirm-card'].includes(voiceCommand(text))){cancel();onCommit(text);return;}
      settle();
    },
    cancel,
    hasPending: () => !!preview(),
  };
}
