import { readFile } from 'node:fs/promises';

const root=new URL('../',import.meta.url);
const pages=[
  'index.html',
  'modules/domaine-a.html',
  'modules/domaine-b.html',
  'modules/domaine-c.html',
  'modules/transformer-block-lab.html',
  'modules/sampling-lab.html',
  'modules/hallucination-lab.html',
  'modules/rag-lab.html',
  'modules/dialoguer-specifier.html',
  'modules/dialoguer-exemples.html',
  'modules/dialoguer-iterer.html',
  'modules/dialoguer-multitour.html'
];
const errors=[];
const appRoutes=new Set(['dashboard','apprentissage','parcours','labs','progression','referentiel','architecture']);
const cache=new Map();

async function load(path){
  if(cache.has(path)) return cache.get(path);
  const text=await readFile(new URL(path,root),'utf8');
  cache.set(path,text);
  return text;
}
function hasId(html,id){
  return html.includes('id="'+id+'"') || html.includes("id='"+id+"'");
}

for(const page of pages){
  const html=await load(page);
  const prefix=page+': ';

  if(!/id="projectorBtn"[^>]*aria-pressed="false"/.test(html)) errors.push(prefix+'bouton Projection sans état aria-pressed initial');
  if(!html.includes('id="projectorExit"')) errors.push(prefix+'sortie fixe de projection absente');
  if(!/id="projectorExit"[^>]*>✕ Quitter · Échap<\/button>/.test(html)) errors.push(prefix+'libellé compact de sortie de projection absent');
  if(!html.includes('setProjectorMode')) errors.push(prefix+'fonction setProjectorMode absente');
  if(!/e\.key===["']Escape["']/.test(html)) errors.push(prefix+'sortie clavier Échap absente');
  if(!html.includes('.projector .projector-exit')) errors.push(prefix+'bouton de sortie non forcé visible en projection');
  if(!html.includes(':focus-visible')) errors.push(prefix+'focus clavier visible non contrôlé');

  if(!/id="trainerBtn"[^>]*aria-pressed="false"[^>]*>◆ Activer mode formateur<\/button>/.test(html)){
    errors.push(prefix+'action Formateur ambiguë ou sans aria-pressed');
  }
  if(!html.includes('formation-llm-role')) errors.push(prefix+'profil stagiaire/formateur non partagé entre pages');

  if(/llm-b-projector|formation-llm-projector/.test(html)){
    errors.push(prefix+'le mode Projection ne doit pas persister après rechargement');
  }
  const visibleMarkup=html.replace(new RegExp('<script[\\s\\S]*?</script>','gi'),'').replace(new RegExp('<style[\\s\\S]*?</style>','gi'),'');
  if(visibleMarkup.includes('\\n')) errors.push(prefix+'séquence littérale \\n détectée dans le HTML visible');

  if(page!=='index.html' && !/href="\.\.\/index\.html(?:#[^"]*)?"/.test(html)){
    errors.push(prefix+'retour explicite vers Formation LLM absent');
  }

  const currentURL=new URL(page,root);
  for(const m of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)){
    const href=m[1];
    if(!href || /^(https?:|mailto:|tel:|javascript:)/i.test(href)) continue;
    if(href.startsWith('#')){
      const frag=decodeURIComponent(href.slice(1));
      if(frag && !hasId(html,frag)) errors.push(prefix+'ancre interne introuvable: '+href);
      continue;
    }
    const parts=href.split('#');
    const pathPart=parts[0],fragRaw=parts[1]||'';
    if(!/\.html$/i.test(pathPart)) continue;
    const targetURL=new URL(pathPart,currentURL);
    const marker='/formation_llm/';
    const idx=targetURL.pathname.indexOf(marker);
    const targetPath=idx>=0?decodeURIComponent(targetURL.pathname.slice(idx+marker.length)):'';
    if(!targetPath){ errors.push(prefix+'lien hors racine inattendu: '+href); continue; }
    try{
      const target=await load(targetPath);
      if(fragRaw){
        const frag=decodeURIComponent(fragRaw);
        const isAppRoute=targetPath==='index.html' && appRoutes.has(frag);
        if(!isAppRoute && !hasId(target,frag)) errors.push(prefix+'fragment cible introuvable: '+href);
      }
    }catch(e){
      errors.push(prefix+'lien HTML cassé: '+href);
    }
  }
}

const index=await load('index.html');
if(!/<span class="status-pill" id="rolePill"[^>]*>Profil : stagiaire<\/span>/.test(index)){
  errors.push('index.html: le profil courant doit être un statut non cliquable');
}
if(/<button[^>]*id="rolePill"/.test(index)) errors.push('index.html: le profil courant ne doit jamais être un bouton');
if(!index.includes('.projector .sidebar,.projector .mobile-nav,.projector .top-actions{display:none}')){
  errors.push('index.html: le mode Projection doit masquer les contrôles administratifs tout en conservant la sortie fixe');
}

const A=await load('modules/domaine-a.html');
const B=await load('modules/domaine-b.html');
const C=await load('modules/domaine-c.html');
const T=await load('modules/transformer-block-lab.html');
const S=await load('modules/sampling-lab.html');
const P2S1=await load('modules/dialoguer-specifier.html');
const P2S2=await load('modules/dialoguer-exemples.html');
const P2S3=await load('modules/dialoguer-iterer.html');
const P2S4=await load('modules/dialoguer-multitour.html');
if(!A.includes('href="domaine-b.html"')) errors.push('Parcours 0: lien vers étape 1 absent');
if(!B.includes('href="domaine-c.html"')) errors.push('Parcours 1 étape 1: lien vers étape 2 absent');
if(!C.includes('href="transformer-block-lab.html"')) errors.push('Parcours 1 étape 2: lien vers étape 3 absent');
if(!T.includes('href="domaine-c.html"')) errors.push('Parcours 1 étape 3: retour vers étape 2 absent');
if(!T.includes('href="sampling-lab.html"')) errors.push('Parcours 1 étape 3: lien vers étape 4 absent');
if(!S.includes('href="transformer-block-lab.html"')) errors.push('Parcours 1 étape 4: retour vers étape 3 absent');
if(!P2S1.includes('href="dialoguer-exemples.html"')) errors.push('Parcours 2 étape 1: lien vers étape 2 absent');
if(!P2S2.includes('href="dialoguer-specifier.html"')) errors.push('Parcours 2 étape 2: retour vers étape 1 absent');
if(!P2S2.includes('href="dialoguer-iterer.html"')) errors.push('Parcours 2 étape 2: lien vers étape 3 absent');
if(!P2S3.includes('href="dialoguer-exemples.html"')) errors.push('Parcours 2 étape 3: retour vers étape 2 absent');
if(!P2S3.includes('href="dialoguer-multitour.html"')) errors.push('Parcours 2 étape 3: lien vers étape 4 absent');
if(!P2S4.includes('href="dialoguer-iterer.html"')) errors.push('Parcours 2 étape 4: retour vers étape 3 absent');

if(errors.length){
  console.error('\n❌ AUDIT NAVIGATION ÉCHOUÉ\n- '+errors.join('\n- '));
  process.exit(1);
}
console.log('✅ Navigation sûre — projection réversible, statuts/actions distincts, clavier, retours, chaîne de parcours et liens vérifiés.');
