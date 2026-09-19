# Audit drastique de navigation — Formation LLM

Date : 2026-09-19

## Dysfonctionnements identifiés

1. **Piège de projection sur l'accueil** : le bouton qui activait la projection se trouvait dans la barre latérale, puis cette même barre était masquée par le mode projection. Il n'existait donc plus de sortie évidente.
2. **Statut présenté comme une action** : « Mode stagiaire » utilisait le même langage visuel que le bouton « Réinitialiser progression », alors qu'il ne déclenchait aucune action.
3. **Libellé Formateur ambigu** : le bouton décrivait un état plutôt que l'action disponible.
4. **Projection persistante dans une page** : l'étape Tokens pouvait mémoriser le mode projection, ce qui rendait possible un rechargement directement dans un état de présentation.
5. **Navigation de parcours périmée** : l'étape Attention envoyait encore vers le RAG Lab au lieu de la nouvelle étape Transformer Block.
6. **Retours globaux incomplets** : certains modules n'offraient pas de retour explicite vers l'application Formation LLM.
7. **Aucune CI dédiée aux invariants de navigation** : les validateurs contrôlaient surtout structure et contenu.

## Corrections mises en œuvre

- bouton fixe **« Quitter la projection · Échap »** visible uniquement en projection ;
- touche **Échap** comme sortie universelle sur toutes les pages ;
- bouton Projection doté de `aria-pressed` et d'un libellé d'action ;
- projection rendue volontairement **transitoire**, non mémorisée ;
- contrôles d'administration masqués pendant la projection sur le tableau de bord ;
- statut **« Profil : stagiaire / formateur »** rendu non cliquable et visuellement distinct ;
- bouton de rôle renommé **« Activer mode formateur » / « Revenir au mode stagiaire »** ;
- retours vers Formation LLM ajoutés aux modules qui en manquaient ;
- chaîne pédagogique rétablie : Parcours 0 → Étape 1 → Étape 2 → Étape 3 ;
- focus clavier visible sur les contrôles.

## Système de vigilance

Le script `tools/validate-navigation.mjs` contrôle désormais automatiquement :
- présence d'une sortie de projection sur chaque page ;
- présence de la sortie clavier Échap ;
- non-persistance du mode projection ;
- séparation statut / action pour le profil ;
- persistance cohérente du profil formateur ;
- retour vers l'application depuis chaque module ;
- continuité des étapes du parcours ;
- existence des fichiers HTML ciblés par les liens ;
- existence des ancres `#fragment` ciblées ;
- absence de séquences littérales `\\n` dans les pages ;
- présence d'un focus clavier visible.

Toute violation fait échouer la CI `Validate Formation LLM`.
