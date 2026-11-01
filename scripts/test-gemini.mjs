import assert from 'node:assert/strict';
import { interpret } from '../lib/gemini.mjs';
const originalFetch = globalThis.fetch;
const cart = [{id:'margherita',qty:2}];
let result = {cart:[{id:'margherita',qty:1}],message:'Updated',clarify:false};
try {
  globalThis.fetch = async (url, options) => {
    assert.match(url, /gemini-2.5-flash:generateContent$/);
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
  assert.deepEqual(cart,[{id:'margherita',qty:2}]);
  console.log('Gemini contract checks passed with mocked responses; no live AI evaluation.');
} finally { globalThis.fetch=originalFetch; }
