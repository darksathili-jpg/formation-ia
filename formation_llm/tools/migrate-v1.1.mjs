import { readFile, writeFile, copyFile, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPO_ROOT = resolve(ROOT, "..");
const TODAY = "2026-09-17";

async function readJson(rel) {
  return JSON.parse(await readFile(resolve(ROOT, rel), "utf8"));
}
async function writeJson(rel, data) {
  await writeFile(resolve(ROOT, rel), JSON.stringify(data, null, 2) + "\n", "utf8");
}

const knowledge = await readJson("data/knowledge-map.json");
const sourcesData = await readJson("data/sources.json");
const glossary = await readJson("data/glossary.json");
const payload = await readJson("migration-v1.1.payload.json");
const pkg = await readJson("package.json");

const termIdsByConcept = new Map();
for (const term of glossary.terms ?? []) {
  for (const conceptId of term.concept_ids ?? []) {
    if (!termIdsByConcept.has(conceptId)) termIdsByConcept.set(conceptId, []);
    termIdsByConcept.get(conceptId).push(term.id);
  }
}

const sourceTypeMap = {
  "scientific-paper": "research-paper",
  "institutional": "institutional-guidance",
  "legal": "law-regulation",
  "standard": "standard-framework",
  "technical-documentation": "official-documentation",
  "security-reference": "security-guidance",
  "benchmark": "benchmark-evaluation",
  "dataset": "dataset",
  "book": "book",
  "educational-resource": "educational-resource"
};
const evidenceOverrides = {
  "SRC-0001": "primary", "SRC-0002": "secondary", "SRC-0003": "tertiary",
  "SRC-0004": "primary", "SRC-0005": "primary", "SRC-0006": "primary",
  "SRC-0007": "primary", "SRC-0008": "primary", "SRC-0009": "primary"
};
const publisherKinds = {
  "SRC-0001": "intergovernmental", "SRC-0002": "publisher", "SRC-0003": "academic",
  "SRC-0004": "repository", "SRC-0005": "repository", "SRC-0006": "government",
  "SRC-0007": "government", "SRC-0008": "nonprofit", "SRC-0009": "government"
};
const publicationStatuses = {
  "SRC-0001": "official", "SRC-0002": "peer-reviewed", "SRC-0003": "living-document",
  "SRC-0004": "preprint", "SRC-0005": "preprint", "SRC-0006": "official",
  "SRC-0007": "official", "SRC-0008": "official", "SRC-0009": "official"
};
const languages = {
  "SRC-0001": "en", "SRC-0002": "en", "SRC-0003": "en", "SRC-0004": "en",
  "SRC-0005": "en", "SRC-0006": "fr", "SRC-0007": "fr", "SRC-0008": "en", "SRC-0009": "en"
};
const celex = { "SRC-0006": "32024R1689", "SRC-0007": "32026R1744" };

sourcesData.sources = (sourcesData.sources ?? []).map(source => {
  const out = {
    id: source.id,
    title: source.title,
    ...(source.authors ? { authors: source.authors } : {}),
    source_type: sourceTypeMap[source.source_type] ?? "web-page",
    evidence_role: evidenceOverrides[source.id] ?? (source.authority_level === "primary" ? "primary" : source.authority_level === "secondary" ? "secondary" : "tertiary"),
    publisher: source.publisher,
    publisher_kind: publisherKinds[source.id] ?? "other",
    url: source.url,
    publication_status: publicationStatuses[source.id] ?? "not-applicable",
    accessed_on: source.accessed_on ?? TODAY,
    status: source.status,
    temporal_stability: source.temporal_stability === "volatile" ? "fast-moving" : source.temporal_stability,
    language: languages[source.id] ?? "en",
    topics: source.topics
  };
  const identifiers = {};
  if (source.doi) identifiers.doi = source.doi;
  const arxivMatch = String(source.url ?? "").match(/arxiv\.org\/(?:abs|pdf)\/(\d{4}\.\d{4,5})/i);
  if (arxivMatch) identifiers.arxiv = arxivMatch[1];
  if (celex[source.id]) identifiers.celex = celex[source.id];
  if (Object.keys(identifiers).length) out.identifiers = identifiers;
  if (source.publication_date) {
    if (out.publication_status === "living-document") out.source_updated_on = source.publication_date;
    else out.published_on = source.publication_date;
  }
  if (source.notes) out.notes = source.notes;
  if (source.supersedes?.length) out.supersedes = source.supersedes;
  return out;
});
for (const source of payload.sources) {
  if (!sourcesData.sources.some(s => s.id === source.id)) sourcesData.sources.push(source);
}
sourcesData.schema_version = "1.1.0";
sourcesData.updated_on = TODAY;

glossary.terms = (glossary.terms ?? []).map(term => ({
  id: term.id,
  term: term.term,
  ...(term.english_term ? { english_term: term.english_term } : {}),
  slug: term.slug,
  ...(term.aliases?.length ? { aliases: term.aliases } : {}),
  definition_short: term.definition_short,
  definition_precise: term.definition_precise,
  ...(term.pedagogical_analogy ? { pedagogical_analogy: term.pedagogical_analogy } : {}),
  ...(term.analogy_limits ? { analogy_limits: term.analogy_limits } : {}),
  ...(term.not_to_confuse_with?.length ? { not_to_confuse_with: term.not_to_confuse_with } : {}),
  ...(term.common_misuses?.length ? { common_misuses: term.common_misuses.map(item => typeof item === "string" ? { statement: item, correction: `À corriger avec la définition canonique : ${term.definition_short}` } : item) } : {}),
  stability: term.status === "stable" ? "stable" : "evolving",
  epistemic_status: term.id === "TERM-0010" || term.status === "contested" ? "debated" : "established",
  source_ids: term.source_ids,
  tags: term.tags,
  reviewed_on: TODAY,
  ...(term.notes ? { notes: term.notes } : {})
}));
for (const term of payload.terms) {
  if (!glossary.terms.some(t => t.id === term.id)) glossary.terms.push(term);
}
glossary.schema_version = "1.1.0";
glossary.updated_on = TODAY;
glossary.language = "fr";

knowledge.concepts = (knowledge.concepts ?? []).map(concept => {
  const explain = concept.trainer_mastery?.explain ?? ["Expliquer le concept avec précision."];
  const oldQuestions = concept.trainer_mastery?.answer ?? concept.trainer_mastery?.hard_questions ?? [];
  const summary = concept.summary ?? concept.definition_short;
  return {
    id: concept.id,
    slug: concept.slug,
    title: concept.title,
    domain: concept.domain,
    ...(concept.aliases?.length ? { aliases: concept.aliases } : {}),
    mastery_level: concept.mastery_level,
    stability: concept.stability === "experimental" ? "fast-moving" : concept.stability,
    epistemic_status: concept.id === "A12" ? "debated" : (concept.epistemic_status ?? "established"),
    summary,
    prerequisites: concept.prerequisites ?? [],
    learning_objectives: concept.learning_objectives,
    trainer_mastery: {
      explain,
      demonstrate: concept.trainer_mastery?.demonstrate?.length ? concept.trainer_mastery.demonstrate : ["Construire une démonstration simple et vérifiable du concept."],
      hard_questions: oldQuestions.length ? oldQuestions.map(item => typeof item === "string" ? { question: item, key_points: explain.slice(0, 2) } : item) : [{ question: `Comment expliquer ${concept.title} sans simplification trompeuse ?`, key_points: explain.slice(0, 2) }]
    },
    misconceptions: (concept.misconceptions ?? []).map(item => typeof item === "string" ? { statement: item, correction: `À corriger en revenant au résumé canonique : ${summary}` } : item),
    ...(concept.labs?.length ? { labs: concept.labs } : {}),
    source_ids: concept.source_ids,
    term_ids: termIdsByConcept.get(concept.id) ?? concept.term_ids ?? [],
    tags: concept.tags,
    reviewed_on: TODAY,
    ...(concept.notes ? { notes: concept.notes } : {})
  };
});
if (!knowledge.domains.some(d => d.id === "B")) {
  knowledge.domains.push({
    id: "B",
    slug: "tokens-representations-contexte",
    title: "Tokens, représentations et contexte",
    order: 2,
    description: "Comprendre comment le texte devient une séquence de tokens, puis des représentations vectorielles, et comment la fenêtre de contexte borne l'information disponible au modèle."
  });
}
for (const concept of payload.concepts) {
  if (!knowledge.concepts.some(c => c.id === concept.id)) knowledge.concepts.push(concept);
}
knowledge.schema_version = "1.1.0";
knowledge.updated_on = TODAY;

await copyFile(resolve(ROOT, "schema-next/knowledge-map.schema.json"), resolve(ROOT, "schema/knowledge-map.schema.json"));
await copyFile(resolve(ROOT, "schema-next/sources.schema.json"), resolve(ROOT, "schema/sources.schema.json"));
await copyFile(resolve(ROOT, "schema-next/glossary.schema.json"), resolve(ROOT, "schema/glossary.schema.json"));
await copyFile(resolve(ROOT, "tools/validate-next.mjs"), resolve(ROOT, "tools/validate.mjs"));
pkg.version = "1.1.0";
await writeJson("package.json", pkg);
await writeJson("data/knowledge-map.json", knowledge);
await writeJson("data/sources.json", sourcesData);
await writeJson("data/glossary.json", glossary);

const mainWorkflowPath = resolve(REPO_ROOT, ".github/workflows/validate-formation-llm.yml");
let mainWorkflow = await readFile(mainWorkflowPath, "utf8");
mainWorkflow = mainWorkflow.replace("npm install --ignore-scripts --no-audit --no-fund", "npm ci --ignore-scripts --no-audit --no-fund");
await writeFile(mainWorkflowPath, mainWorkflow.endsWith("\n") ? mainWorkflow : mainWorkflow + "\n", "utf8");

const readmePath = resolve(ROOT, "README.md");
let readme = await readFile(readmePath, "utf8");
if (!readme.includes("## Contrat de données v1.1")) {
  readme += `\n\n## Contrat de données v1.1\n\nLe référentiel sépare désormais :\n- la stabilité temporelle d'une notion (\`stability\`) de son statut épistémique (\`epistemic_status\`) ;\n- le rôle probant d'une source (\`evidence_role\`) de la nature de son éditeur (\`publisher_kind\`) ;\n- la carte pédagogique des concepts du glossaire terminologique, reliés par \`term_ids\`.\n\nLes idées fausses comportent une correction explicite et les questions difficiles du formateur comportent des points de réponse attendus.\nLe validateur contrôle en plus l'intégrité référentielle, les doublons et les cycles de prérequis.\n`;
  await writeFile(readmePath, readme, "utf8");
}

for (const rel of ["schema-next/knowledge-map.schema.json", "schema-next/sources.schema.json", "schema-next/glossary.schema.json", "tools/validate-next.mjs", "tools/migrate-v1.1.mjs", "migration-v1.1.payload.json"]) {
  await rm(resolve(ROOT, rel), { force: true });
}
await rm(resolve(REPO_ROOT, ".github/workflows/migrate-formation-llm-v1-1.yml"), { force: true });
console.log("Migration v1.1 + Domaine B appliqués.");
