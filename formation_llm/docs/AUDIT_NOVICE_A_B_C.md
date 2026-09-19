# Audit novice — parcours A → B → C

Date : 2026-09-19

## Méthode

Audit réalisé comme un parcours de première découverte, avec quatre axes : séquençage des connaissances, charge cognitive, récupération active/feedback et accessibilité/navigation.

Repères utilisés :
- IES / What Works Clearinghouse, *Organizing Instruction and Study to Improve Student Learning* : quizzing, questions explicatives, articulation exemples/problèmes et représentations concrètes/abstraites.
- Education Endowment Foundation : activation des connaissances antérieures, explicitation des stratégies, modélisation et progression novice → autonomie.
- W3C WCAG 2.2 : navigation clavier, focus visible et taille des cibles.

## Constats critiques corrigés

1. **Les modules étaient des îlots.** A, B et C n'explicitaient pas suffisamment prérequis, objectif de sortie et étape suivante. Ajout d'un bandeau de parcours et de navigation précédent/suivant.
2. **Risque de fausse hiérarchie dans A.** Une chaîne visuelle pouvait faire croire que tout modèle de langage est un sous-ensemble du deep learning. La carte distingue maintenant la trajectoire fréquente des LLM modernes des notions transversales.
3. **Risque “Transformer = attention” dans C.** C est désormais explicitement annoncé comme une première partie : position, MLP, connexions résiduelles, normalisation et empilement restent hors périmètre.
4. **Quiz trop orientés “formateur”.** Les titres B/C deviennent “Test de maîtrise” afin que le stagiaire novice les identifie comme sa propre récupération active ; les éléments spécifiques restent dans le mode formateur.
5. **Accessibilité incohérente.** Ajout d'un indicateur de focus explicite et cohérent, en particulier sur A.
6. **Tableau de bord incohérent.** Le nombre de labs actifs passe de 5 à 7 et la reprise par défaut commence désormais au Domaine A.
7. **Source juridique héritée.** A09 ne dépend plus de SRC-0007, source migrée non vérifiée ; la référence vérifiée au règlement (UE) 2024/1689 reste utilisée.

## Dette pédagogique encore ouverte

- Domaine C doit être prolongé par position/RoPE, MLP, résidus, normalisation, empilement et KV cache.
- La génération (logits, sampling, température, top-k/top-p) doit être matérialisée dans un Sampling Lab avant de considérer “Comprendre un LLM” comme complet.
- La progression locale reste déclarative : elle doit être reliée aux scores de quiz.
- Un vrai test utilisateur novice doit mesurer temps, erreurs, abandons et capacité à expliquer sans support.
- Le RAG Lab devra ensuite être relié à constitution du contexte, génération et fidélité aux sources.

## Verdict

Le parcours A → B → C est désormais cohérent comme **socle initial**, mais C n'est pas encore un enseignement complet du Transformer et le parcours “Comprendre un LLM” n'est pas complet tant que la génération n'est pas intégrée.
