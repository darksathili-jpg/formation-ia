# Protocole de test terrain — P0 NOVICE-FIRST V2

Version : 1.0  
Date : 2026-09-22  
Public cible : élèves de Terminale découvrant les LLM  
Module : `modules/domaine-a.html`

## Objectif

Vérifier si la refonte manipulation-first corrige les problèmes observés lors du premier test :
- démarrage trop abstrait ;
- vocabulaire trop dense ;
- manque de manipulation ;
- explications jugées générales ;
- difficulté à relier une capacité visible au bon composant.

Le but n'est pas de mesurer la vitesse des élèves, mais de vérifier si l'application leur permet de construire un modèle mental sans intervention constante du professeur.

## Conditions conseillées

- 6 à 10 élèves minimum si possible ;
- travail individuel pendant la première passe ;
- ordinateur habituel de l'élève ;
- aucune explication orale du contenu avant le démarrage ;
- professeur observateur, pas démonstrateur ;
- autoriser les questions, mais noter leur nature avant d'y répondre ;
- durée indicative : 35 à 55 minutes.

## Avant le test

Dire uniquement :

> « Utilisez le module comme si vous deviez apprendre seul. Vous pouvez vous tromper. Dites-moi quand une consigne, un mot ou un résultat vous semble incompréhensible. »

Ne pas expliquer à l'avance modèle, LLM, RAG, mémoire ou outil.

## Points d'observation

### A. Entrée dans l'activité

Noter :
- temps entre l'ouverture de la page et le premier choix dans « Premier défi » ;
- l'élève commence-t-il l'activité spontanément ?
- relit-il plusieurs fois la consigne ?
- demande-t-il ce qu'il doit faire ?

### B. Premier défi

Pour chaque élève :
- nombre de prédictions correctes sur 4 ;
- le feedback spécifique est-il lu ?
- après feedback, peut-il expliquer avec ses mots pourquoi « règlement actuel » est différent de « reformuler un texte déjà fourni » ?

Question orale de contrôle :

> « Pourquoi le fait qu'un chatbot connaisse un document récent ne prouve-t-il pas que ce document est dans ses poids ? »

### C. Vocabulaire central

Après la section 02, demander sans regarder l'écran :

> « Quelle différence fais-tu entre le LLM et l'application ? »

Codage conseillé :
- 0 : aucune distinction ;
- 1 : distinction vague ;
- 2 : modèle = composant, application = assemblage clairement exprimé.

### D. System Builder

Observer :
- l'élève comprend-il que les interrupteurs changent les capacités ?
- combien d'essais avant de réussir les quatre missions ?
- peut-il expliquer le composant manquant après un échec ?
- active-t-il tout systématiquement ou cherche-t-il la configuration minimale ?

Question orale :

> « Si tu coupes la mémoire mais gardes le LLM, qu'est-ce qui devient impossible ? Pourquoi ? »

### E. Family Lab

Relever :
- réussite au premier essai de la chaîne IA → ML → deep learning → LLM ;
- si erreur : la correction permet-elle de reconstruire la chaîne au deuxième essai ?
- confusion éventuelle entre « application » et la chaîne de familles de modèles.

### F. Quiz et transfert

Enregistrer :
- score quiz / 6 ;
- score transfert / 4 ;
- items les plus souvent faux ;
- différence entre une erreur de vocabulaire et une erreur de raisonnement.

Le score seul ne valide pas P0.

## Mesure de compréhension différée immédiate

À la fin, masquer ou fermer la page pendant 2 à 3 minutes puis poser :

1. « Le chatbot et le LLM, est-ce la même chose ? Explique. »
2. « Comment une application peut-elle utiliser un règlement modifié ce matin ? »
3. « Comment peut-elle se souvenir demain de ton prénom sans réentraîner le modèle ? »
4. « Remets dans l'ordre : deep learning, LLM, IA, machine learning. »
5. « Un modèle dont les poids sont téléchargeables est-il forcément open source ? »

## Transfert hors exemples du module

Situation :

> Une application de réservation de voyages discute avec l'utilisateur, consulte les horaires disponibles en temps réel, mémorise ses préférences et réserve un billet après confirmation.

Demander :

> « Quels éléments pourraient appartenir au modèle, et quels éléments doivent probablement être fournis par l'application autour du modèle ? Justifie. »

Critère fort de réussite : l'élève ne se contente pas de citer des mots ; il relie chaque capacité à une fonction.

## Questions qualitatives finales

Demander séparément :

- « À quel moment as-tu compris la différence entre modèle et application ? »
- « Quelle partie t'a le plus aidé à comprendre ? »
- « Où as-tu eu besoin de relire ? »
- « Y avait-il encore trop de nouveaux mots ? Lesquels ? »
- « As-tu eu l'impression de faire des choses ou surtout de lire ? »
- « Quel passage supprimerais-tu ou développerais-tu ? »

## Grille synthétique par élève

| Indicateur | Valeur |
| --- | --- |
| Temps avant première action | |
| Aide nécessaire avant premier feedback | oui / non |
| Premier défi | /4 |
| Modèle vs application expliqué sans écran | 0 / 1 / 2 |
| Missions System Builder réussies | /4 |
| Family Lab au premier essai | oui / non |
| Quiz | /6 |
| Transfert | /4 |
| Transfert voyage justifié | 0 / 1 / 2 |
| Nombre de demandes d'aide conceptuelle | |
| Notion la plus confuse | |
| Commentaire libre | |

## Porte de validation

P0 ne repasse à `novice-ready` qu'après lecture des résultats.

Indicateurs recherchés, sans en faire des seuils scientifiques universels :
- la majorité des élèves entre dans le premier défi sans explication professorale ;
- la majorité peut expliquer « modèle ≠ application » sans écran ;
- le System Builder entraîne une explication causale, pas seulement un jeu d'interrupteurs ;
- le vocabulaire secondaire n'est plus cité comme obstacle majeur ;
- le transfert final montre une capacité à raisonner sur un système nouveau.

Si une difficulté commune persiste, elle devient une dette du module et doit être corrigée avant généralisation de V2 à P1.
