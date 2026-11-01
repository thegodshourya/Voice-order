// Run from the project root: node --env-file=.env.local scripts/check-gemini.mjs
// Sends one small live request using the same schema as the app. Never prints the key.
import { interpret } from '../lib/gemini.mjs';

const key = process.env.GEMINI_API_KEY?.trim();
if (!key) {
  console.error('GEMINI_API_KEY is missing from .env.local.');
  process.exit(1);
}

const originalFetch = globalThis.fetch;
const started = Date.now();
console.log('Sending one Gemini request; allowing up to 60 seconds for a response...');
globalThis.fetch = async (...args) => {
  const response = await originalFetch(...args);
  console.log(`Gemini HTTP status: ${response.status}`);
  if (!response.ok) {
    const body = await response.clone().json().catch(() => ({}));
    const message = String(body.error?.message || 'No error description returned.')
      .replaceAll(key, '[REDACTED]')
      .replace(/AIza[\w-]+/g, '[REDACTED]')
      .replace(/https?:\/\/\S+/g, '[link omitted]')
      .slice(0, 1500);
    console.log(`Google error: ${message}`);
  }
  return response;
};

try {
  const result = await interpret('Add one Margherita', [], key, process.env.GEMINI_MODEL);
  console.log('Gemini returned a valid order response:', JSON.stringify(result));
} catch (error) {
  console.error(String(error.message).replaceAll(key, '[REDACTED]'));
  process.exitCode = 1;
} finally {
  console.log(`Elapsed: ${((Date.now() - started) / 1000).toFixed(1)} seconds`);
  globalThis.fetch = originalFetch;
}
