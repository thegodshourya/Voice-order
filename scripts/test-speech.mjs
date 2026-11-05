import assert from 'node:assert/strict';
import {mock} from 'node:test';
import {createSpeechBuffer} from '../lib/speech-buffer.mjs';
mock.timers.enable({apis:['setTimeout']});
const sent=[],unclear=[],previews=[];
const buffer=createSpeechBuffer({onCommit:t=>sent.push(t),onUnclear:t=>unclear.push(t),onPreview:t=>previews.push(t)});
const event=(...parts)=>({results:parts.map(([transcript,isFinal=true])=>Object.assign([{transcript}],{isFinal}))});
try {
 buffer.startSession();buffer.result(event(['one']));mock.timers.tick(700);
 buffer.result(event(['one'],['farm house',false]));mock.timers.tick(700);
 assert.equal(previews.at(-1),'one farm house');assert.deepEqual(sent,[]);
 buffer.result(event(['one'],['farmhouse']));mock.timers.tick(1800);
 assert.deepEqual(sent,['one farmhouse']);
 buffer.result(event(['one'],['farmhouse']));mock.timers.tick(1800);assert.equal(sent.length,1,'repeated final results are not resent');
 buffer.startSession();buffer.result(event(['one']));buffer.speechEnd();mock.timers.tick(400);buffer.startSession();buffer.result(event(['farmhouse']));mock.timers.tick(1800);assert.equal(sent.at(-1),'one farmhouse');
 buffer.startSession();buffer.result(event(['two']));mock.timers.tick(1800);assert.equal(unclear.at(-1),'two');
 buffer.startSession();buffer.result(event(['confirm with card',false]));buffer.speechEnd();mock.timers.tick(1800);assert.equal(unclear.at(-1),'confirm with card');assert.equal(sent.length,2);
 buffer.startSession();buffer.speechStart();buffer.result(event(['one farmhouse']));mock.timers.tick(10000);assert.equal(sent.length,2);buffer.speechEnd();mock.timers.tick(1800);assert.equal(sent.length,3);
 buffer.startSession();buffer.result(event(["don't"]));buffer.result(event(["don't"],['confirm with card']));mock.timers.tick(1800);assert.equal(sent.at(-1),"don't confirm with card");
 buffer.startSession();buffer.result(event(['one pizza']));buffer.cancel();mock.timers.tick(1800);assert.equal(sent.length,4);
 buffer.startSession();buffer.result(event(['one farmhouse']));mock.timers.tick(1000);buffer.speechEnd();mock.timers.tick(500);buffer.speechEnd();mock.timers.tick(300);assert.equal(sent.length,5,'repeated end events must not postpone submission');
 buffer.startSession();buffer.result(event(['confirm',false]));assert.equal(sent.length,5);buffer.result(event(['confirm']));assert.equal(sent.length,6,'final confirmation must not wait for timer');assert.equal(sent.at(-1),'confirm');mock.timers.tick(1800);assert.equal(sent.length,6);
 buffer.result(event(['confirm']));assert.equal(sent.length,6,'repeated final confirmation is deduplicated');
 buffer.startSession();buffer.result(event(['one pizza'],['confirm']));assert.equal(sent.length,6,'never confirm while another phrase is pending');buffer.cancel();
 buffer.startSession();buffer.speechStart();buffer.result(event(['confirm',false]));buffer.cancel();buffer.startSession();buffer.result(event(['farmhouse']));mock.timers.tick(1800);assert.equal(sent.at(-1),'farmhouse','cancel must clear interrupted speech state and confirmation fragments');
 console.log('Speech buffer checks passed: split phrases, live interim preview, restarts, deduplication, incomplete quantities, no interim confirmation, speech pauses and cancellation.');
} finally {mock.timers.reset();}
