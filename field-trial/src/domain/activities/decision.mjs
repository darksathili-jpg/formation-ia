function asUniqueStrings(values, name) {
  if (!Array.isArray(values)) throw new TypeError(`${name} must be an array`);
  const result = values.map(String);
  if (new Set(result).size !== result.length) throw new Error(`${name} contains duplicates`);
  return result;
}

export function evaluateComponentMission({ needs = [] } = {}, selected = []) {
  const required = asUniqueStrings(needs, 'needs');
  const active = asUniqueStrings(selected, 'selected');
  const missing = required.filter((component) => !active.includes(component));
  const extras = active.filter((component) => !required.includes(component));
  const capable = missing.length === 0;
  return Object.freeze({
    capable,
    minimal: capable && extras.length === 0,
    missing: Object.freeze(missing),
    extras: Object.freeze(extras),
    required: Object.freeze(required),
    selected: Object.freeze(active)
  });
}

export function evaluateOrder(expected = [], actual = []) {
  const target = [...expected];
  const candidate = [...actual];
  const complete = candidate.length === target.length;
  const correct = complete && candidate.every((item, index) => item === target[index]);
  const firstMismatch = candidate.findIndex((item, index) => item !== target[index]);
  return Object.freeze({
    correct,
    complete,
    firstMismatch: correct ? -1 : (firstMismatch === -1 ? candidate.length : firstMismatch),
    expectedLength: target.length,
    actualLength: candidate.length
  });
}

export function evaluateChoice(item, answer) {
  if (!item || !Array.isArray(item.choices)) throw new TypeError('item choices are required');
  const answered = answer !== '' && answer !== null && answer !== undefined;
  const correct = answered && String(answer) === String(item.answer);
  return Object.freeze({ answered, correct, answer });
}

export function scoreChoiceSet(items = [], responses = {}) {
  const results = items.map((item) => {
    const answer = responses[item.id];
    const evaluation = evaluateChoice(item, answer);
    return Object.freeze({ id: item.id, ...evaluation });
  });
  const answered = results.filter((result) => result.answered).length;
  const score = results.filter((result) => result.correct).length;
  const total = items.length;
  return Object.freeze({
    score,
    total,
    answered,
    complete: total > 0 && answered === total,
    ratio: total ? score / total : 0,
    results: Object.freeze(results)
  });
}
