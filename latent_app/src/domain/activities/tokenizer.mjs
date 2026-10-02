export const DIDACTIC_BPE_MERGES = Object.freeze([
  ['t','e'],['te','x'],['tex','t'],['text','e'],
  ['e','x'],['ex','t'],['ext','r'],['extr','a'],
  ['o','r'],['or','d'],
  ['i','n'],['in','a'],['ina','i'],['inai','r'],['inair','e'],
  ['m','o'],['mo','d'],['è','l'],['èl','e'],
  ['b','o'],['bo','n'],['j','o'],['jo','u'],['jou','r'],['bon','jour'],
  ['t','o'],['to','k'],['tok','e'],['toke','n'],
  ['i','z'],['iz','e'],['ize','r'],['izer','s'],
  ['d','é'],['dé','c'],['o','u'],['ou','p'],['e','n'],['en','t'],['oup','ent'],
  ['l','e'],['le','s'],
  ['a','n'],['an','t'],['ant','i'],
  ['c','o'],['co','n'],
  ['s','t'],['st','i'],['sti','t'],['stit','u'],
  ['t','i'],['ti','o'],['tio','n'],
  ['n','e'],['ne','l'],
  ['e','m'],['em','e'],['eme','n'],['emen','t'],
  ['m','ent'],['le','ment'],['nel','lement']
].map((pair) => Object.freeze(pair)));

const WORD_RE = /^[\p{L}\p{M}\p{N}_]+$/u;
const SPACE_RE = /^\s+$/u;

export function splitText(text) {
  return String(text).match(/\s+|[\p{L}\p{M}\p{N}_]+|[^\s\p{L}\p{M}\p{N}_]/gu) || [];
}

export function applyRankedMerges(word, merges = DIDACTIC_BPE_MERGES) {
  const source = String(word);
  const normalized = source.normalize('NFC').toLocaleLowerCase('fr');
  let symbols = Array.from(normalized);
  const trace = [];

  for (const [left, right] of merges) {
    const next = [];
    let changed = false;
    for (let index = 0; index < symbols.length; index += 1) {
      if (index < symbols.length - 1 && symbols[index] === left && symbols[index + 1] === right) {
        next.push(left + right);
        index += 1;
        changed = true;
      } else {
        next.push(symbols[index]);
      }
    }
    if (changed) {
      symbols = next;
      trace.push(Object.freeze({ left, right, merged: left + right, state: Object.freeze([...symbols]) }));
    }
  }

  return Object.freeze({ source, normalized, tokens: Object.freeze([...symbols]), trace: Object.freeze(trace) });
}

function whitespaceTokens(chunk) {
  return Array.from(chunk, (character) => ({
    value: character,
    display: character === '\n' ? '↵' : character === '\t' ? '⇥' : '␠',
    kind: 'space'
  }));
}

function subwordTokens(text, merges) {
  const tokens = [];
  const words = [];
  for (const chunk of splitText(text)) {
    if (SPACE_RE.test(chunk)) {
      tokens.push(...whitespaceTokens(chunk));
      continue;
    }
    if (WORD_RE.test(chunk)) {
      const detail = applyRankedMerges(chunk, merges);
      words.push(detail);
      tokens.push(...detail.tokens.map((value) => ({ value, display: value, kind: 'subword' })));
      continue;
    }
    tokens.push({ value: chunk, display: chunk, kind: 'symbol' });
  }
  return { tokens, words };
}

function wordTokens(text) {
  return {
    words: [],
    tokens: splitText(text).flatMap((chunk) => {
      if (SPACE_RE.test(chunk)) return whitespaceTokens(chunk);
      return [{ value: chunk, display: chunk, kind: WORD_RE.test(chunk) ? 'word' : 'symbol' }];
    })
  };
}

function byteTokens(text) {
  const bytes = new TextEncoder().encode(String(text));
  return {
    words: [],
    tokens: Array.from(bytes, (byte) => ({
      value: byte,
      display: `0x${byte.toString(16).padStart(2, '0').toUpperCase()}`,
      kind: 'byte'
    }))
  };
}

export function tokenizeText(text, { mode = 'subword', contextLimit = 32, merges = DIDACTIC_BPE_MERGES } = {}) {
  const source = String(text);
  if (!Number.isInteger(contextLimit) || contextLimit < 1) throw new RangeError('contextLimit must be a positive integer');
  if (!['subword', 'word', 'byte'].includes(mode)) throw new RangeError(`Unsupported tokenizer mode: ${mode}`);

  const detail = mode === 'subword' ? subwordTokens(source, merges) : mode === 'word' ? wordTokens(source) : byteTokens(source);
  const tokenCount = detail.tokens.length;
  const used = Math.min(tokenCount, contextLimit);
  const overflow = Math.max(0, tokenCount - contextLimit);
  const available = Math.max(0, contextLimit - tokenCount);

  return Object.freeze({
    source,
    mode,
    tokens: Object.freeze(detail.tokens.map((token, index) => Object.freeze({ ...token, index, inContext: index < contextLimit }))),
    words: Object.freeze(detail.words),
    metrics: Object.freeze({
      characters: Array.from(source).length,
      bytes: new TextEncoder().encode(source).length,
      tokens: tokenCount,
      unique: new Set(detail.tokens.map((token) => `${token.kind}:${String(token.value)}`)).size
    }),
    context: Object.freeze({
      limit: contextLimit,
      used,
      available,
      overflow,
      withinBudget: overflow === 0,
      ratio: tokenCount === 0 ? 0 : used / contextLimit
    })
  });
}
