import test from 'node:test';
import assert from 'node:assert/strict';
import { createLearningEvent, isLearningEventType } from '../src/domain/analytics/learning-event.mjs';

test('course navigation is a first-class learning event in the integrated path', () => {
  assert.equal(isLearningEventType('course.navigation'), true);
  const event = createLearningEvent({
    id: 'evt-nav-1',
    at: '2026-10-05T08:00:00.000Z',
    profileId: 'local-profile',
    sessionId: 'session-1',
    courseId: 'latent-llm',
    moduleId: 'p0',
    type: 'course.navigation',
    payload: { from: 'p0', to: 'p1s1' },
    contentVersion: '3.0.0-alpha.1',
    appVersion: '0.1.0-alpha.1'
  });
  assert.deepEqual(event.payload, { from: 'p0', to: 'p1s1' });
  assert.equal(event.type, 'course.navigation');
});
