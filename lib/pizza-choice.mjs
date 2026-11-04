import {menu,validateCart,addItem} from './order-engine.mjs';
export function validateSizeRequests(requests,cart){
 if(!Array.isArray(requests)||requests.length>menu.length)throw Error('Invalid size choices.');
 const seen=new Set();
 return requests.map(r=>{
  const item=menu.find(m=>m.productId===r?.productId&&m.category==='Pizza'&&m.available);
  if(!item||!Number.isInteger(r.qty)||r.qty<1||r.qty>20)throw Error('Invalid size choices.');
  const key=r.productId+':'+(r.replaceId||'');if(seen.has(key))throw Error('Duplicate size choice.');seen.add(key);
  if(r.replaceId!=null){const old=cart.find(row=>row.id===r.replaceId);if(!old||old.qty!==r.qty||menu.find(m=>m.id===old.id)?.productId!==r.productId)throw Error('Invalid size replacement.');}
  return {productId:r.productId,qty:r.qty,...(r.replaceId?{replaceId:r.replaceId}:{})};
 });
}
export function applyPizzaSize(cart,selection,size){
 const valid=validateCart(cart);validateSizeRequests([selection],valid);
 const item=menu.find(m=>m.productId===selection.productId&&m.size===size);
 if(!item)throw Error('Choose small, medium or large.');
 return addItem(valid.filter(row=>row.id!==selection.replaceId),item.id,selection.qty);
}
// Only unambiguous, single-product additions are handled locally. Corrections,
// negations, questions and multi-item requests still go to the interpreter.
export function spokenSize(text) {
 const value=text.toLowerCase().trim().replace(/[.!?]/g,'').replace(/^(?:make it|the|size|choose|select) /,'').replace(/ (?:one|size|please)$/,'');
 return ({small:'small',regular:'small',medium:'medium',midium:'medium',large:'large',larze:'large'})[value]||null;
}
export function pizzaRequest(text) {
 const value=text.toLowerCase().trim().replace(/[.!?]/g,'');
 const match=value.match(/^(?:(?:add|i want|i would like|give me|order)\s+)?(?:(\d+|a|an|one|two|three|four|five)\s+)?(?:(small|regular|medium|midium|large|larze)\s+)?(margherita|farmhouse|farm house|corn(?: and cheese| & cheese)?|paneer(?: tikka)?|pepper(?: pizza)?|pizza)(?:\s+pizza)?(?:\s+(small|regular|medium|midium|large|larze))?(?:\s+please)?$/);
 if(!match)return null;
 const qty=match[1]?Number(match[1])||({a:1,an:1,one:1,two:2,three:3,four:4,five:5})[match[1]]:1;
 if(!Number.isInteger(qty)||qty<1||qty>20)return null;
 if(match[2]&&match[4]&&spokenSize(match[2])!==spokenSize(match[4]))return null;
 const productId=match[3]==='pizza'?'margherita':match[3].startsWith('farm')?'farmhouse':match[3].split(/ |&/)[0];
 return {productId,qty,size:spokenSize(match[2]||match[4]||''),generic:match[3]==='pizza'};
}
