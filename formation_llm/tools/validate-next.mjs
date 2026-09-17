import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warnings = [];

async function loadJson(relativePath) {
  const raw = await readFile(resolve(ROOT, relativePath), "utf8");
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`JSON invalide dans ${relativePath} : ${error.message}`);
  }
}

function checkUnique(items, property, label) {
  const seen = new Set();
  for (const item of items) {
    const value = item[property];
    if (seen.has(value)) errors.push(`${label} : ${property} dupliqué "${value}"`);
    seen.add(value);
  }
}

function checkSchema(ajv, schema, data, label) {
  let validate;
  try {
    validate = ajv.compile(schema);
  } catch (error) {
    errors.push(`${label} : impossible de compiler le schéma : ${error.message}`);
    return;
  }
  if (!validate(data)) {
    for (const error of validate.errors ?? []) {
      errors.push(`${label}${error.instancePath || "/"} : ${error.message}`);
    }
  }
}

function checkDependencyCycles(concepts) {
  const graph = new Map(concepts.map(c => [c.id, c.prerequisites ?? []]));
  const state = new Map();
  const stack = [];

  function visit(id) {
    const s = state.get(id) ?? 0;
    if (s === 1) {
      const start = stack.indexOf(id);
      errors.push(`Cycle de prérequis détecté : ${[...stack.slice(start), id].join(" → ")}`);
      return;
    }
    if (s === 2) return;
    state.set(id, 1);
    stack.push(id);
    for (const dep of graph.get(id) ?? []) if (graph.has(dep)) visit(dep);
    stack.pop();
    state.set(id, 2);
  }
  for (const id of graph.keys()) visit(id);
}

function isFuture(dateString) {
  return Date.parse(`${dateString}T00:00:00Z`) > Date.now() + 86400000;
}

async function main() {
  const [knowledgeSchema, sourcesSchema, glossarySchema, knowledge, sourcesData, glossary] =
    await Promise.all([
      loadJson("schema/knowledge-map.schema.json"),
      loadJson("schema/sources.schema.json"),
      loadJson("schema/glossary.schema.json"),
      loadJson("data/knowledge-map.json"),
      loadJson("data/sources.json"),
      loadJson("data/glossary.json")
    ]);

  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);

  checkSchema(ajv, knowledgeSchema, knowledge, "knowledge-map.json");
  checkSchema(ajv, sourcesSchema, sourcesData, "sources.json");
  checkSchema(ajv, glossarySchema, glossary, "glossary.json");

  checkUnique(knowledge.domains ?? [], "id", "Domaines");
  checkUnique(knowledge.domains ?? [], "slug", "Domaines");
  checkUnique(knowledge.domains ?? [], "order", "Domaines");
  checkUnique(knowledge.concepts ?? [], "id", "Concepts");
  checkUnique(knowledge.concepts ?? [], "slug", "Concepts");
  checkUnique(sourcesData.sources ?? [], "id", "Sources");
  checkUnique(glossary.terms ?? [], "id", "Glossaire");
  checkUnique(glossary.terms ?? [], "slug", "Glossaire");

  const domainIds = new Set((knowledge.domains ?? []).map(x => x.id));
  const conceptIds = new Set((knowledge.concepts ?? []).map(x => x.id));
  const sourceIds = new Set((sourcesData.sources ?? []).map(x => x.id));
  const termIds = new Set((glossary.terms ?? []).map(x => x.id));

  if (isFuture(knowledge.updated_on)) errors.push("knowledge-map.json : updated_on est dans le futur");
  if (isFuture(sourcesData.updated_on)) errors.push("sources.json : updated_on est dans le futur");
  if (isFuture(glossary.updated_on)) errors.push("glossary.json : updated_on est dans le futur");

  for (const concept of knowledge.concepts ?? []) {
    if (!domainIds.has(concept.domain)) errors.push(`${concept.id} : domaine inconnu "${concept.domain}"`);
    if (!concept.id.startsWith(concept.domain)) errors.push(`${concept.id} : préfixe incompatible avec le domaine ${concept.domain}`);
    if (isFuture(concept.reviewed_on)) errors.push(`${concept.id} : reviewed_on est dans le futur`);

    for (const dep of concept.prerequisites ?? []) {
      if (dep === concept.id) errors.push(`${concept.id} : auto-prérequis interdit`);
      if (!conceptIds.has(dep)) errors.push(`${concept.id} : prérequis inconnu "${dep}"`);
    }
    for (const sourceId of concept.source_ids ?? []) {
      if (!sourceIds.has(sourceId)) errors.push(`${concept.id} : source inconnue "${sourceId}"`);
    }
    for (const termId of concept.term_ids ?? []) {
      if (!termIds.has(termId)) errors.push(`${concept.id} : terme inconnu "${termId}"`);
    }
  }

  checkDependencyCycles(knowledge.concepts ?? []);

  const referencedTerms = new Set();
  const referencedSources = new Set();

  for (const concept of knowledge.concepts ?? []) {
    for (const id of concept.term_ids ?? []) referencedTerms.add(id);
    for (const id of concept.source_ids ?? []) referencedSources.add(id);
  }

  for (const term of glossary.terms ?? []) {
    if (isFuture(term.reviewed_on)) errors.push(`${term.id} : reviewed_on est dans le futur`);
    for (const sourceId of term.source_ids ?? []) {
      if (!sourceIds.has(sourceId)) errors.push(`${term.id} : source inconnue "${sourceId}"`);
      referencedSources.add(sourceId);
    }
    for (const otherId of term.not_to_confuse_with ?? []) {
      if (otherId === term.id) errors.push(`${term.id} : auto-référence dans not_to_confuse_with`);
      if (!termIds.has(otherId)) errors.push(`${term.id} : terme inconnu "${otherId}" dans not_to_confuse_with`);
    }
  }

  for (const source of sourcesData.sources ?? []) {
    if (isFuture(source.accessed_on)) errors.push(`${source.id} : accessed_on est dans le futur`);
    if (source.published_on && isFuture(source.published_on)) warnings.push(`${source.id} : published_on est dans le futur`);
    for (const oldId of source.supersedes ?? []) {
      if (!sourceIds.has(oldId)) errors.push(`${source.id} : source superseded inconnue "${oldId}"`);
      if (oldId === source.id) errors.push(`${source.id} : une source ne peut pas se remplacer elle-même`);
    }
  }

  for (const term of glossary.terms ?? []) {
    if (!referencedTerms.has(term.id)) warnings.push(`${term.id} n'est référencé par aucun concept`);
  }
  for (const source of sourcesData.sources ?? []) {
    if (!referencedSources.has(source.id)) warnings.push(`${source.id} n'est utilisé par aucun concept ni terme`);
  }

  const termById = new Map((glossary.terms ?? []).map(t => [t.id, t]));
  for (const term of glossary.terms ?? []) {
    for (const otherId of term.not_to_confuse_with ?? []) {
      const other = termById.get(otherId);
      if (other && !(other.not_to_confuse_with ?? []).includes(term.id)) {
        warnings.push(`${term.id} → ${otherId} n'est pas réciproque`);
      }
    }
  }

  if (warnings.length) {
    console.log("\n⚠️  AVERTISSEMENTS\n");
    for (const warning of warnings) console.log(`- ${warning}`);
  }

  if (errors.length) {
    console.error("\n❌ VALIDATION ÉCHOUÉE\n");
    for (const error of errors) console.error(`- ${error}`);
    console.error(`\n${errors.length} erreur(s) détectée(s).\n`);
    process.exitCode = 1;
    return;
  }

  console.log("\n✅ RÉFÉRENTIEL VALIDE — schémas durcis\n");
  console.log(`${knowledge.domains.length} domaine(s)`);
  console.log(`${knowledge.concepts.length} concept(s)`);
  console.log(`${glossary.terms.length} terme(s)`);
  console.log(`${sourcesData.sources.length} source(s)`);
  console.log("\nAucune référence cassée ni dépendance circulaire détectée.\n");
}

main().catch(error => {
  console.error("\n❌ ERREUR DU VALIDATEUR\n");
  console.error(error);
  process.exitCode = 1;
});
