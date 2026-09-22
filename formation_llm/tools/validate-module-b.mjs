import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const html = await readFile(new URL('../modules/domaine-b.html', import.meta.url), 'utf8');
const index = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const errors = [];
const must = ['Tokenizer Lab','texte → tokens → IDs → vecteurs → budget de contexte','Simulation pédagogique','Sous-mots · BPE didactique','Zoom BPE didactique','data-token-example="extraordinaire"','id="bpeTrace"','id="tokenizer"','id="embeddings"','id="contexte"','id="quiz"','B12','Mode formateur intégré'];
for (const marker of must) if (!html.includes(marker)) errors.push(`marqueur manquant: ${marker}`);
const mergeMatch=html.match(/const BPE_MERGES=(\[[\s\S]*?\]);/);
if(!mergeMatch) errors.push('BPE didactique: table de fusions absente');
else{
 let merges=[];
 try{merges=JSON.parse(mergeMatch[1])}catch(e){errors.push('BPE didactique: table de fusions non JSON')}
 function segment(word){
  let symbols=Array.from(word.normalize('NFC').toLocaleLowerCase('fr'));
  for(const [a,b] of merges){
   const next=[];
   for(let i=0;i<symbols.length;i++){
    if(i<symbols.length-1&&symbols[i]===a&&symbols[i+1]===b){next.push(a+b);i++}
    else next.push(symbols[i]);
   }
   symbols=next;
  }
  return symbols;
 }
 if(merges.length){
  const cases={
   extraordinaire:['extra','ord','inaire'],
   'modèle':['mod','èle'],
   tokenizers:['token','izers']
  };
  for(const [word,expected] of Object.entries(cases)){
   const got=segment(word);
   if(JSON.stringify(got)!==JSON.stringify(expected)) errors.push('BPE didactique: régression '+word+' => '+JSON.stringify(got)+' au lieu de '+JSON.stringify(expected));
   if(got.length===Array.from(word).length) errors.push('BPE didactique: '+word+' retombe caractère par caractère');
  }
 }
}
if (!index.includes('modules/domaine-b.html')) errors.push('index: lien vers le Domaine B absent');
if (/<script\s+[^>]*src=/i.test(html) || /<link\s+[^>]*href=/i.test(html)) errors.push('dépendance externe détectée');
if (/\bfetch\s*\(|XMLHttpRequest|WebSocket\s*\(/.test(html)) errors.push('appel réseau détecté');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
const dup = ids.filter((id,i) => ids.indexOf(id) !== i);
if (dup.length) errors.push(`id dupliqué(s): ${[...new Set(dup)].join(', ')}`);
const script = html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
if (!script) errors.push('script principal introuvable');
else { try { new vm.Script(script); } catch (e) { errors.push(`JavaScript invalide: ${e.message}`); } }
if (!/<meta\s+name="viewport"/i.test(html)) errors.push('viewport mobile absent');
if (!/@media\(max-width:600px\)/.test(html)) errors.push('règles responsive mobile absentes');
if (!/@media\(prefers-reduced-motion:reduce\)/.test(html)) errors.push('respect prefers-reduced-motion absent');
if (errors.length) { console.error('\n❌ MODULE B INVALIDE\n- '+errors.join('\n- ')); process.exit(1); }
console.log('✅ Module B valide — BPE didactique testé sur sous-mots, trace pédagogique, autonomie, JavaScript et responsive vérifiés.');
