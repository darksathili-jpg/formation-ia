# LATENT — Gel du socle UI / Pédagogie V1

Date : 2026-09-20  
Statut : **socle gelé pour les nouveaux modules**

## Périmètre gelé

Les nouveaux modules doivent réutiliser sans variante locale le socle actuellement validé :

- LATENT UI 1.0 ;
- Learning System V2 ;
- registre canonique des étapes pédagogiques ;
- Runtime Bar synchronisée avec l'étape réellement visible ;
- Layer Navigator alimenté par le même registre ;
- modes stagiaire / formateur / projection ;
- thème clair / sombre et projection haute luminance ;
- cibles tactiles 44 px minimum ;
- navigation mobile stabilisée ;
- retour cockpit explicite ;
- activités de complétion, quiz et transfert protégées contre les réponses manquantes ;
- résultats annoncés par `aria-live` ;
- maîtrise uniquement si quiz ≥ 80 % **et** transfert ≥ 80 % ;
- réactivation espacée J+1 → J+3 → J+7 → J+14 → J+30 ;
- standard NOVICE-FIRST et critères de réussite observables.

## Règle de changement

À partir de ce gel :

1. un nouveau module **consomme** les composants et invariants V1 ;
2. il ne crée pas une nouvelle navigation, une nouvelle Runtime Bar ou une nouvelle logique de maîtrise ;
3. une modification du socle doit corriger un défaut démontré sur plusieurs modules ou une exigence d'accessibilité ;
4. toute modification du socle doit être accompagnée d'un verrou de non-régression dans la CI ;
5. les différences entre modules portent sur le contenu, les activités et les représentations pédagogiques — pas sur les règles d'interface.

## Numérotation

La numérotation est désormais dérivée d'un registre unique :

`main > section.section`, hors `.trainer-only`.

Ce registre alimente :
- badges 01, 02, 03… ;
- Runtime Bar ;
- Layer Navigator ;
- bouton Continuer ;
- progression guidée.

Un bloc de prérequis non numéroté ou un débrief formateur ne peut plus modifier le compteur stagiaire.

## Définition de fini pour un nouveau module

Un module n'est intégrable au cockpit que s'il :
- satisfait le manifeste pédagogique ;
- passe `validate-ui-system.mjs` ;
- passe `validate-learning-system.mjs` ;
- passe `validate-pedagogy.mjs` ;
- possède au moins un exemple travaillé, une pratique guidée, une complétion, une auto-explication, un quiz avec feedback et un transfert ;
- possède ses misconceptions et ancres de remédiation ;
- dispose d'une banque de réactivation ;
- est vérifié en desktop, mobile, clair, sombre et projection.

Le gel V1 n'interdit pas l'amélioration. Il interdit de réintroduire de la divergence structurelle.
