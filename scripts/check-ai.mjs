import {interpretOrder} from '../lib/ai-provider.mjs';
try {
 const result=await interpretOrder('Add one small Margherita',[]);
 console.log(JSON.stringify({provider:result.provider,fallback:result.fallback,cart:result.cart,clarify:result.clarify}));
}catch {console.error('Live provider check failed. Check configured model access, keys, quota and network. No credentials printed.');process.exitCode=1;}
