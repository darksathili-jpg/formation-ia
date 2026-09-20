# LATENT UI — Design system de Formation LLM

Version : 1.0 — 2026-09-20

## Intention

LATENT UI donne à la plateforme une identité immédiatement reconnaissable sans imiter l'interface d'un fournisseur d'IA. Le langage visuel vient des mécanismes enseignés : **tokens, vecteurs, couches, signal, contexte et maîtrise**.

La règle principale est : **aucun effet graphique sans fonction d'orientation, de hiérarchie ou de feedback**.

## Principes UX

1. **Orientation permanente** — l'utilisateur doit savoir où il est, où il va et ce que le système attend ensuite.
2. **Navigation stable** — mêmes zones, ordre et conventions sur toutes les pages.
3. **Une action principale par contexte** — le CTA suivant doit dominer visuellement les actions secondaires.
4. **Exploration ≠ recherche** — cartes pour parcourir les labs, rails/listes pour lire une progression ou retrouver un élément.
5. **État visible** — diagnostic, preuve partielle, maîtrise, réactivation et remédiation ont des signes distincts qui ne reposent pas uniquement sur la couleur.
6. **IA sans anthropomorphisme** — l'identité repose sur la représentation et le calcul, pas sur un cerveau, un robot ou une « magie ».
7. **Motion utile et réductible** — animation uniquement pour signaler un flux ou un changement d'état ; respect strict de `prefers-reduced-motion`.
8. **Cible tactile** — actions essentielles dimensionnées autour d'un minimum de 44 px.
9. **Projection** — le contenu pédagogique reste lisible quand les contrôles applicatifs disparaissent.
10. **Autonomie** — aucun CDN, police ou bibliothèque distante.

## Signature visuelle

### Nom
**LATENT / Formation LLM**

« LATENT » n'est pas un changement de contenu ni une marque commerciale : c'est la signature du design system.

### Motifs
- **Token rail** : petits segments alignés qui matérialisent une séquence.
- **Latent lattice** : grille de points très discrète dans le fond.
- **Layer stack** : bordures verticales / lignes superposées pour représenter les étapes.
- **Signal path** : ligne cyan→violet utilisée uniquement pour progression, sélection et flux.
- **Node status** : états de maîtrise représentés par forme + texte + couleur.

### Palette
- Ink : noir bleuté profond.
- Signal cyan : orientation / action.
- Latent violet : système / représentation.
- Coral : erreur ou friction.
- Lime : maîtrise / réussite.
- Surface light : ivoire froid, jamais blanc pur.

## Typographie

Pas de police externe. La hiérarchie utilise la pile système :
- affichage : `Segoe UI Variable Display / system-ui`, poids fort, tracking serré ;
- métadonnées : `ui-monospace` ;
- texte courant : `system-ui`.

Les titres en serif sont supprimés : ils donnaient une esthétique éditoriale générique sans lien avec le sujet.

## Architecture visuelle

### Shell
- rail latéral sombre et stable sur desktop ;
- barre supérieure = contexte + statut, pas seconde navigation ;
- mobile = navigation horizontale compacte ;
- contenu principal aligné sur une grille cohérente.

### Dashboard
Le héros devient un **latent field** : visualisation abstraite d'un flux token → couches → distribution, associée à la prochaine action adaptative.

### Modules
Chaque module devient un **workspace** :
- retour / contexte en haut ;
- Hero = nom + objectif ;
- learning guide = « runtime bar » du système adaptatif ;
- sections = couches numérotées ;
- labs = surfaces interactives distinctes ;
- quiz/transfert = zone de validation.

## Progressive disclosure

Le masquage progressif reste un comportement pédagogique, mais son état doit être évident :
- « SEGMENT 03 / 14 » ;
- action « Continuer » dominante ;
- « Tout afficher » secondaire ;
- mode formateur = page complète immédiatement.

## Références UX retenues

- W3C WCAG 2.2 : navigation cohérente, orientation, identification consistante et réduction des animations.
- W3C COGA : signposts, libellés et structures reconnaissables.
- Apple HIG : sidebar peu profonde, sélection persistante, adaptation aux petits écrans.
- Microsoft HAX : états compréhensibles, explication des comportements, contrôles globaux.
- Google PAIR : modèles mentaux, feedback/contrôle, erreurs et récupération.
- NN/g : grille, alignement, hiérarchie visuelle, cartes réservées à l'exploration plutôt qu'à la recherche précise.

## Garde-fou CI

Toute page applicative doit contenir `data-ui-system="latent-v1"`.
Le validateur vérifie également :
- reduced motion ;
- focus visible ;
- cible minimale des actions principales ;
- absence de dépendance distante ;
- identité LATENT visible dans le shell ;
- maintien du bouton de sortie de projection ;
- navigation cohérente ;
- absence du vieux titre serif comme base du système.
