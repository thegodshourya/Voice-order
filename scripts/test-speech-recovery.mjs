import assert from 'node:assert/strict';
import {speechFailure} from '../lib/speech-recovery.mjs';
for(const code of ['network','aborted','start-failed','phrases-not-supported']){
 const delays=[];
 for(let attempts=0;attempts<5;attempts++){
  const result=speechFailure(code,attempts);
  if(attempts<3){assert.equal(result.retry,true);delays.push(result.delay);}
  else {assert.equal(result.retry,false);assert.match(result.message,/cart is saved/);}
 }
 assert.deepEqual(delays,[1000,2000,4000]);
}
for(const code of ['not-allowed','audio-capture','service-not-allowed','language-not-supported']){
 const result=speechFailure(code);assert.equal(result.retry,false);assert.ok(result.message.includes(code));assert.match(result.message,/type or use the menu/);
}
assert.equal(speechFailure('<untrusted>').message.includes('<untrusted>'),false);
console.log('Speech recovery policy passed: three bounded retries, increasing delays, distinct permanent errors and safe unknown codes.');
