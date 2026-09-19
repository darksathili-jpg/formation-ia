import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const html = await readFile(new URL('../modules/domaine-c.html', import.meta.url), 'utf8');
const index = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const errors = [];
if (/>[^<]*(?:Domaine C|DOMAINE C|C\\d{2})[^<]*</.test(html)) errors.push('nomenclature technique C visible pour le stagiaire');
const must = [
  'Attention Lab',
  'Q, K et V sans magie',
  'id="attention"',
  'id="causalToggle"',
  'id="scaleToggle"',
  'id="matrix"',
  '9 notions',
  'Simulation pédagogique contrôlée',
  'Attention ≠ explication complète',
  'softmax((QKᵀ / √dₖ) + masque) · V'
];
for (const marker of must) if (!html.includes(marker)) errors.push(`marqueur manquant: ${marker}`);
if (!index.includes('modules/domaine-c.html')) errors.push('index: lien vers l’étape Transformer absent');
if (/<script\s+[^>]*src=/i.test(html) || /<link\s+[^>]*href=/i.test(html)) errors.push('dépendance externe détectée');
if (/\bfetch\s*\(|XMLHttpRequest|WebSocket\s*\(/.test(html)) errors.push('appel réseau détecté');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
const dup = ids.filter((id,i) => ids.indexOf(id) !== i);
if (dup.length) errors.push(`id dupliqué(s): ${[...new Set(dup)].join(', ')}`);
const script = html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
if (!script) errors.push('script principal introuvable');
else { try { new vm.Script(script); } catch (e) { errors.push(`JavaScript invalide: ${e.message}`); } }
if (!/<meta\s+name="viewport"/i.test(html)) errors.push('viewport mobile absent');
if (!/@media\(max-width:650px\)/.test(html)) errors.push('règles responsive mobile absentes');
if (!/@media\(prefers-reduced-motion:reduce\)/.test(html)) errors.push('respect prefers-reduced-motion absent');
if (errors.length) { console.error('\n❌ PARCOURS 1 ÉTAPE 2 INVALIDE\n- '+errors.join('\n- ')); process.exit(1); }
console.log('✅ Parcours 1 étape 2 valide — autonome, JavaScript analysable, IDs uniques, Attention Lab et garde-fous pédagogiques présents.');
