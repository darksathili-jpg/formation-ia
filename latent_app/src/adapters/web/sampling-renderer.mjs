import { decodeStep, advanceAutoregressive, randomFromSeed } from '../../domain/activities/sampling.mjs';

function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text != null) node.textContent = String(options.text);
  for (const [name, value] of Object.entries(options.attrs || {})) {
    if (value != null) node.setAttribute(name, String(value));
  }
  for (const child of Array.isArray(children) ? children : [children]) if (child) node.append(child);
  return node;
}

function button(label, attrs = {}) {
  return el('button', { className: 'button sampling-button', text: label, attrs: { type: 'button', ...attrs } });
}

function feedbackBox() {
  return el('div', { className: 'feedback sampling-feedback', attrs: { role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' } });
}

function formatProbability(value) {
  return `${(value * 100).toFixed(1).replace('.', ',')} %`;
}

function activityHeader(activity, fallbackTitle) {
  const config = activity.config || {};
  return [
    el('div', { className: 'activity-meta' }, [
      el('span', { text: activity.purpose }),
      el('span', { text: activity.type }),
      ...(activity.evidenceIds || []).map((id) => el('span', { text: id }))
    ]),
    el('h3', { text: config.title || fallbackTitle }),
    el('p', { className: 'activity-intro', text: config.instruction || '' })
  ];
}

function createDistributionTable() {
  const body = el('tbody', { attrs: { 'data-sampling-rows': '' } });
  const table = el('div', { className: 'sampling-table-wrap' }, [
    el('table', { className: 'sampling-table' }, [
      el('thead', {}, [el('tr', {}, [
        el('th', { text: 'Candidat' }),
        el('th', { text: 'Logit' }),
        el('th', { text: 'P avant filtre' }),
        el('th', { text: 'Éligible' }),
        el('th', { text: 'P finale' })
      ])]),
      body
    ])
  ]);
  return { table, body };
}

function fillDistributionRows(body, result) {
  body.replaceChildren();
  result.tokens.forEach((token, index) => {
    const eligible = result.mask[index];
    const row = el('tr', {
      attrs: {
        'data-token-index': index,
        'data-eligible': eligible ? 'true' : 'false',
        'data-selected': index === result.selectedIndex ? 'true' : 'false'
      }
    }, [
      el('td', { className: 'sampling-token', text: token }),
      el('td', { text: result.logits[index].toFixed(2) }),
      el('td', {}, [
        el('div', { className: 'sampling-probbar', attrs: { 'aria-hidden': 'true' } }, [
          el('span', { attrs: { style: `width:${Math.max(0, Math.min(100, result.baseProbabilities[index] * 100))}%` } })
        ]),
        el('small', { text: formatProbability(result.baseProbabilities[index]) })
      ]),
      el('td', {}, [el('span', { className: eligible ? 'sampling-eligible' : 'sampling-filtered', text: eligible ? 'oui' : 'filtré' })]),
      el('td', { text: formatProbability(result.probabilities[index]) })
    ]);
    body.append(row);
  });
}

function renderSamplingLab(activity, emit) {
  const config = activity.config || {};
  if (config.domainEngine !== 'sampling-engine') throw new Error('sampling-lab must delegate to sampling-engine');
  const tokens = config.tokens || [];
  const logits = config.logits || [];
  if (!tokens.length || tokens.length !== logits.length) throw new Error('sampling-lab requires aligned tokens/logits');

  let started = false;
  let drawStep = 0;
  const start = () => {
    if (started) return;
    started = true;
    emit('activity.started', activity.id, {});
  };

  const strategy = el('select', { attrs: { 'aria-label': 'Stratégie de sélection', 'data-sampling-strategy': '' } }, [
    el('option', { text: 'Greedy · prendre le maximum', attrs: { value: 'greedy' } }),
    el('option', { text: 'Sampling · tirage pondéré', attrs: { value: 'sample' } })
  ]);
  strategy.value = config.initialStrategy || 'greedy';

  const filter = el('select', { attrs: { 'aria-label': 'Filtre de candidats', 'data-sampling-filter': '' } }, [
    el('option', { text: 'Aucun filtre', attrs: { value: 'none' } }),
    el('option', { text: 'Top-k', attrs: { value: 'topk' } }),
    el('option', { text: 'Top-p', attrs: { value: 'topp' } })
  ]);
  filter.value = config.initialFilter || 'none';

  const range = config.temperatureRange || { min: 0.3, max: 2, step: 0.1 };
  const temperature = el('input', { attrs: {
    type: 'range', min: range.min, max: range.max, step: range.step,
    value: config.initialTemperature ?? 1, 'aria-label': 'Température', 'data-sampling-temperature': ''
  } });
  const temperatureOut = el('output', { attrs: { 'data-sampling-temperature-output': '' } });

  const topK = el('input', { attrs: {
    type: 'range', min: 1, max: tokens.length, step: 1, value: config.initialTopK || Math.min(2, tokens.length),
    'aria-label': 'Nombre de candidats top-k', 'data-sampling-topk': ''
  } });
  const topKOut = el('output', { attrs: { 'data-sampling-topk-output': '' } });
  const topKField = el('label', { className: 'sampling-field sampling-filter-parameter' }, [el('span', { text: 'Top-k · nombre de candidats' }), topK, topKOut]);

  const topP = el('input', { attrs: {
    type: 'range', min: 0.1, max: 1, step: 0.05, value: config.initialTopP ?? 0.8,
    'aria-label': 'Masse cumulée top-p', 'data-sampling-topp': ''
  } });
  const topPOut = el('output', { attrs: { 'data-sampling-topp-output': '' } });
  const topPField = el('label', { className: 'sampling-field sampling-filter-parameter' }, [el('span', { text: 'Top-p · masse cumulée cible' }), topP, topPOut]);

  const seed = el('input', { attrs: {
    type: 'number', step: 1, value: config.seed ?? 17,
    'aria-label': 'Graine déterministe du tirage', 'data-sampling-seed': ''
  } });

  const controls = el('div', { className: 'sampling-controls' }, [
    el('label', { className: 'sampling-field' }, [el('span', { text: 'Règle de sélection' }), strategy]),
    el('label', { className: 'sampling-field' }, [el('span', { text: 'Température T' }), el('div', { className: 'sampling-range-row' }, [temperature, temperatureOut])]),
    el('label', { className: 'sampling-field' }, [el('span', { text: 'Filtre avant sélection' }), filter]),
    topKField,
    topPField,
    el('label', { className: 'sampling-field' }, [el('span', { text: 'Graine de tirage' }), seed])
  ]);

  const { table, body: tableBody } = createDistributionTable();
  const selected = el('strong', { className: 'sampling-selected-token', attrs: { 'data-sampling-selected': '' } });
  const meta = el('span', { className: 'sampling-choice-meta', attrs: { 'data-sampling-choice-meta': '' } });
  const feedback = feedbackBox();
  const decide = button('Décider maintenant', { 'data-sampling-decide': '' });
  const nextDraw = button('Nouveau tirage', { 'data-sampling-next-draw': '' });
  let last = null;

  function settings() {
    return {
      strategy: strategy.value,
      filter: filter.value,
      temperature: Number(temperature.value),
      topK: Number(topK.value),
      topP: Number(topP.value),
      seed: Number(seed.value) || 0
    };
  }

  function evaluate() {
    const s = settings();
    last = decodeStep({
      tokens,
      logits,
      temperature: s.temperature,
      strategy: s.strategy,
      filter: s.filter,
      topK: s.topK,
      topP: s.topP,
      randomValue: randomFromSeed(Math.trunc(s.seed), drawStep)
    });
    return last;
  }

  function update({ emitChange = false, source = 'render' } = {}) {
    const result = evaluate();
    fillDistributionRows(tableBody, result);
    temperatureOut.value = Number(temperature.value).toFixed(1).replace('.', ',');
    topKOut.value = topK.value;
    topPOut.value = Number(topP.value).toFixed(2).replace('.', ',');
    topKField.hidden = filter.value !== 'topk';
    topPField.hidden = filter.value !== 'topp';
    selected.textContent = result.selectedToken;
    meta.textContent = `${result.strategy === 'greedy' ? 'argmax local' : 'tirage pondéré'} · probabilité finale ${formatProbability(result.probabilities[result.selectedIndex])}`;
    const kept = result.mask.filter(Boolean).length;
    feedback.textContent = `Softmax transforme les logits en distribution locale. ${kept}/${tokens.length} candidat(s) restent éligibles après le filtre ; leur masse est renormalisée avant la sélection. Ceci ne vérifie aucune vérité.`;
    if (emitChange) emit('manipulation.changed', activity.id, { source, ...settings(), mask: [...result.mask], probabilities: [...result.probabilities] });
  }

  for (const control of [strategy, filter, temperature, topK, topP, seed]) {
    const eventName = control === temperature || control === topK || control === topP ? 'input' : 'change';
    control.addEventListener(eventName, () => { start(); update({ emitChange: true, source: control.dataset.samplingStrategy != null ? 'strategy' : control.dataset.samplingFilter != null ? 'filter' : 'parameter' }); });
  }

  decide.addEventListener('click', () => {
    start();
    update();
    emit('feedback.shown', activity.id, { selectedToken: last.selectedToken, selectedIndex: last.selectedIndex, ...settings() });
    emit('attempt.completed', activity.id, { selectedToken: last.selectedToken, probabilities: [...last.probabilities], mask: [...last.mask], ...settings() });
  });

  nextDraw.addEventListener('click', () => {
    start();
    drawStep += 1;
    update({ emitChange: true, source: 'new-draw' });
  });

  const body = el('div', { className: 'sampling-lab-v3' }, [
    ...activityHeader(activity, 'Sampling Lab'),
    controls,
    table,
    el('div', { className: 'sampling-decision-card' }, [
      el('span', { text: 'Token sélectionné' }), selected, meta
    ]),
    feedback,
    el('div', { className: 'sampling-actions' }, [decide, nextDraw])
  ]);
  update();
  return el('article', { className: 'activity sampling-activity', attrs: {
    id: activity.id,
    'data-activity-type': 'sampling-lab',
    'data-content-source': 'module-json',
    'data-domain-engine': 'sampling-engine'
  } }, [body]);
}

function renderTruthLab(activity, emit) {
  const config = activity.config || {};
  if (config.domainEngine !== 'sampling-engine') throw new Error('truth-temperature-lab must delegate to sampling-engine');
  let started = false;
  const range = config.temperatureRange || { min: 0.3, max: 2, step: 0.1 };
  const temperature = el('input', { attrs: {
    type: 'range', min: range.min, max: range.max, step: range.step, value: config.initialTemperature ?? 1,
    'aria-label': 'Température du scénario de vérité', 'data-truth-temperature': ''
  } });
  const output = el('output', { attrs: { 'data-truth-temperature-output': '' } });
  const rows = el('div', { className: 'truth-distribution', attrs: { 'data-truth-rows': '' } });
  const feedback = feedbackBox();
  const capture = button('Capturer cette observation', { 'data-truth-capture': '' });
  let last = null;

  function update(emitChange = false) {
    last = decodeStep({ tokens: config.tokens, logits: config.logits, temperature: Number(temperature.value), strategy: 'greedy', filter: 'none' });
    output.value = Number(temperature.value).toFixed(1).replace('.', ',');
    rows.replaceChildren();
    last.tokens.forEach((token, index) => {
      rows.append(el('div', { className: 'truth-row', attrs: { 'data-truth-token': index } }, [
        el('span', { className: 'sampling-token', text: token }),
        el('div', { className: 'sampling-probbar', attrs: { 'aria-hidden': 'true' } }, [el('span', { attrs: { style: `width:${last.baseProbabilities[index] * 100}%` } })]),
        el('strong', { text: formatProbability(last.baseProbabilities[index]) })
      ]));
    });
    feedback.textContent = `Le candidat « ${last.selectedToken} » reste l'argmax. Changer T modifie seulement la concentration de la distribution calculée : aucune source externe n'est consultée et aucune vérité n'est vérifiée.`;
    if (emitChange) emit('manipulation.changed', activity.id, { temperature: last.temperature, probabilities: [...last.baseProbabilities], selectedToken: last.selectedToken });
  }

  temperature.addEventListener('input', () => {
    if (!started) { started = true; emit('activity.started', activity.id, {}); }
    update(true);
  });
  capture.addEventListener('click', () => {
    if (!started) { started = true; emit('activity.started', activity.id, {}); }
    update(false);
    emit('feedback.shown', activity.id, { temperature: last.temperature, selectedToken: last.selectedToken });
    emit('attempt.completed', activity.id, { temperature: last.temperature, probabilities: [...last.baseProbabilities], truthVerified: false });
  });

  const body = el('div', { className: 'truth-lab-v3' }, [
    ...activityHeader(activity, 'Truth Trap'),
    el('label', { className: 'sampling-field truth-temperature-field' }, [el('span', { text: 'Température T' }), el('div', { className: 'sampling-range-row' }, [temperature, output])]),
    rows,
    feedback,
    capture
  ]);
  update(false);
  return el('article', { className: 'activity sampling-activity truth-activity', attrs: {
    id: activity.id,
    'data-activity-type': 'truth-temperature-lab',
    'data-content-source': 'module-json',
    'data-domain-engine': 'sampling-engine'
  } }, [body]);
}

function renderAutoregressiveLab(activity, emit) {
  const config = activity.config || {};
  if (config.domainEngine !== 'sampling-engine') throw new Error('autoregressive-lab must delegate to sampling-engine');
  let stateId = config.initialStateId || 'start';
  let context = [config.prompt || ''];
  let step = 0;
  let started = false;

  const stateOutput = el('strong', { attrs: { 'data-loop-state': '' } });
  const contextOutput = el('div', { className: 'autoregressive-context', attrs: { 'data-loop-context': '' } });
  const candidateRows = el('div', { className: 'loop-candidates', attrs: { 'data-loop-candidates': '' } });
  const history = el('ol', { className: 'loop-history', attrs: { 'data-loop-history': '' } });
  const feedback = feedbackBox();
  const generate = button('Générer 1 token', { 'data-loop-generate': '' });
  const reset = button('Réinitialiser la boucle', { 'data-loop-reset': '' });

  function currentPreview() {
    const node = config.graph?.[stateId];
    if (!node) return null;
    return decodeStep({
      tokens: node.tokens,
      logits: node.logits,
      temperature: config.temperature ?? 1,
      strategy: config.strategy || 'sample',
      filter: config.filter || 'none',
      topK: config.topK || 1,
      topP: config.topP || 0.9,
      randomValue: randomFromSeed(config.seed ?? 23, step)
    });
  }

  function render() {
    stateOutput.textContent = stateId || 'fin';
    contextOutput.textContent = context.join('');
    candidateRows.replaceChildren();
    const preview = currentPreview();
    if (preview) {
      preview.tokens.forEach((token, index) => candidateRows.append(el('div', { className: 'loop-candidate' }, [
        el('span', { className: 'sampling-token', text: token }),
        el('span', { text: formatProbability(preview.probabilities[index]) })
      ])));
      feedback.textContent = 'Une seule distribution locale est utilisée à cette étape. Après sélection, le token rejoint le contexte et la simulation passe à un nouvel état de logits.';
    } else {
      candidateRows.append(el('p', { text: 'Séquence terminée : réinitialisez pour recommencer.' }));
      feedback.textContent = 'La boucle s’arrête ici. Les poids du modèle n’ont pas changé : seul le contexte généré s’est allongé.';
    }
  }

  generate.addEventListener('click', () => {
    if (!started) { started = true; emit('activity.started', activity.id, {}); }
    if (!stateId) { feedback.textContent = 'La séquence est terminée. Utilisez Réinitialiser pour recommencer.'; return; }
    const result = advanceAutoregressive({
      graph: config.graph,
      stateId,
      context,
      temperature: config.temperature ?? 1,
      strategy: config.strategy || 'sample',
      filter: config.filter || 'none',
      topK: config.topK || 1,
      topP: config.topP || 0.9,
      randomValue: randomFromSeed(config.seed ?? 23, step)
    });
    const item = el('li', { text: `Étape ${step + 1} · ${result.stateId} → « ${result.decision.selectedToken} » → ${result.nextStateId ?? 'fin'}` });
    history.append(item);
    context = [...result.contextAfter];
    stateId = result.nextStateId;
    step += 1;
    emit('manipulation.changed', activity.id, { step, selectedToken: result.decision.selectedToken, fromState: result.stateId, toState: result.nextStateId, context: [...context] });
    emit('feedback.shown', activity.id, { step, context: [...context] });
    emit('attempt.completed', activity.id, { step, selectedToken: result.decision.selectedToken, nextStateId: result.nextStateId, context: [...context] });
    render();
  });

  reset.addEventListener('click', () => {
    stateId = config.initialStateId || 'start';
    context = [config.prompt || ''];
    step = 0;
    history.replaceChildren();
    emit('manipulation.changed', activity.id, { source: 'reset' });
    render();
  });

  const body = el('div', { className: 'autoregressive-lab-v3' }, [
    ...activityHeader(activity, 'Autoregressive Loop Lab'),
    el('div', { className: 'loop-status-grid' }, [
      el('div', {}, [el('span', { text: 'État de décodage' }), stateOutput]),
      el('div', {}, [el('span', { text: 'Contexte courant' }), contextOutput])
    ]),
    candidateRows,
    el('div', { className: 'sampling-actions' }, [generate, reset]),
    feedback,
    el('div', { className: 'loop-history-wrap' }, [el('strong', { text: 'Trace des décisions' }), history])
  ]);
  render();
  return el('article', { className: 'activity sampling-activity autoregressive-activity', attrs: {
    id: activity.id,
    'data-activity-type': 'autoregressive-lab',
    'data-content-source': 'module-json',
    'data-domain-engine': 'sampling-engine'
  } }, [body]);
}

export function enhanceSamplingActivities({ root, view, emit }) {
  if (!root || !view || typeof emit !== 'function') return;
  const renderers = new Map([
    ['sampling-lab', renderSamplingLab],
    ['truth-temperature-lab', renderTruthLab],
    ['autoregressive-lab', renderAutoregressiveLab]
  ]);
  const activities = view.sections.flatMap((section) => section.activities || []).filter((activity) => renderers.has(activity.type));
  for (const activity of activities) {
    const placeholder = root.querySelector(`#${CSS.escape(activity.id)}`);
    if (!placeholder) continue;
    placeholder.replaceWith(renderers.get(activity.type)(activity, emit));
  }
}
