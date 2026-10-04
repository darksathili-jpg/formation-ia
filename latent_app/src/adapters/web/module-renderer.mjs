import { evaluateComponentMission, evaluateOrder, scoreChoiceSet } from '../../domain/activities/decision.mjs';
import { tokenizeText } from '../../domain/activities/tokenizer.mjs';

const COMPONENT_LABELS = Object.freeze({
  model: 'LLM',
  ui: 'Interface',
  memory: 'Mémoire',
  retrieval: 'Recherche documentaire',
  tools: 'Outils / actions'
});

const MISSION_LABELS = Object.freeze({
  chat: 'Discuter et reformuler',
  docs: 'Répondre depuis un document actuel',
  remember: 'Retrouver une préférence demain',
  calendar: 'Créer réellement un événement'
});

const ORIGIN_LABELS = Object.freeze({
  model: 'Le modèle peut assurer cette génération',
  external: 'Un composant externe à ses poids est nécessaire'
});

function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text != null) node.textContent = String(options.text);
  if (options.id) node.id = options.id;
  for (const [name, value] of Object.entries(options.attrs || {})) {
    if (value != null) node.setAttribute(name, String(value));
  }
  for (const child of Array.isArray(children) ? children : [children]) {
    if (child) node.append(child);
  }
  return node;
}

function button(label, className = 'button') {
  return el('button', { className, text: label, attrs: { type: 'button' } });
}

function feedbackBox() {
  return el('div', { className: 'feedback', attrs: { role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' } });
}

function activityFrame(activity, body) {
  const meta = el('div', { className: 'activity-meta' }, [
    el('span', { text: activity.purpose }),
    el('span', { text: activity.type }),
    ...(activity.evidenceIds || []).map((id) => el('span', { text: id }))
  ]);
  return el('article', {
    className: 'activity',
    id: activity.id,
    attrs: { 'data-activity-type': activity.type, 'data-content-source': 'module-json' }
  }, [meta, body]);
}

function startedOnce(activity, emit) {
  let started = false;
  return () => {
    if (started) return;
    started = true;
    emit('activity.started', activity.id, {});
  };
}

function renderPrediction(activity, emit) {
  const start = startedOnce(activity, emit);
  const config = activity.config || {};
  const body = el('div');
  body.append(
    el('h3', { text: config.title || 'Prédire' }),
    el('p', { className: 'activity-intro', text: config.instruction || '' })
  );

  const rows = [];
  for (const item of config.items || []) {
    const select = el('select', { attrs: { 'aria-label': `Réponse : ${item.situation}` } });
    select.append(el('option', { text: 'Je prédis…', attrs: { value: '' } }));
    for (const choice of item.choices || []) {
      select.append(el('option', { text: ORIGIN_LABELS[choice] || choice, attrs: { value: choice } }));
    }
    select.addEventListener('change', start);
    const rationale = el('p', { className: 'item-feedback', text: item.feedback || '' });
    rationale.hidden = true;
    const row = el('div', { className: 'prediction-row' }, [
      el('strong', { text: item.situation }),
      select,
      rationale
    ]);
    body.append(row);
    rows.push({ item, select, rationale, row });
  }

  const result = feedbackBox();
  const check = button('Vérifier mes prédictions');
  check.addEventListener('click', () => {
    start();
    const responses = Object.fromEntries(rows.map(({ item, select }) => [item.id, select.value]));
    const evaluation = scoreChoiceSet(config.items || [], responses);

    for (const row of rows) {
      const itemResult = evaluation.results.find((entry) => entry.id === row.item.id);
      if (!itemResult?.answered) continue;
      row.row.dataset.state = itemResult.correct ? 'correct' : 'wrong';
      row.rationale.hidden = false;
      emit('prediction.submitted', activity.id, { itemId: row.item.id, answer: itemResult.answer, correct: itemResult.correct });
      emit('feedback.shown', activity.id, { itemId: row.item.id, correct: itemResult.correct });
    }

    result.textContent = evaluation.complete
      ? `${evaluation.score}/${evaluation.total}. Expliquez maintenant pourquoi chaque capacité vient de cette couche.`
      : `Il reste ${evaluation.total - evaluation.answered} situation(s) à traiter.`;

    if (evaluation.complete) emit('attempt.completed', activity.id, { score: evaluation.score, total: evaluation.total, ratio: evaluation.ratio });
  });

  body.append(check, result);
  return activityFrame(activity, body);
}

function renderWorkedExample(activity) {
  const config = activity.config || {};
  const body = el('div', {}, [
    el('h3', { text: 'Exemple travaillé' }),
    el('p', { className: 'worked-situation', text: config.situation || '' }),
    el('ol', { className: 'worked-steps' }, (config.steps || []).map((step) => el('li', { text: step })))
  ]);
  return activityFrame(activity, body);
}

function renderComponentBuilder(activity, emit) {
  const start = startedOnce(activity, emit);
  const config = activity.config || {};
  const body = el('div');
  body.append(
    el('h3', { text: 'System Builder' }),
    el('p', { className: 'activity-intro', text: config.goal || '' })
  );

  const missionSelect = el('select', { attrs: { 'aria-label': 'Mission à rendre possible' } });
  for (const mission of config.missions || []) {
    missionSelect.append(el('option', { text: MISSION_LABELS[mission.id] || mission.id, attrs: { value: mission.id } }));
  }
  missionSelect.addEventListener('change', start);
  body.append(el('label', { className: 'field-label', text: 'Mission' }), missionSelect);

  const componentGrid = el('div', { className: 'component-grid' });
  const controls = [];
  for (const component of config.components || []) {
    const input = el('input', { attrs: { type: 'checkbox', value: component } });
    input.addEventListener('change', () => {
      start();
      emit('manipulation.changed', activity.id, { component, enabled: input.checked, missionId: missionSelect.value });
    });
    componentGrid.append(el('label', { className: 'component-toggle' }, [
      input,
      el('span', { text: COMPONENT_LABELS[component] || component })
    ]));
    controls.push({ component, input });
  }
  body.append(componentGrid);

  const result = feedbackBox();
  const check = button('Tester cette architecture');
  check.addEventListener('click', () => {
    start();
    const mission = (config.missions || []).find((item) => item.id === missionSelect.value) || { id: missionSelect.value, needs: [] };
    const selected = controls.filter(({ input }) => input.checked).map(({ component }) => component);
    const evaluation = evaluateComponentMission(mission, selected);

    if (!evaluation.capable) {
      result.textContent = `Il manque : ${evaluation.missing.map((item) => COMPONENT_LABELS[item] || item).join(', ')}. Ajoutez seulement les capacités nécessaires.`;
    } else if (!evaluation.minimal) {
      result.textContent = `Mission possible, mais architecture suréquipée : ${evaluation.extras.map((item) => COMPONENT_LABELS[item] || item).join(', ')} n'est pas nécessaire ici.`;
    } else {
      result.textContent = 'Configuration minimale correcte. Vous pouvez relier chaque capacité visible à un composant précis.';
    }

    const payload = { missionId: mission.id, ...evaluation };
    emit('feedback.shown', activity.id, payload);
    emit('attempt.completed', activity.id, payload);
  });

  body.append(check, result);
  return activityFrame(activity, body);
}

function renderRankOrder(activity, emit) {
  const start = startedOnce(activity, emit);
  const config = activity.config || {};
  const body = el('div');
  body.append(
    el('h3', { text: 'Family Lab' }),
    el('p', { className: 'activity-intro', text: 'Construisez la chaîne du champ le plus large vers la famille la plus spécifique. La réponse reste cachée avant votre essai.' })
  );

  const pool = el('div', { className: 'rank-pool' });
  const chosen = el('div', { className: 'rank-chosen', attrs: { 'aria-live': 'polite' } });
  let order = [];

  function rerender() {
    pool.replaceChildren();
    chosen.replaceChildren();
    for (const item of config.items || []) {
      if (order.includes(item)) continue;
      const pick = button(item, 'chip-button');
      pick.addEventListener('click', () => {
        start();
        order = [...order, item];
        emit('manipulation.changed', activity.id, { order: [...order] });
        rerender();
      });
      pool.append(pick);
    }
    order.forEach((item, index) => chosen.append(el('span', { className: 'rank-item', text: `${index + 1}. ${item}` })));
  }
  rerender();

  const result = feedbackBox();
  const check = button('Vérifier la chaîne');
  const reset = button('Recommencer', 'button secondary');
  reset.addEventListener('click', () => {
    order = [];
    result.textContent = '';
    rerender();
  });
  check.addEventListener('click', () => {
    start();
    const evaluation = evaluateOrder(config.answer || [], order);
    result.textContent = evaluation.correct
      ? config.explanationAfterSuccess
      : evaluation.complete
        ? 'La chaîne contient tous les éléments mais leur ordre doit être revu.'
        : `Il manque encore ${evaluation.expectedLength - evaluation.actualLength} élément(s).`;
    emit('feedback.shown', activity.id, evaluation);
    emit('attempt.completed', activity.id, { ...evaluation, order: [...order] });
  });

  body.append(pool, chosen, el('div', { className: 'button-row' }, [check, reset]), result);
  return activityFrame(activity, body);
}

function renderSelfExplanation(activity, emit) {
  const start = startedOnce(activity, emit);
  const config = activity.config || {};
  const body = el('div');
  body.append(
    el('h3', { text: 'Expliquer avec ses mots' }),
    el('p', { className: 'activity-intro', text: config.prompt || '' })
  );

  const textarea = el('textarea', { attrs: { rows: 5, placeholder: 'Votre explication…', 'aria-label': 'Votre explication personnelle' } });
  textarea.addEventListener('input', start);
  body.append(
    textarea,
    el('p', { className: 'small-note', text: 'LATENT ne prétend pas noter sémantiquement cette réponse. Les critères servent à une auto-vérification explicite.' })
  );

  const criteria = el('div', { className: 'criteria-list' });
  const checks = [];
  for (const criterion of config.criteria || []) {
    const input = el('input', { attrs: { type: 'checkbox' } });
    criteria.append(el('label', {}, [input, el('span', { text: criterion })]));
    checks.push(input);
  }

  const save = button('Enregistrer mon auto-vérification');
  const result = feedbackBox();
  save.addEventListener('click', () => {
    start();
    const checked = checks.filter((input) => input.checked).length;
    result.textContent = `${checked}/${checks.length} critères retrouvés. Revenez au System Builder si un rôle reste difficile à justifier.`;
    emit('explanation.self_checked', activity.id, { checked, total: checks.length, characters: textarea.value.length });
  });

  body.append(criteria, save, result);
  return activityFrame(activity, body);
}

function renderTokenizerLab(activity, emit) {
  const start = startedOnce(activity, emit);
  const config = activity.config || {};
  const range = config.contextRange || { min: 1, max: 64, step: 1 };
  const body = el('div', { className: 'tokenizer-lab' });
  body.append(
    el('h3', { text: config.title || 'Tokenizer Lab' }),
    el('p', { className: 'activity-intro', text: config.instruction || '' })
  );

  const presetBar = el('div', { className: 'tokenizer-presets', attrs: { 'aria-label': 'Exemples de régression' } });
  const textInput = el('textarea', {
    attrs: {
      rows: 5,
      'data-tokenizer-input': '',
      'aria-label': 'Texte à analyser'
    }
  });
  textInput.value = config.initialText || '';

  const modeSelect = el('select', { attrs: { 'data-tokenizer-mode': '', 'aria-label': 'Mode de représentation' } });
  for (const mode of config.modes || []) {
    modeSelect.append(el('option', { text: mode.label || mode.id, attrs: { value: mode.id } }));
  }
  modeSelect.value = config.initialMode || 'subword';

  const contextInput = el('input', {
    attrs: {
      type: 'range',
      min: range.min,
      max: range.max,
      step: range.step,
      value: config.initialContextLimit || range.max,
      'data-tokenizer-limit': '',
      'aria-label': 'Limite de contexte'
    }
  });
  const contextValue = el('output', { attrs: { 'data-tokenizer-limit-value': '' } });

  for (const preset of config.presets || []) {
    const presetButton = button(preset.label || preset.id, 'chip-button tokenizer-preset');
    presetButton.dataset.presetId = preset.id;
    presetButton.addEventListener('click', () => {
      start();
      textInput.value = preset.text;
      modeSelect.value = 'subword';
      update(true, 'preset', preset.id);
      textInput.focus();
    });
    presetBar.append(presetButton);
  }

  const controls = el('div', { className: 'tokenizer-controls' }, [
    el('label', { className: 'tokenizer-field' }, [
      el('span', { text: 'Texte' }),
      textInput
    ]),
    el('div', { className: 'tokenizer-control-row' }, [
      el('label', { className: 'tokenizer-field' }, [
        el('span', { text: 'Vue' }),
        modeSelect
      ]),
      el('label', { className: 'tokenizer-field' }, [
        el('span', { text: 'Fenêtre de contexte' }),
        el('div', { className: 'tokenizer-range-row' }, [contextInput, contextValue])
      ])
    ])
  ]);

  const kpiCharacters = el('strong', { attrs: { 'data-tokenizer-kpi': 'characters' } });
  const kpiTokens = el('strong', { attrs: { 'data-tokenizer-kpi': 'tokens' } });
  const kpiUnique = el('strong', { attrs: { 'data-tokenizer-kpi': 'unique' } });
  const kpiBytes = el('strong', { attrs: { 'data-tokenizer-kpi': 'bytes' } });
  const kpis = el('div', { className: 'tokenizer-kpis' }, [
    el('div', {}, [kpiCharacters, el('span', { text: 'caractères' })]),
    el('div', {}, [kpiTokens, el('span', { text: 'unités' })]),
    el('div', {}, [kpiUnique, el('span', { text: 'uniques' })]),
    el('div', {}, [kpiBytes, el('span', { text: 'octets UTF-8' })])
  ]);

  const tokenList = el('div', {
    className: 'tokenizer-tokens',
    attrs: { 'data-tokenizer-tokens': '', 'aria-live': 'polite', 'aria-label': 'Unités produites' }
  });
  const modeHint = el('p', { className: 'small-note', attrs: { 'data-tokenizer-mode-hint': '' } });
  const meterUsed = el('span', { className: 'tokenizer-meter-used' });
  const meterOverflow = el('span', { className: 'tokenizer-meter-overflow' });
  const contextStatus = el('div', { className: 'tokenizer-context-status', attrs: { 'data-tokenizer-context-status': '' } });
  const meter = el('div', { className: 'tokenizer-meter', attrs: { 'aria-hidden': 'true' } }, [meterUsed, meterOverflow]);

  const traceTitle = el('strong', { text: 'Trace BPE didactique' });
  const traceFlow = el('div', { className: 'tokenizer-trace-flow', attrs: { 'data-tokenizer-trace': '' } });
  const traceResult = el('p', { className: 'small-note', attrs: { 'data-tokenizer-trace-result': '' } });
  const traceBox = el('div', { className: 'tokenizer-trace' }, [traceTitle, traceFlow, traceResult]);

  const snapshotFeedback = feedbackBox();
  const snapshot = button('Capturer cet essai');
  snapshot.dataset.tokenizerSnapshot = '';
  let lastResult = null;

  function update(emitChange = false, source = 'control', presetId = null) {
    const limit = Number(contextInput.value);
    lastResult = tokenizeText(textInput.value, { mode: modeSelect.value, contextLimit: limit });
    contextValue.textContent = `${lastResult.context.limit} unités`;
    kpiCharacters.textContent = String(lastResult.metrics.characters);
    kpiTokens.textContent = String(lastResult.metrics.tokens);
    kpiUnique.textContent = String(lastResult.metrics.unique);
    kpiBytes.textContent = String(lastResult.metrics.bytes);
    modeHint.textContent = lastResult.modeInfo.explanation;

    tokenList.replaceChildren();
    for (const token of lastResult.tokens) {
      tokenList.append(el('span', {
        className: `tokenizer-token ${token.kind}${token.inContext ? '' : ' overflow'}`,
        text: token.display,
        attrs: {
          'data-token-index': token.index,
          'data-token-kind': token.kind,
          'data-in-context': token.inContext ? 'true' : 'false'
        }
      }));
    }

    const usedRatio = lastResult.context.limit ? Math.min(1, lastResult.context.used / lastResult.context.limit) : 0;
    const overflowRatio = lastResult.metrics.tokens ? Math.min(1, lastResult.context.overflow / lastResult.metrics.tokens) : 0;
    meterUsed.style.width = `${usedRatio * 100}%`;
    meterOverflow.style.width = `${overflowRatio * 100}%`;
    contextStatus.textContent = lastResult.context.withinBudget
      ? `${lastResult.metrics.tokens} / ${lastResult.context.limit} · ${lastResult.context.available} disponible(s)`
      : `${lastResult.metrics.tokens} / ${lastResult.context.limit} · ${lastResult.context.overflow} hors fenêtre`;
    contextStatus.dataset.state = lastResult.context.withinBudget ? 'within' : 'overflow';

    const words = [...lastResult.words].sort((a, b) => b.source.length - a.source.length);
    const target = words[0];
    traceFlow.replaceChildren();
    if (lastResult.mode !== 'subword' || !target) {
      traceBox.hidden = true;
    } else {
      traceBox.hidden = false;
      const shown = target.trace.slice(0, config.traceLimit || 10);
      traceTitle.textContent = `Trace BPE didactique · « ${target.source} »`;
      if (!shown.length) {
        traceFlow.append(el('span', { className: 'tokenizer-trace-step', text: 'aucune fusion connue' }));
      } else {
        shown.forEach((step, index) => {
          if (index) traceFlow.append(el('span', { className: 'tokenizer-trace-arrow', text: '→' }));
          traceFlow.append(el('span', { className: 'tokenizer-trace-step', text: `${step.left} + ${step.right} → ${step.merged}` }));
        });
        if (target.trace.length > shown.length) {
          traceFlow.append(el('span', { className: 'tokenizer-trace-step', text: `+${target.trace.length - shown.length} fusion(s)` }));
        }
      }
      traceResult.textContent = `${target.source} → ${target.tokens.join(' | ')} · ${target.tokens.length} sous-unité(s)`;
    }

    if (emitChange) {
      emit('manipulation.changed', activity.id, {
        source,
        presetId,
        mode: lastResult.mode,
        characters: lastResult.metrics.characters,
        bytes: lastResult.metrics.bytes,
        tokens: lastResult.metrics.tokens,
        contextLimit: lastResult.context.limit,
        overflow: lastResult.context.overflow
      });
    }
  }

  textInput.addEventListener('input', () => { start(); update(true, 'text'); });
  modeSelect.addEventListener('change', () => { start(); update(true, 'mode'); });
  contextInput.addEventListener('input', () => { start(); update(true, 'context'); });
  snapshot.addEventListener('click', () => {
    start();
    update(false);
    const payload = {
      mode: lastResult.mode,
      source: lastResult.source,
      metrics: lastResult.metrics,
      context: lastResult.context
    };
    emit('tokenizer.snapshot', activity.id, payload);
    emit('attempt.completed', activity.id, payload);
    snapshotFeedback.textContent = lastResult.context.withinBudget
      ? `Essai enregistré : ${lastResult.metrics.tokens} unité(s), budget respecté.`
      : `Essai enregistré : dépassement de ${lastResult.context.overflow} unité(s).`;
  });

  body.append(
    presetBar,
    el('div', { className: 'tokenizer-grid' }, [
      controls,
      el('div', { className: 'tokenizer-output' }, [
        kpis,
        tokenList,
        modeHint,
        meter,
        contextStatus,
        traceBox,
        snapshot,
        snapshotFeedback
      ])
    ])
  );
  update(false);
  return activityFrame(activity, body);
}

function renderScoredItems(activity, items, emit, onEvidence, kind) {
  const start = startedOnce(activity, emit);
  const body = el('div');
  body.append(el('h3', { text: kind === 'quiz' ? 'Quiz de récupération' : 'Transfert — changer de contexte' }));
  if (kind === 'transfer' && activity.config?.scenario) {
    body.append(el('p', { className: 'transfer-scenario', text: activity.config.scenario }));
  }

  const rows = [];
  for (const [index, item] of items.entries()) {
    const fieldset = el('fieldset', { className: 'question' });
    fieldset.append(el('legend', { text: item.scenario ? `${item.scenario} — ${item.prompt}` : item.prompt }));
    const groupName = `${activity.id}-${item.id || index}`;
    const inputs = [];
    for (const [choiceIndex, choice] of item.choices.entries()) {
      const input = el('input', { attrs: { type: 'radio', name: groupName, value: choiceIndex } });
      input.addEventListener('change', start);
      fieldset.append(el('label', { className: 'choice' }, [input, el('span', { text: choice })]));
      inputs.push(input);
    }
    const rationale = el('p', { className: 'item-feedback', text: item.feedback || '' });
    rationale.hidden = true;
    fieldset.append(rationale);
    body.append(fieldset);
    rows.push({ item, inputs, rationale, fieldset });
  }

  const result = feedbackBox();
  const submit = button(kind === 'quiz' ? 'Corriger le quiz' : 'Vérifier le transfert');
  submit.addEventListener('click', () => {
    start();
    const responses = {};
    for (const row of rows) {
      const selected = row.inputs.find((input) => input.checked);
      if (selected) responses[row.item.id] = Number(selected.value);
    }
    const evaluation = scoreChoiceSet(items, responses);

    for (const row of rows) {
      const itemResult = evaluation.results.find((entry) => entry.id === row.item.id);
      if (!itemResult?.answered) continue;
      row.fieldset.dataset.state = itemResult.correct ? 'correct' : 'wrong';
      row.rationale.hidden = false;
      if (kind === 'quiz') emit('quiz.answered', activity.id, { itemId: row.item.id, answer: itemResult.answer, correct: itemResult.correct });
    }

    if (!evaluation.complete) {
      result.textContent = `Il reste ${evaluation.total - evaluation.answered} réponse(s) à donner.`;
      return;
    }

    const threshold = activity.config?.threshold ?? 0.8;
    result.textContent = `${evaluation.score}/${evaluation.total} · ${Math.round(evaluation.ratio * 100)} %. ${evaluation.ratio >= threshold ? 'Seuil atteint.' : 'Reprenez les feedbacks puis réessayez.'}`;
    const payload = { score: evaluation.score, total: evaluation.total, ratio: evaluation.ratio };
    if (kind === 'transfer') emit('transfer.completed', activity.id, payload);
    else emit('attempt.completed', activity.id, payload);
    onEvidence(kind, evaluation.score, evaluation.total);
  });

  body.append(submit, result);
  return activityFrame(activity, body);
}

function renderUnsupported(activity) {
  return activityFrame(activity, el('div', {}, [
    el('h3', { text: activity.type }),
    el('p', { className: 'activity-intro', text: 'Ce type d’activité est déclaré mais son adaptateur de rendu V3 n’est pas encore installé.' })
  ]));
}

export function renderActivity(activity, assessmentBank = {}, emit, onEvidence = () => {}) {
  if (activity.type === 'prediction-cards') return renderPrediction(activity, emit);
  if (activity.type === 'worked-example') return renderWorkedExample(activity);
  if (activity.type === 'component-builder') return renderComponentBuilder(activity, emit);
  if (activity.type === 'rank-order') return renderRankOrder(activity, emit);
  if (activity.type === 'self-explanation') return renderSelfExplanation(activity, emit);
  if (activity.type === 'tokenizer-lab') return renderTokenizerLab(activity, emit);
  if (activity.type === 'quiz') return renderScoredItems(activity, assessmentBank.quiz || [], emit, onEvidence, 'quiz');
  if (activity.type === 'transfer-cards') return renderScoredItems(activity, assessmentBank.transfer || [], emit, onEvidence, 'transfer');
  return renderUnsupported(activity);
}

export function renderModule({ root, navigation, view, assessmentBank = {}, emit, onEvidence }) {
  if (!root) throw new Error('root is required');
  if (typeof emit !== 'function') throw new Error('emit is required');
  if (typeof onEvidence !== 'function') throw new Error('onEvidence is required');

  root.replaceChildren();
  navigation?.replaceChildren();
  root.dataset.moduleId = view.id;
  root.dataset.contentVersion = view.version;
  root.dataset.renderedFrom = 'declarative-content';

  root.append(el('header', { className: 'module-hero' }, [
    el('p', { className: 'eyebrow', text: `${view.track.toUpperCase()} · ${view.status} · ${view.version}` }),
    el('h1', { text: view.title }),
    el('p', { className: 'lead', text: 'Ce module est rendu à partir du contrat de contenu V3 : compétences, preuves, tâches et progression ne sont plus codées dans la page HTML.' }),
    el('div', { className: 'badges' }, [
      el('span', { text: `${view.estimatedMinutes || '?'} min` }),
      el('span', { text: `${view.outcomes.length} objectifs observables` }),
      el('span', { text: `${view.sections.length} micro-séquences` })
    ])
  ]));

  for (const section of view.sections) {
    const sectionNode = el('section', { className: 'module-section', id: `section-${section.id}`, attrs: { 'data-section-id': section.id } });
    sectionNode.append(el('div', { className: 'section-head' }, [
      el('span', { text: String(section.ordinal).padStart(2, '0') }),
      el('h2', { text: section.title })
    ]));

    if (navigation) {
      navigation.append(el('a', {
        text: `${String(section.ordinal).padStart(2, '0')} ${section.title}`,
        attrs: { href: `#section-${section.id}` }
      }));
    }

    for (const activity of section.activities) {
      sectionNode.append(renderActivity(activity, assessmentBank, emit, onEvidence));
    }
    root.append(sectionNode);
  }
}
