import {interpret} from './gemini.mjs';
import {orderRequest,orderResult,providerError} from './ai-contract.mjs';
import {readJsonResponse} from './http-json.mjs';

export async function interpretNvidia(text,cart,key,model='meta/llama-3.3-70b-instruct',history=[]) {
 const request=orderRequest(text,cart,history);
 let response;
 try {
  response=await fetch('https://integrate.api.nvidia.com/v1/chat/completions',{
   method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},
   body:JSON.stringify({model,temperature:0,max_tokens:1600,stream:false,response_format:{type:'json_object'},messages:[
    {role:'system',content:request.instruction+' Return only a JSON object matching this schema: '+JSON.stringify(request.schema)},
    {role:'user',content:JSON.stringify({cart:request.cart,conversation:request.conversation,utterance:text})}
   ]}),signal:AbortSignal.timeout(20000)
  });
 }catch {throw providerError('NVIDIA could not respond in time. Your cart has not changed. Please retry.',true);}
 if(!response.ok)throw providerError(`NVIDIA is unavailable (HTTP ${response.status}). Check its model access, key or quota. Your cart has not changed.`,response.status===429||response.status>=500);
 let data;try{data=await readJsonResponse(response,'NVIDIA');}catch{throw providerError('NVIDIA returned an unreadable response. Your cart has not changed.',true);}
 return orderResult(data?.choices?.[0]?.message?.content,request.cart);
}

export async function interpretOrder(text,cart,history=[],config=process.env) {
 // Validate the customer request before either provider can receive it.
 orderRequest(text,cart,history);
 const gemini=config.GEMINI_API_KEY?.trim(),nvidia=config.NVIDIA_API_KEY?.trim();
 if(!gemini&&!nvidia)throw providerError('AI is not configured. Use menu controls or guided commands.');
 if(gemini) {
  try {return {...await interpret(text,cart,gemini,config.GEMINI_MODEL,history,nvidia?{timeoutMs:12000,retryTransient:false}:{}),provider:'gemini',fallback:false};}
  catch(error) {if(!nvidia||!error.retryable)throw error;}
 }
 return {...await interpretNvidia(text,cart,nvidia,config.NVIDIA_MODEL,history),provider:'nvidia',fallback:!!gemini};
}
