import test from 'node:test';
import assert from 'node:assert/strict';
import { applyRankedMerges, tokenizeText } from '../src/domain/activities/tokenizer.mjs';

test('extraordinaire produces reachable pedagogical subwords', () => {
  const detail = applyRankedMerges('extraordinaire');
  assert.deepEqual(detail.tokens, ['extra', 'ord', 'inaire']);
  assert.ok(detail.trace.length >= 8);
  const result = tokenizeText('extraordinaire');
  assert.deepEqual(result.metrics, { characters: 14, bytes: 14, tokens: 3, unique: 3 });
});

test('accented word keeps Unicode semantics and UTF-8 byte count', () => {
  const result = tokenizeText('modèle');
  assert.deepEqual(result.tokens.map((token) => token.display), ['mod', 'èle']);
  assert.equal(result.metrics.characters, 6);
  assert.equal(result.metrics.bytes, 7);
  assert.equal(result.metrics.tokens, 2);
});

test('emoji is one code point but four UTF-8 bytes', () => {
  const result = tokenizeText('🚀 IA !');
  assert.equal(result.metrics.characters, 6);
  assert.equal(result.metrics.bytes, 9);
  assert.equal(result.tokens[0].display, '🚀');
  assert.equal(result.tokens[0].kind, 'symbol');
});

test('spaces are preserved as explicit pedagogical units', () => {
  const result = tokenizeText('a  b');
  assert.deepEqual(result.tokens.map((token) => token.display), ['a', '␠', '␠', 'b']);
  assert.equal(result.metrics.characters, 4);
});

test('context budget reports overflow instead of silently truncating metrics', () => {
  const result = tokenizeText('extraordinaire', { contextLimit: 2 });
  assert.equal(result.metrics.tokens, 3);
  assert.deepEqual(result.context, {
    limit: 2,
    used: 2,
    available: 0,
    overflow: 1,
    withinBudget: false,
    ratio: 1
  });
  assert.deepEqual(result.tokens.map((token) => token.inContext), [true, true, false]);
});

test('word and byte views are alternative didactic views, not the subword engine', () => {
  const word = tokenizeText('Salut !', { mode: 'word' });
  const bytes = tokenizeText('é', { mode: 'byte' });
  assert.deepEqual(word.tokens.map((token) => token.display), ['Salut', '␠', '!']);
  assert.deepEqual(bytes.tokens.map((token) => token.display), ['0xC3', '0xA9']);
});

test('invalid context budgets and modes fail loudly', () => {
  assert.throws(() => tokenizeText('x', { contextLimit: 0 }), /positive integer/);
  assert.throws(() => tokenizeText('x', { mode: 'mystery' }), /Unsupported tokenizer mode/);
});
