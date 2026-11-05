// Browser speech recognition is independent of the order-interpretation API.
export function speechFailure(code,attempts=0){
 const reason=typeof code==='string'&&/^[a-z-]{1,40}$/.test(code)?code:'unknown';
 const transient=['network','aborted','start-failed','phrases-not-supported'].includes(reason);
 if(transient&&attempts<3)return {retry:true,delay:1000*2**attempts,message:`Speech recognition interrupted (${reason}). Reconnecting ${attempts+1}/3… Please repeat your last sentence when listening resumes.`};
 const messages={
  'not-allowed':'Microphone permission is blocked (not-allowed). Allow the microphone in this site’s browser settings and in your system privacy settings, then start voice again.',
  'service-not-allowed':'Browser speech recognition is blocked (service-not-allowed). Try opening this HTTPS site directly in Chrome. Browser or organisation restrictions may prevent voice access.',
  'audio-capture':'The browser cannot access your microphone (audio-capture). Check that it is connected, select the correct system input, and close other apps using it.',
  'language-not-supported':'This speech language is unavailable (language-not-supported). Choose another speech language or try Chrome, then start voice again.',
 };
 return {retry:false,delay:0,message:(messages[reason]||(transient?`Speech recognition could not reconnect (${reason}). Check your connection, then press Start voice ordering.`:`Speech recognition stopped (${reason}). Try Chrome or restart the microphone.`))+' Your cart is saved; you can type or use the menu.'};
}
