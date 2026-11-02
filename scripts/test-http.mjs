import assert from 'node:assert/strict';
import {readJsonResponse} from '../lib/http-json.mjs';
assert.deepEqual(await readJsonResponse(Response.json({configured:true})),{configured:true});
for(const status of [200,502,503]) await assert.rejects(()=>readJsonResponse(new Response('<!DOCTYPE html><title>Private proxy detail</title>',{status})),error=>error.message.includes(`HTTP ${status}`)&&!error.message.includes('<')&&!error.message.includes('Private proxy'));
for(const value of [null,[],false]) await assert.rejects(()=>readJsonResponse(Response.json(value)),/invalid response/);
console.log('JSON transport checks passed for JSON, HTML proxy pages and invalid bodies.');
