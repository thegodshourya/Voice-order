'use client';
import {useEffect,useRef,useState} from 'react';
import {Mic,ArrowUp,Plus,ShoppingBag,ChefHat,Check,ArrowRight,Volume2,X} from 'lucide-react';
import {readJsonResponse} from '@/lib/http-json.mjs';
import {createSpeechBuffer} from '@/lib/speech-buffer.mjs';
import {voiceCommand} from '@/lib/voice-commands.mjs';
import {menu,guided,total,validateCart} from '@/lib/order-engine.mjs';
type Row={id:string;qty:number};type Ticket={id:string;table:string;cart:string;total:number;status:string;createdAt:number};
export default function Home(){
const autoReviewTimer=useRef<ReturnType<typeof setTimeout>|null>(null),autoReviewAllowed=useRef(false),speechActive=useRef(false),reviewOpen=useRef(false);
const [voiceFocus,setVoiceFocus]=useState(false),[expanded,setExpanded]=useState(false),[intro,setIntro]=useState(true);
const welcome=useRef<HTMLDialogElement>(null);
const speechBuffer=useRef<ReturnType<typeof createSpeechBuffer>|null>(null);
const [liveTranscript,setLiveTranscript]=useState('');
const voiceEpoch=useRef(0),restartTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
const [heard,setHeard]=useState(''),[voiceNotice,setVoiceNotice]=useState('');
const [connection,setConnection]=useState('checking');
const [payment,setPayment]=useState('UPI');
const dialog=useRef<HTMLDialogElement>(null),voiceOn=useRef(false),sendRef=useRef<(text:string)=>Promise<void>>(async()=>{}),queue=useRef(Promise.resolve()),processing=useRef(false);
const [view,setView]=useState('Order'),[category,setCategory]=useState('All'),[cart,setCart]=useState<Row[]>([]),[input,setInput]=useState(''),[configured,setConfigured]=useState(false),[busy,setBusy]=useState(false),[listening,setListening]=useState(false),[language,setLanguage]=useState('en-IN'),[table,setTable]=useState('Table 07'),[tickets,setTickets]=useState<Ticket[]>([]),[error,setError]=useState(''),[review,setReview]=useState(false),[success,setSuccess]=useState('');
const [messages,setMessages]=useState([{role:'assistant',text:'What would you like? Try “one farmhouse and a garlic bread.”'}]);
reviewOpen.current=review;
const pending=useRef<string|null>(null),submitting=useRef(false),recognition=useRef<any>(null),bottom=useRef<HTMLDivElement>(null),latest=useRef<Row[]>([]);
function change(c:Row[]){const valid=validateCart(c);setCart(valid);latest.current=valid;pending.current=null;setSuccess('');}
async function refresh(){try{const r=await fetch('/api/orders');const d:any=await readJsonResponse(r);if(!r.ok)throw Error(d.error);setTickets(d.orders);}catch(e){setError((e as Error).message);}}
async function checkConnection(){setConnection('checking');try{const r=await fetch('/api/interpret',{cache:'no-store',signal:AbortSignal.timeout(30000)});const d=await readJsonResponse(r);if(!r.ok)throw Error(d.error||'Connection check failed.');setConfigured(d.configured);setConnection(d.configured?'configured':'missing');setError('');}catch(e){setConnection('error');setError((e as Error).message);}}
useEffect(()=>{checkConnection();return ()=>{speechBuffer.current?.cancel();cancelAutoReview();voiceOn.current=false;voiceEpoch.current++;if(restartTimer.current)clearTimeout(restartTimer.current);recognition.current?.abort();};},[]);
useEffect(()=>{if(view==='Kitchen'){refresh();const timer=setInterval(refresh,6000);return ()=>clearInterval(timer);}},[view]);
useEffect(()=>{const box=bottom.current?.parentElement;if(box)box.scrollTo({top:box.scrollHeight,behavior:'smooth'});},[messages]);
// Keep the SSR open attribute static; removing it via React can leave modal inertness behind.
useEffect(()=>{const node=welcome.current;if(!node)return;if(intro){if(node.open)node.close();node.showModal();}else node.close();},[intro]);
useEffect(()=>{const previous=document.body.style.overflow;if(review)dialog.current?.showModal();else dialog.current?.close();if(review||intro)document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};},[review,intro]);
function cancelAutoReview(){if(autoReviewTimer.current)clearTimeout(autoReviewTimer.current);autoReviewTimer.current=null;}
function scheduleAutoReview(){
 if(autoReviewTimer.current||!autoReviewAllowed.current||!voiceOn.current||reviewOpen.current)return;
 autoReviewTimer.current=setTimeout(()=>{autoReviewTimer.current=null;if(autoReviewAllowed.current&&voiceOn.current&&!reviewOpen.current&&!speechActive.current&&!speechBuffer.current?.hasPending()&&!processing.current&&!submitting.current&&latest.current.length){openReview();setVoiceNotice('');}},3000);
}
function openReview(){cancelAutoReview();autoReviewAllowed.current=false;if(!latest.current.length){setError('Add an item before reviewing your order.');return;}reviewOpen.current=true;setReview(true);}
function say(text:string){setVoiceNotice(text);setMessages(m=>[...m,{role:'assistant',text}]);}
function quantity(id:string,delta:number){if(busy||submitting.current)return;const n=(cart.find(r=>r.id===id)?.qty??0)+delta;if(n>20){setError('Maximum quantity is 20 per item.');return;}change([...cart.filter(r=>r.id!==id),...(n>0?[{id,qty:n}]:[])]);setError('');}
function stopVoice(){speechBuffer.current?.cancel();speechActive.current=false;cancelAutoReview();autoReviewAllowed.current=false;setVoiceFocus(false);voiceOn.current=false;voiceEpoch.current++;if(restartTimer.current)clearTimeout(restartTimer.current);recognition.current?.abort();setListening(false);}
async function send(text=input){
 if(!text.trim()||processing.current||submitting.current)return;
 cancelAutoReview();autoReviewAllowed.current=false;setHeard(text);setError('');setInput('');
 const command=voiceCommand(text);
 if(command){
  if(command==='pause'){stopVoice();say('Voice paused.');return;}
  if(command==='review'){openReview();say('Check your items and total. Say confirm with UPI or confirm with card when ready.');return;}
  if(command==='close'){setReview(false);return;}
  if(!reviewOpen.current){openReview();say('Review your items first, then say confirm with UPI or confirm with card.');return;}
  if(command==='skip'){say('No extra items added. Say confirm with UPI or confirm with card.');return;}
  if(command==='edit'){say('Tell me what to change, or use the quantity buttons.');return;}
  if(command==='next'){say('Checkout is ready. Say confirm with UPI or confirm with card.');return;}
  if(command==='upi'||command==='card'){setPayment(command==='upi'?'UPI':'Credit card');say('Payment method selected. Say confirm with UPI or confirm with card to send the demo order.');return;}
  if(command==='confirm-upi'||command==='confirm-card'){setPayment(command==='confirm-upi'?'UPI':'Credit card');await confirm();return;}
 }
 if(connection==='checking'||connection==='error'){setError('The server may be waking up. Recheck the connection, then repeat your order.');return;}
 processing.current=true;setBusy(true);setMessages(m=>[...m,{role:'customer',text}]);
 try{
  if(configured){
   const r=await fetch('/api/interpret',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,cart:latest.current,history:messages.slice(-6)}),signal:AbortSignal.timeout(70000)});
   const d=await readJsonResponse(r);if(!r.ok)throw Error(d.error||'The server could not interpret this order.');
   if(typeof d.message!=='string'||typeof d.clarify!=='boolean')throw Error('The order response was incomplete. Please repeat your order.');if(!d.clarify){change(d.cart);autoReviewAllowed.current=true;}setConnection('verified');say(d.message);
  }else{change(guided(text,latest.current));autoReviewAllowed.current=true;say('Cart updated. Review the quantities before confirming.');}
 }catch(e){
  speechBuffer.current?.cancel();voiceEpoch.current++;if(configured)setConnection('failed');
  const problem=e as Error;
  const message=problem.name==='TimeoutError'?'The server took too long. Your cart is unchanged. Wait for it to wake up, then repeat your order.':problem instanceof TypeError?'Could not reach the server. Check your connection, then repeat your order.':problem.message;
  setError(message);say(message+' Any queued speech was cancelled; please repeat it.');
 }finally{processing.current=false;setBusy(false);scheduleAutoReview();}
}
sendRef.current=send;
function microphone(){
 if(voiceOn.current){stopVoice();return;}
 const R=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
 if(!R){setError('Voice is unavailable in this browser. Try Chrome or type your order.');return;}
 const r=new R();recognition.current=r;voiceEpoch.current++;voiceOn.current=true;setVoiceFocus(true);setExpanded(true);r.lang=language;r.interimResults=true;r.continuous=true;
 // Contextual biasing is optional; unsupported browsers keep their normal recognizer.
 const Phrase=(window as any).SpeechRecognitionPhrase;
 if(Phrase&&'phrases' in r)try{r.phrases=[...menu.filter(m=>m.available).map(m=>m.name),'farmhouse','margherita','paneer tikka','garlic bread'].map(name=>new Phrase(name,4));}catch{}
 const buffer=createSpeechBuffer({
  onPreview:(text:string)=>setLiveTranscript(text),
  onUnclear:(text:string)=>{autoReviewAllowed.current=false;cancelAutoReview();setHeard(text);say('I only caught “'+text+'”. Please repeat the full order, including the item name. Your cart is unchanged.');},
  onCommit:(text:string)=>{
   if(!voiceOn.current||recognition.current!==r)return;
   const epoch=voiceEpoch.current;
   queue.current=queue.current.catch(()=>{}).then(async()=>{
    await new Promise(resolve=>setTimeout(resolve,0));
    while((processing.current||submitting.current)&&voiceOn.current&&voiceEpoch.current===epoch)await new Promise(resolve=>setTimeout(resolve,50));
    if(voiceOn.current&&recognition.current===r&&voiceEpoch.current===epoch)await sendRef.current(text);
   });
  }
 });
 speechBuffer.current=buffer;
 r.onspeechstart=()=>{speechActive.current=true;cancelAutoReview();buffer.speechStart();};
 r.onspeechend=()=>{speechActive.current=false;buffer.speechEnd();scheduleAutoReview();};
 r.onstart=()=>{if(recognition.current===r){buffer.startSession();setListening(true);}};
 r.onend=()=>{if(recognition.current!==r)return;speechActive.current=false;buffer.speechEnd();scheduleAutoReview();setListening(false);if(voiceOn.current)restartTimer.current=setTimeout(()=>{if(voiceOn.current&&recognition.current===r)try{r.start();}catch{stopVoice();setError('Voice stopped. Tap Start voice ordering to resume.');}},400);};
 r.onerror=(e:any)=>{if(e.error==='no-speech'||e.error==='aborted')return;if(e.error==='phrases-not-supported'){r.phrases=[];return;}stopVoice();setError(e.error==='not-allowed'?'Allow microphone permission to start voice ordering.':'Voice connection interrupted. You can restart or type your order.');};
 r.onresult=(e:any)=>{
  if(!voiceOn.current||recognition.current!==r)return;
  cancelAutoReview();
  // Pause must remain immediate even when an interpretation request is in flight.
  for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal&&voiceCommand(e.results[i][0].transcript)==='pause'){stopVoice();say('Voice paused.');return;}
  buffer.result(e);
 };
 try{r.start();}catch{stopVoice();setError('Microphone could not start. Try typing instead.');}
}
async function confirm(){if(submitting.current||processing.current||!latest.current.length)return;if(!table.trim()){setError('Enter a table label before confirming.');return;}submitting.current=true;setBusy(true);setError('');try{pending.current??=Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:pending.current,cart:latest.current,table,confirmed:true}),signal:AbortSignal.timeout(30000)});const d:any=await readJsonResponse(r);if(!r.ok)throw Error(d.error);speechBuffer.current?.cancel();voiceEpoch.current++;cancelAutoReview();autoReviewAllowed.current=false;setVoiceFocus(false);setReview(false);setCart([]);latest.current=[];pending.current=null;setSuccess('Order '+d.order.id.slice(0,8)+' sent to the kitchen.');say('Your confirmed order is with the kitchen. Thank you!');}catch(e){setError((e as Error).message);}finally{submitting.current=false;setBusy(false);}}
async function status(t:Ticket,next:string){try{const r=await fetch('/api/orders',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:t.id,status:next})});const d:any=await readJsonResponse(r);if(!r.ok)throw Error(d.error);refresh();}catch(e){setError((e as Error).message);}}
return <main><dialog ref={welcome} open className="welcome" aria-labelledby="welcome-title" onCancel={()=>setIntro(false)}><div className="welcome-inner"><div className="sound-bars" aria-hidden="true">{[0,1,2,3,4].map(n=><span key={n} style={{animationDelay:`${n*.14}s`}}/>)}</div><p className="eyebrow">BOMB SQUAD PRESENTS</p><h1 id="welcome-title">Voice<span>Order.</span></h1><p>Your cravings. Your voice. Fresh from the oven.</p><button className="primary" onClick={()=>setIntro(false)}>Step inside <ArrowRight/></button><button className="welcome-voice" onClick={()=>{setIntro(false);microphone();}}><Mic size={17}/> Start with voice</button><button className="back" onClick={()=>setIntro(false)}>Skip intro</button></div></dialog><header><a className="brand" href="/"><span className="brandmark"><Volume2 size={22}/></span>VoiceOrder<span className="pilot">BY BOMB SQUAD</span></a><nav aria-label="Main navigation">{['Order','Kitchen'].map(v=><button key={v} onClick={()=>{stopVoice();setView(v);setError('');}} className={view===v?'active':''}>{v==='Kitchen'?<ChefHat size={17}/>:<ShoppingBag size={17}/>} {v}</button>)}</nav><div className="header-actions"><span className="outlet"><i/>Bomb Squad Kitchen</span><button className="replay-intro" onClick={()=>{stopVoice();setIntro(true);}}>Replay intro</button></div></header>
<div className="intro"><div><p className="eyebrow">BOMB SQUAD / {view==='Order'?'THE MENU':'THE KITCHEN'}</p><h1>{view==='Order'?<>The Bomb Squad<br/><em>menu.</em></>:<>Orders,<br/><em>coming right up.</em></>}</h1><p className="sub">{view==='Order'?'Pizzas from ₹149. Sides, drinks and a little extra.':'Confirmed orders from this browser. Ready when you are.'}</p></div>{view==='Order'&&<figure className="menu-cover"><img src="/food/pizza.jpg" alt="Illustrative freshly baked pizza" width="640" height="427"/><figcaption>PIZZA / SIDES / DRINKS</figcaption></figure>}</div>
{error&&<div role="alert" className="notice">{error} </div>}{success&&<div role="status" className="success"><Check size={18}/>{success}</div>}
{view==='Order'?<div className={'workspace '+(voiceFocus&&!review?'voice-focused':'')}>{voiceFocus&&!review&&<button className="voice-scrim" aria-label="Return to menu; keep listening" onClick={()=>setVoiceFocus(false)}/>}<section className="menu-panel"><div className="section-top"><h2>The menu</h2><span>Speak your order, or tap to add</span></div><div className="categories">{['All','Pizza','Offers','Sides','Toppings','Dessert','Drinks'].map(c=><button onClick={()=>setCategory(c)} key={c} className={category===c?'selected':''}>{c}</button>)}</div><div className="menu-list">{menu.filter(m=>category==='All'||m.category===category).map(m=><article className="menu-item" key={m.id}><div className="food-photo"><img src={'/food/'+(['margherita','farmhouse','corn','paneer','pepper','garlic','wedges','dip','peppers','cola'].includes(m.id)?m.id:m.id==='combo'?'margherita':m.category==='Drinks'?'lemonade':m.category==='Dessert'?'brownie':'cheese')+'.jpg'} alt={'Illustrative '+m.category.toLowerCase()+' photograph'} loading="lazy" width="640" height="420"/></div><div><div className="item-category">{m.category}{!m.available?' / SOLD OUT':''}</div><h3>{m.name}</h3><p>{m.description}</p><b>₹{m.price}</b></div><button aria-label={'Add '+m.name} disabled={!m.available||busy} onClick={()=>quantity(m.id,1)} className="add"><Plus size={18}/></button></article>)}</div><p className="fine">Illustrative food photography and demo prices. No payments or real restaurant fulfilment. <a href="/food/credits.html" target="_blank" rel="noreferrer">Photo credits</a>.</p></section>
<section className={'conversation '+(expanded?'is-expanded':'')}><button className="focus-toggle" onClick={()=>setVoiceFocus(v=>!v)}>{voiceFocus?'Back to menu':'Bring voice forward'}</button><div className="section-top"><h2>Your order</h2><span className={'mode status-'+connection}><i/>{connection==='verified'?'Connected':connection==='configured'?'Ready to try':connection==='missing'?'Menu ordering':connection==='checking'?'Connecting…':'Connection issue'}</span></div>{(connection==='error'||connection==='failed'||connection==='missing')&&<div className="connection-note" role="status"><p>{connection==='missing'?'Voice interpretation is not configured. You can still add items from the menu.':'Ordering service interrupted. Your cart is saved.'}</p><button className="connection-retry" disabled={busy} onClick={checkConnection}>Retry connection</button></div>}<button className={'voice-orb '+(listening?'live':'')} onClick={microphone} aria-label={listening?'Pause voice ordering':'Start voice ordering'}><Mic size={38}/></button><p className="voice-state">{listening?'Listening to your order':busy?'Updating your order…':'Tell us what you’d like'}</p><p className="fine">Tap once, speak your order. Checkout opens automatically.</p><button className="expand-conversation" aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}>{expanded?'Hide conversation':'Type or view conversation'}</button><div className="conversation-body"><div className={'transcript '+(liveTranscript?'is-hearing':'')} aria-live="polite"><span>{liveTranscript?'HEARING NOW':heard?'LAST HEARD':'TRY SAYING'}</span><p>{liveTranscript||heard||'“One farmhouse and a garlic bread”'}</p>{liveTranscript&&<small>Waiting for the rest of your sentence…</small>}</div><div className="messages" aria-live="polite">{messages.map((m,i)=><div key={i} className={'message '+m.role}><small>{m.role==='assistant'?'VOICEORDER':'YOU'}</small><p>{m.text}</p></div>)}{busy&&<p className="thinking">Working on your order…</p>}<div ref={bottom}/></div><div className="voice-options"><label>Speech language <select value={language} disabled={listening} onChange={e=>setLanguage(e.target.value)}><option value="en-IN">English (India)</option><option value="en-US">English (US)</option><option value="en-GB">English (UK)</option><option value="hi-IN">Hindi</option></select></label></div><form onSubmit={e=>{e.preventDefault();send();}}><button type="button" aria-label={listening?'Stop listening':'Start microphone'} className={'mic '+(listening?'listening':'')} disabled={busy} onClick={microphone}><Mic size={21}/></button><input aria-label="Your order" maxLength={1200} placeholder={listening?'Listening…':'Type your order…'} value={input} onChange={e=>setInput(e.target.value)} disabled={busy}/><button className="send" disabled={busy||!input.trim()} aria-label="Send order"><ArrowUp size={20}/></button></form><p className="fine">English, Hindi or Hinglish. Check the words above before confirming.</p></div></section>
{cart.length>0&&<aside className="cart-dock"><span><b>{cart.reduce((n,r)=>n+r.qty,0)} items</b> · ₹{total(cart)}</span><button className="primary" disabled={busy||!cart.length} onClick={openReview}>Review my order <ArrowRight size={18}/></button></aside>}</div>:<section className="kitchen"><div className="section-top"><h2>Kitchen queue <span>{tickets.filter(t=>t.status!=='Completed').length}</span></h2><button onClick={refresh}>Refresh orders</button></div>{!tickets.length&&<div className="empty"><ChefHat size={40}/><h3>The kitchen is clear.</h3><p>Confirm an order from the Order tab to see it here.</p></div>}<div className="ticket-grid">{tickets.map(t=><article className="ticket" key={t.id}><div className="section-top"><span>#{t.id.slice(0,8)}</span><b>{t.status}</b></div><h2>{t.table}</h2><small>{new Date(t.createdAt).toLocaleString()}</small><ul>{JSON.parse(t.cart).map((r:Row)=><li key={r.id}><b>{r.qty}</b>{menu.find(m=>m.id===r.id)?.name}</li>)}</ul><p>Total ₹{t.total}</p>{t.status!=='Completed'&&<button className="primary" onClick={()=>status(t,t.status==='Queued'?'Preparing':t.status==='Preparing'?'Ready':'Completed')}>{t.status==='Queued'?'Start preparing':t.status==='Preparing'?'Mark ready':'Complete order'}<Check size={16}/></button>}</article>)}</div></section>}
<footer><b>VoiceOrder</b><span>By Bomb Squad</span><small>Demo ordering · No real payments</small></footer>
<dialog ref={dialog} className="checkout-dialog" aria-labelledby="checkout-title" onCancel={e=>{if(busy)e.preventDefault();else setReview(false);}}>
<section className="review">
 <div className="checkout-top"><span><ShoppingBag size={18}/> BOMB SQUAD / CHECKOUT</span><button className="close-checkout" aria-label="Close checkout" disabled={busy} onClick={()=>setReview(false)}><X size={20}/></button></div>
 <h2 id="checkout-title">Review & checkout</h2><p className="fine">Demo order. No money is collected.</p>
 <div className="checkout-voice"><button onClick={microphone}>{listening?'Pause microphone':'Resume microphone'}</button><p>{listening?'Listening. Say “confirm with UPI” or “confirm with card.”':'Resume the microphone to confirm by voice.'}</p>{(liveTranscript||heard)&&<small>{liveTranscript?'Hearing: ':'Heard: '}{liveTranscript||heard}</small>}{voiceNotice&&<p role="status">{voiceNotice}</p>}</div>
 {error&&<p role="alert" className="notice">{error}</p>}
 <fieldset disabled={busy}>
 <label className="table-label">Table<input value={table} maxLength={30} onChange={e=>{setTable(e.target.value);pending.current=null;}}/></label>
 <div className="checkout-items">{cart.map(r=><div className="review-row" key={r.id}><div><span>{menu.find(m=>m.id===r.id)?.name}</span><small>₹{menu.find(m=>m.id===r.id)!.price*r.qty}</small></div><span><button aria-label={'Remove one '+r.id} onClick={()=>quantity(r.id,-1)}>−</button> {r.qty} <button aria-label={'Add one '+r.id} onClick={()=>quantity(r.id,1)}>+</button></span></div>)}</div>
 {!cart.length&&<p className="fine">Your cart is empty. Say what you’d like to add.</p>}
 {!cart.some(r=>r.id==='dip')&&cart.length>0&&<button className="optional-extra" onClick={()=>quantity('dip',1)}><Plus size={15}/> Add garlic dip <span>₹19 · optional</span></button>}
 <div className="total"><span>Total</span><b>₹{total(cart)}</b></div>
 <div className="payment-options" role="group" aria-label="Demo payment method">{['UPI','Credit card'].map(method=><label key={method}><input type="radio" name="payment" checked={payment===method} onChange={()=>setPayment(method)}/>{method}</label>)}</div>
 <button className="primary" disabled={busy||!cart.length||!table.trim()} onClick={confirm}>{busy?'Sending…':'Confirm demo order'}<Check size={18}/></button>
 </fieldset>
 <button className="back" disabled={busy} onClick={()=>setReview(false)}>Back to menu</button>
</section></dialog>
</main>;}
