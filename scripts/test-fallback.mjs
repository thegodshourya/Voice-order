import assert from 'node:assert/strict';
import {interpretOrder} from '../lib/ai-provider.mjs';
const original=globalThis.fetch,cart=[{id:'farmhouse',qty:1}],config={GEMINI_API_KEY:'test-gemini',NVIDIA_API_KEY:'test-nvidia',NVIDIA_ENABLED:'true',NVIDIA_MODEL:'test/chat-model'};
const result={cart:[...cart,{id:'garlic',qty:1}],message:'Garlic bread added.',clarify:false};
let urls=[],scenario='503';
try {
 globalThis.fetch=async(url,options)=>{
  urls.push(url);
  if(url.includes('googleapis')){
   if(scenario==='timeout')throw new DOMException('timeout','TimeoutError');
   if(scenario==='network')throw new TypeError('offline');
   if(scenario==='html')return new Response('<html>gateway page</html>');
   if(scenario==='null')return Response.json(null);
   if(scenario==='malformed')return Response.json({candidates:[{content:{parts:{text:'wrong shape'}}}]});
   if(scenario==='invalid-cart')return Response.json({candidates:[{content:{parts:[{text:JSON.stringify({...result,cart:[{id:'invented-pizza',qty:1}]})}]}}]});
   if(scenario==='success')return Response.json({candidates:[{content:{parts:[{text:JSON.stringify(result)}]}}]});
   return new Response('PRIVATE DETAIL',{status:Number(scenario)});
  }
  const body=JSON.parse(options.body);assert.equal(body.model,'test/chat-model');assert.equal(options.headers.Authorization,'Bearer test-nvidia');
  const user=JSON.parse(body.messages[1].content);assert.deepEqual(user.cart,cart);assert.equal(user.utterance,'add garlic bread');
  return Response.json({choices:[{message:{content:JSON.stringify(result)}}]});
 };
 for(scenario of ['503','429','timeout','network','html','null','malformed','invalid-cart']){urls=[];const d=await interpretOrder('add garlic bread',cart,[],config);assert.equal(d.provider,'nvidia');assert.equal(d.fallback,true);assert.deepEqual(d.cart,result.cart);assert.equal(urls.length,2);}
 scenario='success';urls=[];assert.equal((await interpretOrder('add garlic bread',cart,[],config)).provider,'gemini');assert.equal(urls.length,1);
 urls=[];assert.equal((await interpretOrder('add garlic bread',cart,[],{...config,NVIDIA_ENABLED:undefined})).provider,'gemini');assert.equal(urls.length,1);
 scenario='429';urls=[];await assert.rejects(()=>interpretOrder('add garlic bread',cart,[],{...config,NVIDIA_ENABLED:'false'}),/quota/);assert.equal(urls.length,1);
 urls=[];await assert.rejects(()=>interpretOrder('add garlic bread',cart,[],{NVIDIA_ENABLED:'true',NVIDIA_API_KEY:'test-nvidia'}),/NVIDIA_MODEL/);assert.equal(urls.length,0);
 scenario='401';urls=[];await assert.rejects(()=>interpretOrder('add garlic bread',cart,[],config),e=>!e.message.includes('PRIVATE'));assert.equal(urls.length,1);
 urls=[];await assert.rejects(()=>interpretOrder('',cart,[],config));assert.equal(urls.length,0);
 urls=[];assert.equal((await interpretOrder('add garlic bread',cart,[],{NVIDIA_API_KEY:'test-nvidia',NVIDIA_ENABLED:'true',NVIDIA_MODEL:'test/chat-model'})).fallback,false);assert.equal(urls.length,1);
 globalThis.fetch=async()=>new Response('<html>private</html>',{status:503});await assert.rejects(()=>interpretOrder('add garlic bread',cart,[],config),/cart has not changed/);
 globalThis.fetch=async()=>Response.json({choices:[{message:{content:JSON.stringify({cart:[{id:'fake',qty:1}],message:'oops',clarify:false})}}]});await assert.rejects(()=>interpretOrder('add garlic bread',cart,[],{NVIDIA_API_KEY:'test-nvidia',NVIDIA_ENABLED:'true',NVIDIA_MODEL:'test/chat-model'}),/Invalid AI response/);
 assert.deepEqual(cart,[{id:'farmhouse',qty:1}]);console.log('Fallback checks passed: Gemini success, transient/timeout/network/quota fallback, auth exclusion, NVIDIA-only, validation and both-provider failure.');
}finally{globalThis.fetch=original;}
