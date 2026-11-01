import assert from 'node:assert/strict';
import { interpret } from '../lib/gemini.mjs';
const originalFetch = globalThis.fetch;
const cart = [{id:'margherita',qty:2}];
let result = {cart:[{id:'margherita',qty:1}],message:'Updated',clarify:false};
try {
  globalThis.fetch = async (url, options) => {
    assert.match(url, /gemini-3.8-flash:generateContent$/);
    const request = JSON.parse(options.body);
    assert.equal(request.generationConfig.responseMimeType,'application/json');
    assert.equal(JSON.parse(request.contents[0].parts[0].text).utterance,'Margherita ek kar do');
    return Response.json({candidates:[{content:{parts:[{text:JSON.stringify(result)}]}}]});
  };
  const run=()=>interpret('Margherita ek kar do',cart,'test-only');
  assert.equal((await run()).cart[0].qty,1);
  result={cart:[],message:'Which item?',clarify:true};
  assert.deepEqual((await run()).cart,cart);
  result={cart:[{id:'cola',qty:1}],message:'Bad item',clarify:false};
  await assert.rejects(run);
  globalThis.fetch=async()=>new Response('Unavailable',{status:503});
  await assert.rejects(run,/cart has not changed/);
  for (const [status, message] of [[400, /rejected the request/], [401, /API key/], [403, /access is denied/], [404, /model is unavailable/], [429, /quota or rate limit/]]) {
    globalThis.fetch=async()=>Response.json({error:{message:'PRIVATE PROVIDER DETAIL'}},{status});
    await assert.rejects(run,error=>message.test(error.message)&&!error.message.includes('PRIVATE PROVIDER DETAIL'));
  }
  globalThis.fetch=async()=>Response.json({error:{details:[{reason:'API_KEY_INVALID'}]}},{status:400});
  await assert.rejects(run,/rejected the API key/);
  globalThis.fetch=async()=>{throw new DOMException('Timed out','TimeoutError');};
  await assert.rejects(run,/within 60 seconds.*cart has not changed/);
  globalThis.fetch=async()=>{throw new TypeError('fetch failed');};
  await assert.rejects(run,/Could not reach Gemini.*cart has not changed/);
  assert.deepEqual(cart,[{id:'margherita',qty:2}]);
  console.log('Gemini contract checks passed with mocked responses; no live AI evaluation.');
} finally { globalThis.fetch=originalFetch; }
