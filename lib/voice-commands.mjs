// Explicit checkout commands stay local; never infer confirmation from an order.
export function voiceCommand(text) {
  const value = text.toLowerCase().trim().replace(/[.!?,]/g, '').replace(/\s+/g, ' ').replace(/u\s+p\s+i/g, 'upi');
  if (/^(review (my )?(order|cart)|open (my )?cart|done|checkout|that's all|thats all|बस|बस हो गया)$/.test(value)) return 'review';
  if (/^(skip extras|no extras|no thanks|continue to checkout)$/.test(value)) return 'skip';
  if (/^(confirm cart|continue|next)$/.test(value)) return 'next';
  if (/^(edit cart|back to cart)$/.test(value)) return 'edit';
  if (/^(close checkout|back to menu)$/.test(value)) return 'close';
  if (/^(stop listening|pause listening|pause microphone)$/.test(value)) return 'pause';
  if (/^confirm (with |using )?upi$/.test(value)) return 'confirm-upi';
  if (/^confirm (with |using )?(credit )?card$/.test(value)) return 'confirm-card';
  if (/^(upi|use upi)$/.test(value)) return 'upi';
  if (/^((credit )?card|use (credit )?card)$/.test(value)) return 'card';
  return null;
}
