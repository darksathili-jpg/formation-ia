import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const errors = [];
const warnings = [];

async function loadJson(relativePath) {
  const absolutePath = resolve(ROOT, relativePath);
  const raw = await readFile(absolutePath, "utf8");

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `JSON invalide dans ${relativePath} : ${error.message}`
    );
  }
}

function checkUnique(items, property, label) {
  const seen = new Map();

  for (const item of items) {
    const value = item[property];

    if (seen.has(value)) {
      errors.push(
        `${label} : ${property} dupliqué "${value}"`
      );
    } else {
      seen.set(value, true);
    }
  }
}

function checkSchema(ajv, schema, data, label) {
  let validate;

  try {
    validate = ajv.compile(schema);
  } catch (error) {
    errors.push(
      `${label} : impossible de compiler le schéma : ${error.message}`
    );
    return;
  }

  const valid = validate(data);

  if (!valid) {
    for (const error of validate.errors ?? []) {
      const location = error.instancePath || "/";
      errors.push(
        `${label}${location} : ${error.message}`
      );
    }
  }
}

function checkDependencyCycles(concepts) {
  const graph = new Map(
    concepts.map((concept) => [
      concept.id,
      concept.prerequisites ?? []
    ])
  );

  const state = new Map();
  const stack = [];

  function visit(id) {
    const currentState = state.get(id) ?? 0;

    if (currentState === 1) {
      const start = stack.indexOf(id);
      const cycle = [...stack.slice(start), id];

      errors.push(
        `Cycle de prérequis détecté : ${cycle.join(" → ")}`
      );
      return;
    }

    if (currentState === 2) {
      return;
    }

    state.set(id, 1);
    stack.push(id);

    for (const prerequisite of graph.get(id) ?? []) {
      if (graph.has(prerequisite)) {
        visit(prerequisite);
      }
    }

    stack.pop();
    state.set(id, 2);
  }

  for (const id of graph.keys()) {
    visit(id);
  }
}

async function main() {
  const [
    knowledgeSchema,
    sourcesSchema,
    glossarySchema,
    knowledge,
    sourcesData,
    glossary
  ] = await Promise.all([
    loadJson("schema/knowledge-map.schema.json"),
    loadJson("schema/sources.schema.json"),
    loadJson("schema/glossary.schema.json"),
    loadJson("data/knowledge-map.json"),
    loadJson("data/sources.json"),
    loadJson("data/glossary.json")
  ]);

  const ajv = new Ajv2020({
    allErrors: true,
    strict: true
  });

  addFormats(ajv);

  // --------------------------------------------------
  // 1. Validation structurelle JSON Schema
  // --------------------------------------------------

  checkSchema(
    ajv,
    knowledgeSchema,
    knowledge,
    "knowledge-map.json"
  );

  checkSchema(
    ajv,
    sourcesSchema,
    sourcesData,
    "sources.json"
  );

  checkSchema(
    ajv,
    glossarySchema,
    glossary,
    "glossary.json"
  );

  // --------------------------------------------------
  // 2. Unicité
  // --------------------------------------------------

  checkUnique(
    knowledge.domains ?? [],
    "id",
    "Domaines"
  );

  checkUnique(
    knowledge.domains ?? [],
    "slug",
    "Domaines"
  );

  checkUnique(
    knowledge.concepts ?? [],
    "id",
    "Concepts"
  );

  checkUnique(
    knowledge.concepts ?? [],
    "slug",
    "Concepts"
  );

  checkUnique(
    sourcesData.sources ?? [],
    "id",
    "Sources"
  );

  checkUnique(
    glossary.terms ?? [],
    "id",
    "Glossaire"
  );

  checkUnique(
    glossary.terms ?? [],
    "slug",
    "Glossaire"
  );

  // --------------------------------------------------
  // 3. Index
  // --------------------------------------------------

  const domainIds = new Set(
    (knowledge.domains ?? []).map((domain) => domain.id)
  );

  const conceptIds = new Set(
    (knowledge.concepts ?? []).map((concept) => concept.id)
  );

  const sourceIds = new Set(
    (sourcesData.sources ?? []).map((source) => source.id)
  );

  const termIds = new Set(
    (glossary.terms ?? []).map((term) => term.id)
  );

  // --------------------------------------------------
  // 4. Concepts
  // --------------------------------------------------

  for (const concept of knowledge.concepts ?? []) {
    if (!domainIds.has(concept.domain)) {
      errors.push(
        `${concept.id} : domaine inconnu "${concept.domain}"`
      );
    }

    if (!concept.id.startsWith(concept.domain)) {
      errors.push(
        `${concept.id} : l'identifiant ne correspond pas au domaine ${concept.domain}`
      );
    }

    for (const prerequisite of concept.prerequisites ?? []) {
      if (prerequisite === concept.id) {
        errors.push(
          `${concept.id} : un concept ne peut pas être son propre prérequis`
        );
      }

      if (!conceptIds.has(prerequisite)) {
        errors.push(
          `${concept.id} : prérequis inconnu "${prerequisite}"`
        );
      }
    }

    for (const sourceId of concept.source_ids ?? []) {
      if (!sourceIds.has(sourceId)) {
        errors.push(
          `${concept.id} : source inconnue "${sourceId}"`
        );
      }
    }
  }

  // --------------------------------------------------
  // 5. Cycles de dépendances
  // --------------------------------------------------

  checkDependencyCycles(knowledge.concepts ?? []);

  // --------------------------------------------------
  // 6. Glossaire
  // --------------------------------------------------

  for (const term of glossary.terms ?? []) {
    for (const conceptId of term.concept_ids ?? []) {
      if (!conceptIds.has(conceptId)) {
        errors.push(
          `${term.id} : concept inconnu "${conceptId}"`
        );
      }
    }

    for (const sourceId of term.source_ids ?? []) {
      if (!sourceIds.has(sourceId)) {
        errors.push(
          `${term.id} : source inconnue "${sourceId}"`
        );
      }
    }

    for (const otherTermId of term.not_to_confuse_with ?? []) {
      if (otherTermId === term.id) {
        errors.push(
          `${term.id} : un terme ne peut pas se référencer lui-même dans not_to_confuse_with`
        );
      }

      if (!termIds.has(otherTermId)) {
        errors.push(
          `${term.id} : terme inconnu "${otherTermId}" dans not_to_confuse_with`
        );
      }
    }
  }

  // --------------------------------------------------
  // 7. Sources
  // --------------------------------------------------

  for (const source of sourcesData.sources ?? []) {
    for (const oldSourceId of source.supersedes ?? []) {
      if (!sourceIds.has(oldSourceId)) {
        errors.push(
          `${source.id} : source superseded inconnue "${oldSourceId}"`
        );
      }

      if (oldSourceId === source.id) {
        errors.push(
          `${source.id} : une source ne peut pas se remplacer elle-même`
        );
      }
    }
  }

  // --------------------------------------------------
  // 8. Avertissements utiles
  // --------------------------------------------------

  const referencedSources = new Set();

  for (const concept of knowledge.concepts ?? []) {
    for (const id of concept.source_ids ?? []) {
      referencedSources.add(id);
    }
  }

  for (const term of glossary.terms ?? []) {
    for (const id of term.source_ids ?? []) {
      referencedSources.add(id);
    }
  }

  for (const source of sourcesData.sources ?? []) {
    if (!referencedSources.has(source.id)) {
      warnings.push(
        `${source.id} n'est actuellement utilisé par aucun concept ni terme`
      );
    }
  }

  // --------------------------------------------------
  // Résultat
  // --------------------------------------------------

  if (warnings.length > 0) {
    console.log("\n⚠️  AVERTISSEMENTS\n");

    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (errors.length > 0) {
    console.error("\n❌ VALIDATION ÉCHOUÉE\n");

    for (const error of errors) {
      console.error(`- ${error}`);
    }

    console.error(
      `\n${errors.length} erreur(s) détectée(s).\n`
    );

    process.exitCode = 1;
    return;
  }

  console.log("\n✅ RÉFÉRENTIEL VALIDE\n");

  console.log(
    `${knowledge.domains.length} domaine(s)`
  );

  console.log(
    `${knowledge.concepts.length} concept(s)`
  );

  console.log(
    `${glossary.terms.length} terme(s)`
  );

  console.log(
    `${sourcesData.sources.length} source(s)`
  );

  console.log(
    "\nAucune référence cassée ni dépendance circulaire détectée.\n"
  );
}

main().catch((error) => {
  console.error("\n❌ ERREUR DU VALIDATEUR\n");
  console.error(error);
  process.exitCode = 1;
});