# Learning System V2 — architecture pédagogique adaptative

Date : 2026-09-20

## But

Transformer la plateforme NOVICE-FIRST en système d'apprentissage : diagnostiquer les connaissances initiales, adapter le niveau de guidage, demander des preuves de maîtrise, réactiver les notions dans le temps et proposer une remédiation ciblée sur les confusions observées.

## Principes non négociables

1. **Le diagnostic n'est pas une certification.** Il sert au placement et au dosage de l'étayage.
2. **La maîtrise n'est plus auto-déclarée.** Elle exige au minimum un quiz de récupération et une tâche de transfert au-dessus des seuils du contrat.
3. **Une erreur devient une donnée pédagogique.** Chaque distracteur important est relié à une misconception et à une section de remédiation.
4. **L'espacement est adaptatif mais révisable.** Les intervalles 1/3/7/14/30 jours sont une politique de produit, pas une loi biologique universelle.
5. **Progressive disclosure par défaut pour le stagiaire.** Le contenu est révélé par segments ; le formateur et l'apprenant peuvent afficher la page complète.
6. **Aucune API obligatoire.** Les traces restent dans localStorage et la formation reste utilisable sans compte.
7. **Le moteur ne prétend pas évaluer sémantiquement une auto-explication libre.** Les critères d'auto-évaluation sont enregistrés comme trace métacognitive, distincte des scores objectifs.

## État local v2

Clé : `formation-llm-learning-v2`.

```text
{
  version: 2,
  diagnostic: {...},
  modules: {
    A: {
      quiz: {score,total,at},
      transfer: {score,total,at},
      selfExplanation: {checked,total,at},
      mastery: {status, masteredAt},
      review: {level,nextDue,lastAt,lastScore}
    }
  },
  misconceptions: {
    "B.TOKEN_WORD": {count,lastAt,module,anchor,label}
  },
  preferences: {progressive:true},
  lastActivity: {module,anchor,at}
}
```

## États de maîtrise

- `not-started` : aucune trace.
- `learning` : activité ouverte ou preuve partielle.
- `evidence` : quiz ou transfert réussi isolément.
- `mastered` : quiz ≥ 80 % ET transfert ≥ 80 %.
- `review-due` : maîtrise acquise mais réactivation arrivée à échéance.

Le statut peut redescendre vers `learning` sur échec de réactivation répété ; aucune « certification permanente » n'est supposée.

## Adaptation après diagnostic

Chaque module guidé reçoit trois questions de prétest. Le résultat ne saute jamais silencieusement un concept :
- 0–1 / 3 : **guidage complet recommandé** ;
- 2 / 3 : **guidage normal** ;
- 3 / 3 : **voie rapide** possible vers exemple travaillé, quiz et transfert.

La prochaine étape recommandée est le premier module présentant un besoin, tout en laissant l'apprenant libre de naviguer.

## Répétition cumulative

Quand un module devient maîtrisé, une première réactivation est planifiée le lendemain. En cas de réussite (≥80 %) : palier suivant 3, 7, 14 puis 30 jours. En cas d'échec : retour à une réactivation rapprochée.

Les sessions mélangent les modules arrivés à échéance afin de produire une récupération cumulative et entrelacée.

## Progressive disclosure

En mode stagiaire, les modules révèlent initialement les deux premiers segments (prérequis + première explication), puis un bouton « Continuer » révèle la suite. Un lien direct vers une ancre de laboratoire déverrouille les segments nécessaires. Le mode formateur affiche l'ensemble du contenu.

## Mesure et limites

La CI vérifie la présence de ce système, ses identifiants et ses contrats. Elle ne prouve pas l'efficacité pédagogique. Celle-ci devra être testée avec pré-test, post-test, transfert et rappel différé sur de vrais novices.
