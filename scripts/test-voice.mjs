import assert from 'node:assert/strict';
import {voiceCommand} from '../lib/voice-commands.mjs';
for(const [text,expected] of [['Review my order.','review'],['skip extras','skip'],['Confirm with U P I!','confirm-upi'],['confirm with credit card','confirm-card'],['UPI','upi'],['card','card'],['pause listening','pause'],['confirm','confirm'],['confirm my order','confirm'],['change size','sizes']]) assert.equal(voiceCommand(text),expected);
for(const text of ['do not confirm with card','can I confirm with UPI','add one pizza and confirm with card','no card','do not confirm','confirm after adding pizza']) assert.equal(voiceCommand(text),null);
console.log('Local voice command checks passed, including negative and ambiguous confirmation.');
