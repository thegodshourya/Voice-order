import assert from 'node:assert/strict';
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
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
cookie=undefined;
assert.ok(!(await call('/api/orders')).orders.some(o=>o.id===id));
console.log('API checks passed: confirmation, server pricing, duplicate protection, kitchen updates and browser isolation. Test ticket retained as Completed.');
