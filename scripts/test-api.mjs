import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
// The welcome screen must exist and be visible in the initial HTML, before hydration.
const home = await fetch(base);
assert.equal(home.status,200);
const html = await home.text();
const welcome = html.match(/<dialog[^>]*class="welcome"[^>]*>/)?.[0];
assert.ok(welcome && /\sopen(?:=|\s|>)/.test(welcome),'Intro must be open in server-rendered HTML');
let cookie;
async function call(path, method='GET', body, status=200) {
  const r = await fetch(base+path,{method,headers:{'content-type':'application/json',...(cookie?{cookie}:{})},body:body?JSON.stringify(body):undefined});
  cookie ||= r.headers.get('set-cookie')?.split(';')[0];
  const data = await r.json(); assert.equal(r.status,status,JSON.stringify(data)); return data;
}
await call('/api/interpret');
const id=crypto.randomUUID();
const body={id,table:'API test',confirmed:true,cart:[{id:'margherita',qty:1},{id:'garlic',qty:1}],total:1};
await call('/api/orders','POST',{...body,confirmed:false},400);
const {order}=await call('/api/orders','POST',body);
assert.equal(order.total,248);
assert.equal((await call('/api/orders','POST',body)).order.id,id);
assert.equal((await call('/api/orders')).orders.filter(o=>o.id===id).length,1);
for(const status of ['Preparing','Ready','Completed']) assert.equal((await call('/api/orders','PATCH',{id,status})).order.status,status);
const sizedId=crypto.randomUUID();
const sizedBody={id:sizedId,table:'Size API test',confirmed:true,cart:[{id:'margherita-medium',qty:1,price:1},{id:'farmhouse-large',qty:2,price:1}],total:3};
assert.equal((await call('/api/orders','POST',sizedBody)).order.total,1047);
assert.equal((await call('/api/orders','POST',sizedBody)).order.id,sizedId);
await call('/api/orders','POST',{...sizedBody,id:crypto.randomUUID(),cart:[{id:'margherita-extra-large',qty:1}]},400);
for(const status of ['Preparing','Ready','Completed']) await call('/api/orders','PATCH',{id:sizedId,status});
cookie=undefined;
assert.ok(!(await call('/api/orders')).orders.some(o=>[id,sizedId].includes(o.id)));
console.log('API checks passed: confirmation, original and variant server prices, invalid variants, duplicate protection, kitchen updates and browser isolation. Test tickets retained as Completed.');
