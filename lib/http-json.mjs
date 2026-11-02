// Hosting proxies can return an HTML wake-up/error page, even to an API request.
// Never render that page or expose its contents as a JavaScript parsing error.
export async function readJsonResponse(response, service = 'The server') {
  let data;
  try { data = JSON.parse(await response.text()); }
  catch { throw Error(`${service} returned an unreadable response (HTTP ${response.status}). It may be starting or temporarily unavailable. Please retry shortly.`); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw Error(`${service} returned an invalid response. Please retry shortly.`);
  }
  return data;
}
