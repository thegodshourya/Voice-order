import assert from 'node:assert/strict';import {menu,guided,total,validateCart} from '../lib/order-engine.mjs';
let c=guided('add 2 margherita',[]);c=guided('add 1 garlic',c);c=guided('set margherita to 1',c);assert.equal(total(c),248);assert.equal(c[0].qty,1);assert.equal(guided('remove garlic',c).length,1);
for(const bad of [[{id:'cola',qty:1}],[{id:'margherita',qty:-1}],[{id:'margherita',qty:1.5}],[{id:'fake',qty:1}],[{id:'garlic',qty:1},{id:'garlic',qty:2}]])assert.throws(()=>validateCart(bad));
assert.throws(()=>guided('add 1 garlic and 2 margherita',c));assert.throws(()=>guided('margherita ek kar do',c));assert.equal(menu.length,14);console.log('Order checks passed: corrections, totals, removal, invalid quantities/items, duplicates and safe guided fallback.');

assert.equal(total([{id:"combo",qty:1},{id:"cheese",qty:1}]),228);
