import test from 'node:test';
import assert from 'node:assert/strict';
import { createParticipantPacket, evaluateLearnerGate, summarizeParticipantModule } from '../src/domain/analytics/learner-gate.mjs';

const moduleIds = ['p0', 'p1s1', 'p1s2', 'p1s3', 'p1s4'];
const course = {
  courseId: 'p1',
  version: 'freeze-test',
  moduleSequence: moduleIds.map((id) => ({ id, required: true }))
};
const gateConfig = {
  gateId: 'p1',
  version: '1',
  protocol: { minimumParticipants: 8 },
  meaningfulActionTypes: ['prediction.submitted', 'manipulation.changed', 'attempt.completed'],
  thresholds: {
    courseCompletionRate: 0.75,
    moduleCompletionRate: 0.75,
    medianFirstMeaningfulActionSecondsMax: 180,
    directHelpBeforeFirstActionRateMax: 0.25,
    medianQuizRatioMin: 0.75,
    medianTransferRatioMin: 0.70,
    masteryRateMin: 0.65,
    medianExplanationScoreMin: 1.5,
    delayedTransferPassRateMin: 0.70,
    criticalMisconceptionPersistenceRateMax: 0.25,
    majorBlockerCountMax: 0
  },
  decisionPolicy: {
    insufficientEvidence: 'pending-field-evidence',
    thresholdFailure: 'revise-before-p2',
    allThresholdsMet: 'eligible-for-human-approval'
  }
};

function completeProgress({ quizScore = 5, transferScore = 4, mastery = 'mastered' } = {}) {
  return {
    modules: Object.fromEntries(moduleIds.map((id) => [id, {
      quiz: { score: quizScore, total: 6 },
      transfer: { score: transferScore, total: 4 },
      mastery: { status: mastery }
    }]))
  };
}

function eventsForParticipant(index, firstActionSeconds = 60) {
  const base = Date.UTC(2026, 9, 5, 8, 0, 0) + index * 60_000;
  return moduleIds.flatMap((moduleId, moduleIndex) => {
    const opened = base + moduleIndex * 10 * 60_000;
    return [
      { id: `${index}-${moduleId}-open`, moduleId, type: 'module.opened', at: new Date(opened).toISOString() },
      { id: `${index}-${moduleId}-act`, moduleId, type: 'manipulation.changed', at: new Date(opened + firstActionSeconds * 1000).toISOString() }
    ];
  });
}

function observations({ help = false, explanation = 2, delayed = true, persisted = false, blocker = 'none' } = {}) {
  return {
    modules: Object.fromEntries(moduleIds.map((id) => [id, {
      directHelpBeforeFirstAction: help,
      explanationScore: explanation,
      delayedTransferPassed: delayed,
      criticalMisconceptionPersisted: persisted,
      blockerSeverity: blocker,
      note: ''
    }]))
  };
}

function packet(index, overrides = {}) {
  return createParticipantPacket({
    participantId: `P-TEST${String(index).padStart(4, '0')}`,
    events: overrides.events || eventsForParticipant(index, overrides.firstActionSeconds ?? 60),
    progress: overrides.progress || completeProgress(overrides.progressOptions),
    observations: overrides.observations || observations(overrides.observationOptions),
    course,
    gateConfig,
    createdAt: '2026-10-05T08:00:00.000Z'
  });
}

test('participant summary measures time to first meaningful action from module opening', () => {
  const summary = summarizeParticipantModule({
    moduleId: 'p0',
    events: eventsForParticipant(1, 75),
    progress: completeProgress(),
    observations: observations(),
    meaningfulActionTypes: gateConfig.meaningfulActionTypes
  });
  assert.equal(summary.firstMeaningfulActionSeconds, 75);
  assert.equal(summary.quizRatio, 5 / 6);
  assert.equal(summary.transferRatio, 1);
  assert.equal(summary.mastered, true);
  assert.equal(summary.observation.explanationScore, 2);
});

test('participant packet refuses a directly identifying-looking free-form id contract', () => {
  assert.throws(() => createParticipantPacket({
    participantId: 'Thierry Dupont', events: [], progress: {}, observations: {}, course, gateConfig
  }), /pseudonymous code/);
});

test('learner gate remains pending when cohort evidence is insufficient', () => {
  const result = evaluateLearnerGate({ packets: [packet(1), packet(2), packet(3)], course, gateConfig });
  assert.equal(result.decision, 'pending-field-evidence');
  assert.equal(result.eligibleForHumanApproval, false);
  assert.equal(result.p2Unlocked, false);
  assert.ok(result.missingEvidence.length > 0);
});

test('learner gate requests revision when a complete cohort crosses a blocking threshold', () => {
  const packets = Array.from({ length: 8 }, (_, index) => packet(index + 1, {
    observationOptions: index === 0 ? { blocker: 'major' } : {}
  }));
  const result = evaluateLearnerGate({ packets, course, gateConfig });
  assert.equal(result.decision, 'revise-before-p2');
  assert.equal(result.eligibleForHumanApproval, false);
  assert.equal(result.p2Unlocked, false);
  assert.ok(result.failedChecks.some((entry) => entry.key === 'majorBlockerCount'));
});

test('learner gate can only recommend human approval; it never unlocks P2 automatically', () => {
  const packets = Array.from({ length: 8 }, (_, index) => packet(index + 1));
  const result = evaluateLearnerGate({ packets, course, gateConfig });
  assert.equal(result.decision, 'eligible-for-human-approval');
  assert.equal(result.eligibleForHumanApproval, true);
  assert.equal(result.humanApprovalRequired, true);
  assert.equal(result.p2Unlocked, false);
  assert.deepEqual(result.failedChecks, []);
  assert.deepEqual(result.missingEvidence, []);
});
