import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const cfg=JSON.parse(await readFile(new URL('../data/learning-system.json',import.meta.url),'utf8'));
const pages=['index.html','diagnostic.html','review.html',...(cfg.modules||[]).map(m=>m.href)];
const errors=[];

function extractHelper(html){
 const m=html.match(/<script data-latent-safe-storage="v1">([\s\S]*?)<\/script>/);
 return m?{block:m[0],code:m[1]}:null;
}

for(const page of pages){
 const html=await readFile(new URL('../'+page,import.meta.url),'utf8');
 const helper=extractHelper(html);
 if(!helper){errors.push(page+': helper de stockage tolérant absent');continue}
 const rest=html.replace(helper.block,'');
 if(/\blocalStorage\./.test(rest)) errors.push(page+': accès direct localStorage encore présent hors helper');
 if(/\bsessionStorage\./.test(rest)) errors.push(page+': accès direct sessionStorage encore présent hors helper');

 const sandbox={
  window:{},
  document:{documentElement:{dataset:{}}},
  Map,
  String
 };
 Object.defineProperty(sandbox.window,'localStorage',{get(){throw new Error('blocked localStorage')}});
 Object.defineProperty(sandbox.window,'sessionStorage',{get(){throw new Error('blocked sessionStorage')}});

 try{
  vm.runInNewContext(helper.code,sandbox,{timeout:1000});
  const store=sandbox.window.LATENT_STORAGE;
  if(!store) errors.push(page+': LATENT_STORAGE non créé');
  else{
   if(store.mode!=='memory') errors.push(page+': fallback mémoire non activé quand les stockages sont bloqués');
   store.set('probe','ok');
   if(store.get('probe')!=='ok') errors.push(page+': fallback mémoire set/get défaillant');
   store.remove('probe');
   if(store.get('probe')!==null) errors.push(page+': fallback mémoire remove défaillant');
  }
 }catch(e){
  errors.push(page+': helper de stockage lève une exception quand les stockages sont bloqués — '+e.message);
 }
}

if(errors.length){
 console.error('Storage fallback validation failed:\n- '+errors.join('\n- '));
 process.exit(1);
}
console.log('Storage fallback: OK on '+pages.length+' pages');
