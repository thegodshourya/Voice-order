import {menu,addItem} from './order-engine.mjs';
import {pizzaRequest} from './pizza-choice.mjs';
const counts={a:1,an:1,one:1,two:2,three:3,four:4,five:5};
const aliases={garlic:'garlic', 'garlic bread':'garlic',lemonade:'lemon',lemon:'lemon',wedges:'wedges','potato wedges':'wedges',brownie:'brownie','chocolate brownie':'brownie',dip:'dip','garlic dip':'dip','cheese pot':'cheese','extra cheese pot':'cheese','roasted pepper pot':'peppers'};
// A narrow whole-utterance grammar; unknown, negative or ambiguous speech goes to AI.
export function simpleOrder(text,cart){
 const value=text.toLowerCase().trim().replace(/[.!?]/g,'').replace(/\b(?:form house|farm house)\b/g,'farmhouse').replace(/corn and cheese/g,'corn & cheese');
 const remove=value.match(/^(?:remove|delete) (.+)$/);
 if(remove){if(/^(?:\d+|a|an|one|two|three|four|five)\s/.test(remove[1]))return null;const pizza=pizzaRequest(remove[1]);const id=aliases[remove[1]];if(!id&&(!pizza||pizza.qty!==1))return null;const rows=cart.filter(row=>id?row.id===id:menu.find(m=>m.id===row.id)?.productId===pizza.productId&&(!pizza.size||menu.find(m=>m.id===row.id)?.size===pizza.size));if(rows.length!==1)return null;return {cart:cart.filter(row=>row.id!==rows[0].id),sizeRequests:[]};}
 let chunks=value.split(/\s*(?:,|\band\b|\bplus\b)\s*/);
 if(chunks.length===1){const end=value.match(/^(.+?)\s+((?:(?:\d+|a|an|one|two|three|four|five)\s+)?(?:garlic bread|lemonade))$/);if(end&&pizzaRequest(end[1]))chunks=[end[1],end[2]];}
 const requests=[];let next=cart;
 for(const chunk of chunks){
  const pizza=pizzaRequest(chunk);
  if(pizza){if(pizza.size){const item=menu.find(m=>m.productId===pizza.productId&&m.size===pizza.size);next=addItem(next,item.id,pizza.qty);}else{const existing=requests.find(r=>r.productId===pizza.productId);if(existing)existing.qty+=pizza.qty;else requests.push({productId:pizza.productId,qty:pizza.qty});}continue;}
  const match=chunk.match(/^(?:(?:add|i want|give me)\s+)?(?:(\d+|a|an|one|two|three|four|five)\s+)?(.+?)(?:\s+please)?$/);
  const id=match&&aliases[match[2]],qty=match?.[1]?(counts[match[1]]??Number(match[1])):1;
  if(!id||!Number.isInteger(qty)||qty<1||qty>20)return null;
  next=addItem(next,id,qty);
 }
 if(requests.some(r=>r.qty>20))throw Error('Maximum quantity is 20 per item.');
 return {cart:next,sizeRequests:requests};
}
