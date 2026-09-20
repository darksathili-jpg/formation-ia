import { readFile } from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const pages=[
 'index.html','diagnostic.html','review.html',
 'modules/domaine-a.html','modules/domaine-b.html','modules/domaine-c.html',
 'modules/transformer-block-lab.html','modules/sampling-lab.html',
 'modules/hallucination-lab.html','modules/rag-lab.html'
];
const errors=[];
for(const page of pages){
 const html=await readFile(new URL('../'+page,import.meta.url),'utf8');
 const p=page+': ';
 if(!html.includes('data-ui-system="latent-v1"')) errors.push(p+'marqueur LATENT UI absent');
 if(!html.includes('data-latent-ui="v1"')) errors.push(p+'feuille de style LATENT UI absente');
 if(!html.includes('prefers-reduced-motion')) errors.push(p+'reduced motion absent');
 if(!html.includes(':focus-visible')) errors.push(p+'focus visible absent');
 if(!/min-height:\s*44px/.test(html)) errors.push(p+'cible d’action 44px non verrouillée');
 if(/https?:\/\//.test((html.match(/<style data-latent-ui="v1">[\s\S]*?<\/style>/)||[''])[0])) errors.push(p+'URL distante dans le design system');
}
const index=await readFile(new URL('../index.html',import.meta.url),'utf8');
for(const marker of ['LATENT','latent-map','signal-rail','Neural learning workspace']){
 if(!index.includes(marker)) errors.push('index.html: signature manquante: '+marker);
}
if(index.includes('font-family:var(--display);') && !index.includes('--display:"Segoe UI Variable Display"')) errors.push('index.html: ancienne esthétique serif non neutralisée');
if(errors.length){console.error('\n❌ LATENT UI INVALIDE\n- '+errors.join('\n- '));process.exit(1)}
console.log('✅ LATENT UI valide — identité, navigation, accessibilité et motion guard vérifiés.');
