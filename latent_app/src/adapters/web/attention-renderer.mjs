import { evaluateAttention } from '../../domain/activities/attention.mjs';

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

function button(label, className = 'button') {
  return el('button', { className, text: label, attrs: { type: 'button' } });
}

function feedbackBox() {
  return el('div', { className: 'feedback', attrs: { role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' } });
}

function renderAttentionLab(activity, emit) {
  const config = activity.config || {};
  if (config.domainEngine !== 'attention-engine') throw new Error('attention-lab must delegate to attention-engine');
  const scenarios = config.scenarios || [];
  if (!scenarios.length) throw new Error('attention-lab requires scenarios');

  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    emit('activity.started', activity.id, {});
  };

  const body = el('div', { className: 'attention-lab-v3' }, [
    el('div', { className: 'activity-meta' }, [
      el('span', { text: activity.purpose }),
      el('span', { text: activity.type }),
      ...(activity.evidenceIds || []).map((id) => el('span', { text: id }))
    ]),
    el('h3', { text: config.title || 'Attention Lab' }),
    el('p', { className: 'activity-intro', text: config.instruction || '' })
  ]);

  const scenarioSelect = el('select', { attrs: { 'aria-label': 'Situation à analyser', 'data-attention-scenario': '' } });
  scenarios.forEach((scenario) => scenarioSelect.append(el('option', { text: scenario.label || scenario.id, attrs: { value: scenario.id } })));
  scenarioSelect.value = config.initialScenarioId || scenarios[0].id;

  const causalInput = el('input', { attrs: { type: 'checkbox', 'data-attention-causal': '' } });
  const scalingInput = el('input', { attrs: { type: 'checkbox', checked: '', 'data-attention-scaling': '' } });
  scalingInput.checked = true;

  const controls = el('div', { className: 'attention-controls' }, [
    el('label', { className: 'attention-field' }, [el('span', { text: 'Situation' }), scenarioSelect]),
    el('label', { className: 'attention-toggle' }, [causalInput, el('span', { text: 'Masque causal' })]),
    el('label', { className: 'attention-toggle' }, [scalingInput, el('span', { text: 'Scaling 1/√dₖ' })])
  ]);

  const tokenStrip = el('div', { className: 'attention-token-strip', attrs: { 'data-attention-tokens': '' } });
  const tableBody = el('tbody', { attrs: { 'data-attention-rows': '' } });
  const table = el('div', { className: 'attention-table-wrap' }, [
    el('table', { className: 'attention-table' }, [
      el('thead', {}, [el('tr', {}, [
        el('th', { text: 'Position' }),
        el('th', { text: 'Q·K' }),
        el('th', { text: 'Score utilisé' }),
        el('th', { text: 'Poids' })
      ])]),
      tableBody
    ])
  ]);
  const output = el('code', { className: 'attention-output-vector', attrs: { 'data-attention-output': '' } });
  const explanation = feedbackBox();
  const capture = button('Capturer cet essai');
  capture.dataset.attentionSnapshot = '';
  let last = null;

  function scenario() {
    return scenarios.find((item) => item.id === scenarioSelect.value) || scenarios[0];
  }

  function update(emitChange = false, source = 'render') {
    const current = scenario();
    last = evaluateAttention({
      query: current.query,
      keys: current.keys,
      values: current.values,
      queryIndex: current.queryIndex,
      causal: causalInput.checked,
      scaling: scalingInput.checked
    });

    tokenStrip.replaceChildren();
    current.tokens.forEach((token, index) => {
      tokenStrip.append(el('span', {
        className: `attention-token${index === current.queryIndex ? ' query' : ''}${last.weights[index] === 0 ? ' masked' : ''}`,
        text: `${index}: ${token}`,
        attrs: {
          'data-query': index === current.queryIndex ? 'true' : 'false',
          'data-masked': last.weights[index] === 0 ? 'true' : 'false'
        }
      }));
    });

    tableBody.replaceChildren();
    current.tokens.forEach((token, index) => {
      const used = last.usedScores[index];
      tableBody.append(el('tr', {}, [
        el('td', { text: `${index} · ${token}` }),
        el('td', { text: last.rawScores[index].toFixed(3) }),
        el('td', { text: Number.isFinite(used) ? used.toFixed(3) : 'masqué' }),
        el('td', { text: last.weights[index].toFixed(3) })
      ]));
    });

    output.textContent = `sortie = [${last.output.map((value) => value.toFixed(3)).join(', ')}]`;
    const dominantIndex = last.weights.reduce((best, value, index, array) => value > array[best] ? index : best, 0);
    const maskedCount = last.weights.filter((value) => value === 0).length;
    explanation.textContent = `Somme des poids = ${last.weights.reduce((sum, value) => sum + value, 0).toFixed(3)}. Contribution maximale ici : position ${dominantIndex} (${current.tokens[dominantIndex]}). ${maskedCount ? `${maskedCount} position(s) reçoivent un poids nul à cause du masque. ` : ''}Un poids élevé décrit cette combinaison locale ; il ne prouve ni la vérité ni une explication complète du modèle.`;

    if (emitChange) {
      emit('manipulation.changed', activity.id, {
        source,
        scenarioId: current.id,
        causal: last.causal,
        scaling: last.scaling,
        weights: [...last.weights],
        output: [...last.output]
      });
    }
  }

  scenarioSelect.addEventListener('change', () => { start(); update(true, 'scenario'); });
  causalInput.addEventListener('change', () => { start(); update(true, 'causal'); });
  scalingInput.addEventListener('change', () => { start(); update(true, 'scaling'); });
  capture.addEventListener('click', () => {
    start();
    update(false);
    const current = scenario();
    const payload = {
      scenarioId: current.id,
      queryIndex: current.queryIndex,
      causal: last.causal,
      scaling: last.scaling,
      rawScores: [...last.rawScores],
      usedScores: [...last.usedScores],
      weights: [...last.weights],
      output: [...last.output]
    };
    emit('feedback.shown', activity.id, payload);
    emit('attempt.completed', activity.id, payload);
  });

  body.append(
    controls,
    tokenStrip,
    table,
    el('div', { className: 'attention-output' }, [el('span', { text: 'Somme pondérée des V' }), output]),
    explanation,
    capture
  );
  update(false);

  return el('article', {
    className: 'activity attention-activity',
    attrs: {
      id: activity.id,
      'data-activity-type': 'attention-lab',
      'data-content-source': 'module-json',
      'data-domain-engine': 'attention-engine'
    }
  }, [body]);
}

export function enhanceAttentionActivities({ root, view, emit }) {
  if (!root || !view || typeof emit !== 'function') return;
  const activities = view.sections.flatMap((section) => section.activities || []).filter((activity) => activity.type === 'attention-lab');
  for (const activity of activities) {
    const placeholder = root.querySelector(`#${CSS.escape(activity.id)}`);
    if (!placeholder) continue;
    placeholder.replaceWith(renderAttentionLab(activity, emit));
  }
}
