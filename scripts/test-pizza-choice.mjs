import assert from 'node:assert/strict';
import {pizzaRequest,spokenSize,validateSizeRequests,applyPizzaSize} from '../lib/pizza-choice.mjs';
assert.deepEqual(pizzaRequest('add two medium farmhouse'),{productId:'farmhouse',qty:2,size:'medium',generic:false});
assert.equal(pizzaRequest('pizza').generic,true);assert.equal(pizzaRequest('one farmhouse').size,null);
assert.equal(spokenSize('midium'),'medium');assert.equal(spokenSize('large please'),'large');
for(const text of ['do not add pizza','remove one pizza','pizza and garlic bread','can I have pizza?','0 pizza','21 pizza','small pizza large'])assert.equal(pizzaRequest(text),null,text);
for(const text of ['not medium','medium or large','confirm with card'])assert.equal(spokenSize(text),null);
console.log('Pizza choice checks passed: explicit additions, quantity, sizes and safe ambiguous/negative handling.');

const cart=[{id:'farmhouse',qty:2},{id:'garlic',qty:1}];
const changed=applyPizzaSize(cart,{productId:'farmhouse',qty:2,replaceId:'farmhouse'},'large');
assert.deepEqual(changed,[{id:'garlic',qty:1},{id:'farmhouse-large',qty:2}]);
assert.deepEqual(cart,[{id:'farmhouse',qty:2},{id:'garlic',qty:1}]);
assert.throws(()=>validateSizeRequests([{productId:'garlic',qty:1}],cart));
assert.throws(()=>applyPizzaSize(cart,{productId:'farmhouse',qty:1,replaceId:'farmhouse'},'large'));
assert.throws(()=>applyPizzaSize(cart,{productId:'farmhouse',qty:2,replaceId:'garlic'},'large'));
assert.throws(()=>applyPizzaSize([{id:'farmhouse-large',qty:20}],{productId:'farmhouse',qty:1},'large'));

const {simpleOrder}=await import('../lib/simple-order.mjs');
const mixed=simpleOrder('one form house garlic bread',[]);
assert.deepEqual(mixed,{cart:[{id:'garlic',qty:1}],sizeRequests:[{productId:'farmhouse',qty:1}]});
assert.deepEqual(simpleOrder('one farmhouse and two garlic bread',[]).cart,[{id:'garlic',qty:2}]);
assert.deepEqual(simpleOrder('remove garlic bread',cart).cart,[{id:'farmhouse',qty:2}]);
assert.equal(simpleOrder('remove farmhouse',[{id:'farmhouse',qty:1},{id:'farmhouse-large',qty:1}]),null);
for(const text of ['do not add garlic bread','one farmhouse but no garlic bread','confirm and garlic bread','one garlic bread and something else'])assert.equal(simpleOrder(text,cart),null,text);
assert.throws(()=>simpleOrder('add 2 garlic bread',[{id:'garlic',qty:20}]));
assert.deepEqual(cart,[{id:'farmhouse',qty:2},{id:'garlic',qty:1}]);

assert.equal(simpleOrder('remove one farmhouse',cart),null,'quantity removals need explicit interpretation');
