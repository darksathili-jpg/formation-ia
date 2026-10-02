import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildModuleViewModel } from '../src/application/module-presenter.mjs';

const p0 = JSON.parse(await readFile(new URL('../content/modules/p0.json', import.meta.url), 'utf8'));

test('P0 declarative content becomes a complete section view-model', () => {
  const view = buildModuleViewModel(p0);
  assert.equal(view.id, 'p0');
  assert.equal(view.title, 'Comprendre ce qui se cache derrière un assistant IA');
  assert.equal(view.sections.length, 6);
  assert.equal(view.sections.flatMap((section) => section.activities).length, 7);
  assert.equal(view.sections[0].activities[0].id, 'p0-capability-origin');
  assert.equal(view.sections.at(-1).activities.at(-1).id, 'p0-transfer');
});

test('presenter fails fast when a section references missing content', () => {
  const broken = structuredClone(p0);
  broken.sections[0].activityIds.push('missing-activity');
  assert.throws(() => buildModuleViewModel(broken), /unknown activity missing-activity/);
});
