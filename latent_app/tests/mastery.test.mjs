import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateMastery, nextReviewIntervalDays, scheduleReview } from '../src/domain/learning/mastery.mjs';

test('no evidence means not-started', () => {
  assert.equal(evaluateMastery({}), 'not-started');
});

test('quiz alone is evidence, not mastery', () => {
  assert.equal(evaluateMastery({ quiz: { score: 5, total: 6 } }), 'evidence');
});

test('mastery requires quiz and transfer at threshold', () => {
  assert.equal(evaluateMastery({
    quiz: { score: 5, total: 6 },
    transfer: { score: 4, total: 4 }
  }), 'mastered');
});

test('failed evidence stays learning', () => {
  assert.equal(evaluateMastery({
    quiz: { score: 3, total: 6 },
    transfer: { score: 2, total: 4 }
  }), 'learning');
});

test('review schedule remains deterministic', () => {
  assert.deepEqual([0, 1, 2, 3, 4].map((level) => nextReviewIntervalDays(level, true)), [1, 3, 7, 14, 30]);
  assert.equal(nextReviewIntervalDays(4, false), 1);
  assert.equal(scheduleReview({ now: '2026-10-02T08:00:00.000Z', level: 2, passed: true }), '2026-10-09T08:00:00.000Z');
});
