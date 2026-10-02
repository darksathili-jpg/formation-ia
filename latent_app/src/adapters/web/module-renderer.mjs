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
  return el('div', { className: 'feedback', attrs: { role: 'status', 'aria-live': 'polite' } });
}

function activityFrame(activity, body) {
  const meta = el('div', { className: 'activity-meta' }, [
    el('span', { text: activity.purpose }),
    el('span', { text: activity.type }),
    ...activity.evidenceIds.map((id) => el('span', { text: id }))
  ]);
  return el('article', { className: 'activity', id: activity.id }, [meta, body]);
}

function withStarted(activity, emit) {
  let started = false;
  return () => {
    if (started) return;
    started = true;
    emit('activity.started', activity.id, {});
  };
}

function renderPrediction(activity, emit) {
  const start = withStarted(activity, emit);
  const config = activity.config;
  const wrapper = el('div');
  wrapper.append(el('h3', { text: config.title || 'Prédire' }), el('p', { className: 'activity-intro', text: config.instruction || '' }));
  const rows = [];

  for (const item of config.items || []) {
    const select = el('select', { attrs: { 'aria-label': `Réponse : ${item.situation}` } });
    select.append(el('option', { text: 'Je prédis…', attrs: { value: '' } }));
    for (const choice of item.choices || []) select.append(el('option', { text: ORIGIN_LABELS[choice] || choice, attrs: { value: choice } }));
    select.addEventListener('change', start);
    const rationale = el('p', { className: 'item-feedback', text: item.feedback });
    rationale.hidden = true;
    const row = el('div', { className: 'prediction-row' }, [el('strong', { text: item.situation }), select, rationale]);
    wrapper.append(row);
    rows.push({ item, select, rationale, row });
  }

  const result = feedbackBox();
  const check = button('Vérifier mes prédictions');
  check.addEventListener('click', () => {
    start();
    let score = 0;
    let answered = 0;
    for (const row of rows) {
      const answer = row.select.value;
      if (!answer) continue;
      answered += 1;
      const correct = answer === row.item.answer;
      if (correct) score += 1;
      row.row.dataset.state = correct ? 'correct' : 'wrong';
      row.rationale.hidden = false;
      emit('prediction.submitted', activity.id, { itemId: row.item.id, answer, correct });
      emit('feedback.shown', activity.id, { itemId: row.item.id, correct });
    }
    result.textContent = answered < rows.length
      ? `Répondez encore à ${rows.length - answered} situation(s). Les feedbacks déjà disponibles restent visibles.`
      : `${score}/${rows.length}. L'objectif est surtout de pouvoir expliquer pourquoi chaque capacité vient de cette couche.`;
    if (answered === rows.length) emit('attempt.completed', activity.id, { score, total: rows.length });
  });
  wrapper.append(check, result);
  return activityFrame(activity, wrapper);
}

function renderWorkedExample(activity) {
  const config = activity.config;
  const body = el('div', {}, [
    el('h3', { text: 'Exemple travaillé' }),
    el('p', { className: 'worked-situation', text: config.situation }),
    el('ol', { className: 'worked-steps' }, (config.steps || []).map((step) => el('li', { text: step })))
  ]);
  return activityFrame(activity, body);
}

function renderComponentBuilder(activity, emit) {
  const start = withStarted(activity, emit);
  const config = activity.config;
  const body = el('div');
  body.append(el('h3', { text: 'System Builder' }), el('p', { className: 'activity-intro', text: config.goal }));

  const missionSelect = el('select', { attrs: { 'aria-label': 'Mission à rendre possible' } });
  for (const mission of config.missions || []) missionSelect.append(el('option', { text: MISSION_LABELS[mission.id] || mission.id, attrs: { value: mission.id } }));
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
    const label = el('label', { className: 'component-toggle' }, [input, el('span', { text: COMPONENT_LABELS[component] || component })]);
    componentGrid.append(label);
    controls.push({ component, input });
  }
  body.append(componentGrid);

  const result = feedbackBox();
  const check = button('Tester cette architecture');
  check.addEventListener('click', () => {
    start();
    const mission = (config.missions || []).find((item) => item.id === missionSelect.value);
    const selected = controls.filter(({ input }) => input.checked).map(({ component }) => component);
    const missing = (mission?.needs || []).filter((need) => !selected.includes(need));
    const extras = selected.filter((item) => !(mission?.needs || []).includes(item));
    const capable = missing.length === 0;
    if (!capable) {
      result.textContent = `Il manque : ${missing.map((item) => COMPONENT_LABELS[item] || item).join(', ')}. Ajoutez uniquement ce qui rend la mission possible.`;
    } else if (extras.length) {
      result.textContent = `Mission possible, mais architecture suréquipée : ${extras.map((item) => COMPONENT_LABELS[item] || item).join(', ')} n'est pas nécessaire ici.`;
    } else {
      result.textContent = 'Configuration minimale correcte. Chaque capacité supplémentaire devrait maintenant pouvoir être reliée à un composant précis.';
    }
    emit('feedback.shown', activity.id, { missionId: mission?.id, capable, missing, extras });
    emit('attempt.completed', activity.id, { missionId: mission?.id, capable, minimal: capable && extras.length === 0 });
  });
  body.append(check, result);
  return activityFrame(activity, body);
}

function renderRankOrder(activity, emit) {
  const start = withStarted(activity, emit);
  const config = activity.config;
  const body = el('div');
  body.append(el('h3', { text: 'Family Lab' }), el('p', { className: 'activity-intro', text: 'Construisez la chaîne du champ le plus large vers la famille la plus spécifique. La réponse n’apparaît pas avant votre essai.' }));
  const pool = el('div', { className: 'rank-pool' });
  const chosen = el('div', { className: 'rank-chosen', attrs: { 'aria-live': 'polite' } });
  let order = [];

  function render() {
    pool.replaceChildren();
    chosen.replaceChildren();
    for (const item of config.items || []) {
      if (order.includes(item)) continue;
      const pick = button(item, 'chip-button');
      pick.addEventListener('click', () => { start(); order.push(item); emit('manipulation.changed', activity.id, { order: [...order] }); render(); });
      pool.append(pick);
    }
    order.forEach((item, index) => chosen.append(el('span', { className: 'rank-item', text: `${index + 1}. ${item}` })));
  }
  render();

  const result = feedbackBox();
  const check = button('Vérifier la chaîne');
  const reset = button('Recommencer', 'button secondary');
  reset.addEventListener('click', () => { order = []; result.textContent = ''; render(); });
  check.addEventListener('click', () => {
    start();
    const expected = config.answer || [];
    const correct = order.length === expected.length && order.every((item, index) => item === expected[index]);
    result.textContent = correct ? config.explanationAfterSuccess : 'La chaîne est à reconstruire. Repartez du champ général puis resserrez progressivement.';
    emit('feedback.shown', activity.id, { correct });
    emit('attempt.completed', activity.id, { correct, order: [...order] });
  });
  body.append(pool, chosen, el('div', { className: 'button-row' }, [check, reset]), result);
  return activityFrame(activity, body);
}

function renderSelfExplanation(activity, emit) {
  const start = withStarted(activity, emit);
  const config = activity.config;
  const body = el('div');
  body.append(el('h3', { text: 'Expliquer avec ses mots' }), el('p', { className: 'activity-intro', text: config.prompt }));
  const textarea = el('textarea', { attrs: { rows: 5, placeholder: 'Votre explication…' } });
  textarea.addEventListener('input', start);
  body.append(textarea, el('p', { className: 'small-note', text: 'LATENT ne prétend pas noter automatiquement cette explication. Utilisez les critères pour vous relire.' }));
  const criteria = el('div', { className: 'criteria-list' });
  const checks = [];
  for (const criterion of config.criteria || []) {
    const input = el('input', { attrs: { type: 'checkbox' } });
    const label = el('label', {}, [input, el('span', { text: criterion })]);
    criteria.append(label);
    checks.push(input);
  }
  const save = button('Enregistrer mon auto-vérification');
  const result = feedbackBox();
  save.addEventListener('click', () => {
    start();
    const checked = checks.filter((input) => input.checked).length;
    result.textContent = `${checked}/${checks.length} critères retrouvés dans votre explication. Revenez au System Builder si un rôle reste difficile à justifier.`;
    emit('explanation.self_checked', activity.id, { checked, total: checks.length, characters: textarea.value.length });
  });
  body.append(criteria, save, result);
  return activityFrame(activity, body);
}

function renderScoredItems(activity, items, emit, onEvidence, kind) {
  const start = withStarted(activity, emit);
  const body = el('div');
  const title = kind === 'quiz' ? 'Quiz de récupération' : 'Transfert — changer de contexte';
  body.append(el('h3', { text: title }));
  if (kind === 'transfer' && activity.config.scenario) body.append(el('p', { className: 'transfer-scenario', text: activity.config.scenario }));
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
    const rationale = el('p', { className: 'item-feedback', text: item.feedback });
    rationale.hidden = true;
    fieldset.append(rationale);
    body.append(fieldset);
    rows.push({ item, inputs, rationale, fieldset });
  }

  const result = feedbackBox();
  const submit = button(kind === 'quiz' ? 'Corriger le quiz' : 'Vérifier le transfert');
  submit.addEventListener('click', () => {
    start();
    let score = 0;
    let answered = 0;
    for (const row of rows) {
      const selected = row.inputs.find((input) => input.checked);
      if (!selected) continue;
      answered += 1;
      const answer = Number(selected.value);
      const correct = answer === row.item.answer;
      if (correct) score += 1;
      row.fieldset.dataset.state = correct ? 'correct' : 'wrong';
      row.rationale.hidden = false;
      if (kind === 'quiz') emit('quiz.answered', activity.id, { itemId: row.item.id, answer, correct });
    }
    if (answered < rows.length) {
      result.textContent = `Il reste ${rows.length - answered} réponse(s) à donner.`;
      return;
    }
    const ratio = rows.length ? score / rows.length : 0;
    result.textContent = `${score}/${rows.length} · ${Math.round(ratio * 100)} %. ${ratio >= (activity.config.threshold || 0.8) ? 'Seuil atteint.' : 'Reprenez les feedbacks puis réessayez.'}`;
    emit(kind === 'transfer' ? 'transfer.completed' : 'attempt.completed', activity.id, { score, total: rows.length, ratio });
    if (kind === 'quiz') emit('attempt.completed', activity.id, { score, total: rows.length, ratio });
    onEvidence(kind, score, rows.length);
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

export function renderModule({ root, navigation, view, assessmentBank = {}, emit, onEvidence }) {
  if (!root) throw new Error('root is required');
  root.replaceChildren();
  navigation?.replaceChildren();

  const header = el('header', { className: 'module-hero' }, [
    el('p', { className: 'eyebrow', text: `${view.track.toUpperCase()} · ${view.status} · ${view.version}` }),
    el('h1', { text: view.title }),
    el('p', { className: 'lead', text: 'Ce module est rendu à partir du contrat de contenu V3 : compétences, preuves, tâches et progression ne sont plus codées dans la page HTML.' }),
    el('div', { className: 'badges' }, [
      el('span', { text: `${view.estimatedMinutes || '?'} min` }),
      el('span', { text: `${view.outcomes.length} objectifs observables` }),
      el('span', { text: `${view.sections.length} micro-séquences` })
    ])
  ]);
  root.append(header);

  for (const section of view.sections) {
    const sectionNode = el('section', { className: 'module-section', id: `section-${section.id}` });
    sectionNode.append(el('div', { className: 'section-head' }, [
      el('span', { text: String(section.ordinal).padStart(2, '0') }),
      el('h2', { text: section.title })
    ]));

    if (navigation) {
      const link = el('a', { text: `${String(section.ordinal).padStart(2, '0')} ${section.title}`, attrs: { href: `#section-${section.id}` } });
      navigation.append(link);
    }

    for (const activity of section.activities) {
      let node;
      if (activity.type === 'prediction-cards') node = renderPrediction(activity, emit);
      else if (activity.type === 'worked-example') node = renderWorkedExample(activity);
      else if (activity.type === 'component-builder') node = renderComponentBuilder(activity, emit);
      else if (activity.type === 'rank-order') node = renderRankOrder(activity, emit);
      else if (activity.type === 'self-explanation') node = renderSelfExplanation(activity, emit);
      else if (activity.type === 'quiz') node = renderScoredItems(activity, assessmentBank.quiz || [], emit, onEvidence, 'quiz');
      else if (activity.type === 'transfer-cards') node = renderScoredItems(activity, assessmentBank.transfer || [], emit, onEvidence, 'transfer');
      else node = renderUnsupported(activity);
      sectionNode.append(node);
    }
    root.append(sectionNode);
  }
}
