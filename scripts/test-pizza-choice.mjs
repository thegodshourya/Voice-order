import assert from 'node:assert/strict';
import {pizzaRequest,spokenSize} from '../lib/pizza-choice.mjs';
assert.deepEqual(pizzaRequest('add two medium farmhouse'),{productId:'farmhouse',qty:2,size:'medium',generic:false});
assert.equal(pizzaRequest('pizza').generic,true);assert.equal(pizzaRequest('one farmhouse').size,null);
assert.equal(spokenSize('midium'),'medium');assert.equal(spokenSize('large please'),'large');
for(const text of ['do not add pizza','remove one pizza','pizza and garlic bread','can I have pizza?','0 pizza','21 pizza','small pizza large'])assert.equal(pizzaRequest(text),null,text);
for(const text of ['not medium','medium or large','confirm with card'])assert.equal(spokenSize(text),null);
console.log('Pizza choice checks passed: explicit additions, quantity, sizes and safe ambiguous/negative handling.');
