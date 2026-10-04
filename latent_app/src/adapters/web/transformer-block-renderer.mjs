import { evaluatePreNormBlock } from '../../domain/activities/transformer-block.mjs';
import { representAtPosition } from '../../domain/activities/position.mjs';
import { evaluateKvCache } from '../../domain/activities/kv-cache.mjs';

function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.text != null) node.textContent = String(options.text);
  for (const [name, value] of Object.entries(options.attrs || {})) if (value != null) node.setAttribute(name, String(value));
  for (const child of Array.isArray(children) ? children : [children]) if (child) node.append(child);
  return node;
}

function button(label, className = 'button') {
  return el('button', { className, text: label, attrs: { type: 'button' } });
}

function feedbackBox() {
  return el('div', { className: 'feedback', attrs: { role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' } });
}

function startedOnce(activity, emit) {
  let started = false;
  return () => {
    if (started) return;
    started = true;
    emit('activity.started', activity.id, {});
  };
}

function frame(activity, body, engine) {
  body.prepend(el('div', { className: 'activity-meta' }, [
    el('span', { text: activity.purpose }),
    el('span', { text: activity.type }),
    ...(activity.evidenceIds || []).map((id) => el('span', { text: id }))
  ]));
  return el('article', {
    className: `activity ${activity.type}-activity`,
    attrs: {
      id: activity.id,
      'data-activity-type': activity.type,
      'data-content-source': 'module-json',
      'data-domain-engine': engine
    }
  }, [body]);
}

function vectorText(vector) {
  return `[${vector.map((value) => Number(value).toFixed(3)).join(', ')}]`;
}

function renderPositionLab(activity, emit) {
  const config = activity.config || {};
  if (config.domainEngine !== 'position-engine') throw new Error('position-lab must delegate to position-engine');
  const start = startedOnce(activity, emit);
  const body = el('div', { className: 'position-lab-v3' }, [
    el('h3', { text: config.title || 'Position Lab' }),
    el('p', { className: 'activity-intro', text: config.instruction || '' })
  ]);

  const mode = el('select', { attrs: { 'aria-label': 'Mode de représentation positionnelle', 'data-position-mode': '' } });
  [['none','Aucune information de position'],['absolute','Ajout absolu didactique'],['rope','RoPE simplifié']].forEach(([value,label]) => mode.append(el('option', { text: label, attrs: { value } })));
  mode.value = 'rope';
  const position = el('input', { attrs: { type: 'range', min: 0, max: config.maxPosition ?? 8, step: 1, value: config.initialPosition ?? 2, 'aria-label': 'Position du token', 'data-position-index': '' } });
  const positionOut = el('output', { attrs: { 'data-position-value': '' } });
  const base = el('code', { text: vectorText(config.baseVector || [1,0]), attrs: { 'data-position-base': '' } });
  const positioned = el('code', { attrs: { 'data-position-result': '' } });
  const identity = el('strong', { attrs: { 'data-position-token-id': '' } });
  const feedback = feedbackBox();
  let last;

  function update(emitChange = false, source = 'render') {
    last = representAtPosition({
      tokenId: config.tokenId,
      vector: config.baseVector,
      position: Number(position.value),
      mode: mode.value
    });
    positionOut.textContent = String(last.position);
    identity.textContent = String(last.tokenId);
    positioned.textContent = vectorText(last.positioned);
    feedback.textContent = last.mode === 'none'
      ? 'Sans information positionnelle, le même vecteur de base est conservé : l’ordre n’entre pas dans cette représentation.'
      : `Le token garde l’ID ${last.tokenId}, mais ses coordonnées utilisées par la simulation dépendent maintenant de la position ${last.position}.`;
    if (emitChange) emit('manipulation.changed', activity.id, { source, tokenId: last.tokenId, position: last.position, mode: last.mode, positioned: [...last.positioned] });
  }

  mode.addEventListener('change', () => { start(); update(true, 'mode'); });
  position.addEventListener('input', () => { start(); update(true, 'position'); });
  const capture = button('Capturer cette position');
  capture.addEventListener('click', () => {
    start(); update(false);
    const payload = { tokenId: last.tokenId, position: last.position, mode: last.mode, positioned: [...last.positioned] };
    emit('feedback.shown', activity.id, payload); emit('attempt.completed', activity.id, payload);
  });

  body.append(
    el('div', { className: 'position-controls' }, [
      el('label', {}, [el('span', { text: 'Mode' }), mode]),
      el('label', {}, [el('span', { text: 'Position' }), position, positionOut])
    ]),
    el('div', { className: 'position-readout' }, [
      el('div', {}, [el('span', { text: 'Token ID (inchangé)' }), identity]),
      el('div', {}, [el('span', { text: 'Vecteur de base' }), base]),
      el('div', {}, [el('span', { text: 'Représentation positionnée' }), positioned])
    ]),
    feedback,
    capture
  );
  update(false);
  return frame(activity, body, 'position-engine');
}

function renderBlockLab(activity, emit) {
  const config = activity.config || {};
  if (config.domainEngine !== 'transformer-block-engine') throw new Error('transformer-block-lab must delegate to transformer-block-engine');
  const start = startedOnce(activity, emit);
  const body = el('div', { className: 'transformer-block-lab-v3' }, [
    el('h3', { text: config.title || 'Block Lab' }),
    el('p', { className: 'activity-intro', text: config.instruction || '' })
  ]);

  const normalization = el('input', { attrs: { type: 'checkbox', checked: '', 'data-block-toggle': 'normalization' } }); normalization.checked = true;
  const residual = el('input', { attrs: { type: 'checkbox', checked: '', 'data-block-toggle': 'residual' } }); residual.checked = true;
  const mlp = el('input', { attrs: { type: 'checkbox', checked: '', 'data-block-toggle': 'mlp' } }); mlp.checked = true;
  const stages = el('div', { className: 'block-stage-grid', attrs: { 'data-block-stages': '' } });
  const feedback = feedbackBox();
  let last;

  const stageDefs = [
    ['input','Entrée x'], ['norm1','Norm(x)'], ['attentionUpdate','Mise à jour attention'],
    ['afterAttention','Après résidu attention'], ['norm2','Norm(x₁)'], ['mlpUpdate','Mise à jour MLP'], ['output','Sortie du bloc']
  ];

  function update(emitChange = false, source = 'render') {
    last = evaluatePreNormBlock({
      input: config.input,
      attentionGain: config.attentionGain,
      mlpGain: config.mlpGain,
      normalization: normalization.checked,
      residual: residual.checked,
      mlp: mlp.checked
    });
    stages.replaceChildren();
    for (const [key, label] of stageDefs) {
      stages.append(el('div', { className: 'block-stage', attrs: { 'data-block-stage': key } }, [
        el('span', { text: label }),
        el('code', { text: vectorText(last[key]) })
      ]));
    }
    feedback.textContent = `Simulation ${last.architecture} : normalisation ${last.normalization ? 'active' : 'inactive'}, résidu ${last.residual ? 'actif' : 'inactif'}, MLP ${last.mlp ? 'actif' : 'inactif'}. Les gains sont fictifs ; on observe la structure des mises à jour, pas la qualité d’un modèle réel.`;
    if (emitChange) emit('manipulation.changed', activity.id, { source, normalization: last.normalization, residual: last.residual, mlp: last.mlp, output: [...last.output] });
  }

  for (const [input, source] of [[normalization,'normalization'],[residual,'residual'],[mlp,'mlp']]) input.addEventListener('change', () => { start(); update(true, source); });
  const capture = button('Capturer cet état du bloc');
  capture.addEventListener('click', () => {
    start(); update(false);
    const payload = { normalization: last.normalization, residual: last.residual, mlp: last.mlp, output: [...last.output] };
    emit('feedback.shown', activity.id, payload); emit('attempt.completed', activity.id, payload);
  });

  body.append(
    el('div', { className: 'block-controls' }, [
      el('label', {}, [normalization, el('span', { text: 'Normalisation' })]),
      el('label', {}, [residual, el('span', { text: 'Connexion résiduelle' })]),
      el('label', {}, [mlp, el('span', { text: 'MLP / feed-forward' })])
    ]),
    stages,
    feedback,
    capture
  );
  update(false);
  return frame(activity, body, 'transformer-block-engine');
}

function renderKvCacheLab(activity, emit) {
  const config = activity.config || {};
  if (config.domainEngine !== 'kv-cache-engine') throw new Error('kv-cache-lab must delegate to kv-cache-engine');
  const start = startedOnce(activity, emit);
  const body = el('div', { className: 'kv-cache-lab-v3' }, [
    el('h3', { text: config.title || 'KV Cache Lab' }),
    el('p', { className: 'activity-intro', text: config.instruction || '' })
  ]);

  const past = el('input', { attrs: { type: 'range', min: config.minPastTokens ?? 0, max: config.maxPastTokens ?? 64, step: 1, value: config.initialPastTokens ?? 16, 'aria-label': 'Tokens passés déjà traités', 'data-kv-past': '' } });
  const pastOut = el('output', { attrs: { 'data-kv-past-value': '' } });
  const metrics = {
    without: el('strong', { attrs: { 'data-kv-metric': 'without' } }),
    with: el('strong', { attrs: { 'data-kv-metric': 'with' } }),
    saved: el('strong', { attrs: { 'data-kv-metric': 'saved' } }),
    stored: el('strong', { attrs: { 'data-kv-metric': 'stored' } })
  };
  const feedback = feedbackBox();
  let last;

  function update(emitChange = false) {
    last = evaluateKvCache({ pastTokenCount: Number(past.value), newTokenCount: config.newTokenCount ?? 1 });
    pastOut.textContent = `${last.pastTokenCount} tokens`;
    metrics.without.textContent = String(last.recomputedWithoutCache);
    metrics.with.textContent = String(last.computedWithCache);
    metrics.saved.textContent = String(last.computeSaved);
    metrics.stored.textContent = String(last.storedVectors);
    feedback.textContent = last.tradesComputeForMemory
      ? `Dans ce modèle de coût didactique, ${last.computeSaved} position(s) évitent un recalcul grâce à ${last.storedVectors} vecteurs K/V conservés. Ce cache n'est pas une mémoire utilisateur et ne modifie pas les poids.`
      : 'Sans positions passées, il n’y a encore rien à réutiliser. Le KV cache reste distinct d’une mémoire applicative persistante.';
    if (emitChange) emit('manipulation.changed', activity.id, { ...last });
  }

  past.addEventListener('input', () => { start(); update(true); });
  const capture = button('Capturer ce compromis');
  capture.addEventListener('click', () => {
    start(); update(false); emit('feedback.shown', activity.id, { ...last }); emit('attempt.completed', activity.id, { ...last });
  });

  body.append(
    el('label', { className: 'kv-cache-control' }, [el('span', { text: 'Positions passées déjà traitées' }), past, pastOut]),
    el('div', { className: 'kv-cache-kpis' }, [
      el('div', {}, [el('span', { text: 'Calculs sans cache' }), metrics.without]),
      el('div', {}, [el('span', { text: 'Nouvelles positions avec cache' }), metrics.with]),
      el('div', {}, [el('span', { text: 'Recalculs évités' }), metrics.saved]),
      el('div', {}, [el('span', { text: 'Vecteurs K/V conservés' }), metrics.stored])
    ]),
    feedback,
    capture
  );
  update(false);
  return frame(activity, body, 'kv-cache-engine');
}

export function enhanceTransformerBlockActivities({ root, view, emit }) {
  if (!root || !view || typeof emit !== 'function') return;
  const renderers = {
    'position-lab': renderPositionLab,
    'transformer-block-lab': renderBlockLab,
    'kv-cache-lab': renderKvCacheLab
  };
  for (const activity of view.sections.flatMap((section) => section.activities || [])) {
    const renderer = renderers[activity.type];
    if (!renderer) continue;
    const placeholder = root.querySelector(`#${CSS.escape(activity.id)}`);
    if (placeholder) placeholder.replaceWith(renderer(activity, emit));
  }
}
