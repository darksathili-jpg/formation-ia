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
 if(!html.includes('class="skip-link"')||!html.includes('id="mainContent"')) errors.push(p+'navigation d’évitement clavier absente');
 if(!html.includes('prefers-reduced-motion')) errors.push(p+'reduced motion absent');
 if(!html.includes(':focus-visible')) errors.push(p+'focus visible absent');
 if(!/min-height:\s*44px/.test(html)) errors.push(p+'cible d’action 44px non verrouillée');
 if(/https?:\/\//.test((html.match(/<style data-latent-ui="v1">[\s\S]*?<\/style>/)||[''])[0])) errors.push(p+'URL distante dans le design system');
}
for(const page of pages.filter(p=>p.startsWith('modules/'))){
 const html=await readFile(new URL('../'+page,import.meta.url),'utf8');
 if(!html.includes('data-latent-nav="v1"')||!html.includes('layer-nav')) errors.push(page+': Layer Navigator absent');
 if(!html.includes('aria-current","step"')) errors.push(page+': état de section courante absent');
}
const index=await readFile(new URL('../index.html',import.meta.url),'utf8');
for(const marker of ['LATENT','latent-map','signal-rail','Neural learning workspace']){
 if(!index.includes(marker)) errors.push('index.html: signature manquante: '+marker);
}
if(index.includes('font-family:var(--display);') && !index.includes('--display:"Segoe UI Variable Display"')) errors.push('index.html: ancienne esthétique serif non neutralisée');

// Verrous de régression issus de l’audit ergonomique écran/projection.
const projectionPages=['index.html',...pages.filter(p=>p.startsWith('modules/'))];
for(const page of projectionPages){
 const html=await readFile(new URL('../'+page,import.meta.url),'utf8');
 if(!html.includes('data-projection-ux="v2"')) errors.push(page+': palette projection haute luminance absente');
 if(!html.includes('data-projection-audit="v3"')) errors.push(page+': garde-fous projection V3 absents');
 if(!html.includes('max-width:calc(100vw - 20px)!important')) errors.push(page+': sortie projection peut déborder du viewport');
 if(!html.includes('>✕ Quitter · Échap</button>')) errors.push(page+': libellé de sortie projection non compact');
 if(page.startsWith('modules/')&&!html.includes('html.projector .layer-nav{display:none!important}')) errors.push(page+': Layer Navigator non neutralisé en projection');
 if(page.startsWith('modules/')&&!html.includes('data-projection-module-audit="v3"')) errors.push(page+': neutralisation des surfaces sombres de module absente');
 if(page.startsWith('modules/')&&!html.includes('html.projector .section-head .num')) errors.push(page+': numéros de section sombres non neutralisés');
 if(!html.includes('--bg:#ffffff')||!html.includes('--text:#000000')) errors.push(page+': contraste structurel projection non verrouillé');
}
for(const page of pages.filter(p=>p.startsWith('modules/'))){
 const html=await readFile(new URL('../'+page,import.meta.url),'utf8');
 if(!html.includes('data-ux-audit="v1"')) errors.push(page+': correctifs responsive UX absents');
 if(!html.includes('@media(max-width:900px){.learning-guide{position:relative!important;top:auto!important}}')) errors.push(page+': Runtime Bar tablette non sécurisé');
 if(!html.includes('@media(max-width:1380px){.layer-nav{display:none!important}}')) errors.push(page+': seuil anti-chevauchement Layer Navigator absent');
 if(!html.includes('.q label{min-height:44px')) errors.push(page+': cibles tactiles du quiz non harmonisées');
}
if(!index.includes('data-ux-audit="v1"')||!index.includes('.mobile-nav{height:57px')||!index.includes('.topbar{top:57px')) errors.push('index.html: empilement sticky mobile non verrouillé');
if(!index.includes('.app{grid-template-columns:minmax(0,1fr)!important')||!index.includes('.main{grid-column:1/-1!important;width:100%!important')) errors.push('index.html: grille mobile peut retomber dans la colonne LATENT de 250px');
if(!index.includes('.topbar{position:relative!important;top:auto!important}')) errors.push('index.html: double barre sticky mobile encore possible');
if(!index.includes('.hero h1{font-size:clamp(2.45rem,10.5vw,3.6rem)!important')) errors.push('index.html: héros mobile non compacté');
if(!index.includes('.metrics{grid-template-columns:repeat(2,minmax(0,1fr))!important')) errors.push('index.html: métriques mobile non regroupées en 2x2');
if(!index.includes('.section-head{flex-direction:column!important;align-items:flex-start!important')) errors.push('index.html: en-tête de progression mobile encore comprimé');
if(!index.includes('html.projector .path-n{')||!index.includes('html.projector #learningSequence .module:after{')) errors.push('index.html: éléments sombres résiduels du cockpit en projection');
if(!index.includes('html.projector .state{font-size:.82rem')) errors.push('index.html: badges d’état trop petits en projection');
if(!index.includes('data-classic-surface-tuning="v1"')||!index.includes('data-classic-index-surfaces="v1"')) errors.push('index.html: adoucissement des surfaces sombres classiques absent');
for(const page of pages.filter(p=>p.startsWith('modules/'))){
 const html=await readFile(new URL('../'+page,import.meta.url),'utf8');
 if(!html.includes('data-classic-surface-tuning="v1"')||!html.includes('data-classic-module-surfaces="v1"')) errors.push(page+': surfaces techniques classiques encore trop noires');
 if(!html.includes('background:rgba(23,58,66,.96)!important')) errors.push(page+': Runtime Bar classique non adoucie');
}
for(const page of pages.filter(p=>p.startsWith('modules/'))){
 const html=await readFile(new URL('../'+page,import.meta.url),'utf8');
 if(!html.includes('data-mobile-module-ux="v1"')) errors.push(page+': barre d’outils mobile non stabilisée');
 if(!html.includes('grid-template-columns:repeat(3,minmax(0,1fr))')) errors.push(page+': commandes mobiles non réparties sur trois cibles');
 if(!html.includes('#trainerBtn[aria-pressed="true"]::after{content:"○ Stagiaire"}')) errors.push(page+': libellé mobile du mode formateur non synchronisé');
 if(!html.includes('#projectorBtn[aria-pressed="true"]::after{content:"✕ Quitter"}')) errors.push(page+': libellé mobile de projection non synchronisé');
 if(!html.includes('href="../index.html#dashboard"')) errors.push(page+': retour cockpit absent en fin de module');
}

if(errors.length){console.error('\n❌ LATENT UI INVALIDE\n- '+errors.join('\n- '));process.exit(1)}
console.log('✅ LATENT UI valide — identité, navigation, accessibilité et motion guard vérifiés.');
