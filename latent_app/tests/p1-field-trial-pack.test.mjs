import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFile(path.join(ROOT, file), 'utf8');

const html = await read('src/entrypoints/web/field-trial-pack.html');
const css = await read('src/entrypoints/web/field-trial-pack.css');

test('field trial pack exposes the five delayed-transfer cards', () => {
  const modules = [...html.matchAll(/class="print-page transfer-card" data-module="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(modules, ['p0', 'p1s1', 'p1s2', 'p1s3', 'p1s4']);
  assert.match(html, /24 h à 7 jours/);
});

test('field trial pack preserves privacy and human-gate invariants', () => {
  assert.match(html, /Ne saisissez ni nom, ni prénom, ni identifiant scolaire/);
  assert.match(html, /P2 reste verrouillé/);
  assert.match(html, /Revue humaine obligatoire/);
  assert.match(html, /data-pack-version="1\.0"/);
  assert.doesNotMatch(html, /type="text"/i);
});

test('field trial pack contains teacher, student, observation and cohort sheets', () => {
  for (const marker of ['teacher-sheet', 'student-instructions', 'observation-sheet', 'cohort-analysis']) assert.match(html, new RegExp(marker));
  for (const threshold of ['≥ 8', '≥ 75 %', '≤ 180 s', '≥ 1,5 / 2', '≥ 70 %']) assert.match(html, new RegExp(threshold.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('print stylesheet is A4, ink-economic and page-separated', () => {
  assert.match(css, /@media print/);
  assert.match(css, /@page\{size:A4 portrait/);
  assert.match(css, /background:#fff!important;color:#000!important/);
  assert.match(css, /print-color-adjust:economy!important/);
  assert.match(css, /break-before:page/);
  assert.match(css, /\.screen-only\{display:none!important\}/);
});

test('screen layout has a mobile guard instead of hiding overflow globally', () => {
  assert.match(css, /@media\(max-width:520px\)/);
  assert.match(css, /overflow-wrap:anywhere/);
  assert.doesNotMatch(css, /body\{[^}]*overflow-x:hidden/);
});
