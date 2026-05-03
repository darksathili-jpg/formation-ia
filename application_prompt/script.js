/* ============================================================
   ÉTAT GLOBAL
   ============================================================ */
var promptGenere = '';
var saveTimer = null;
var STORAGE_KEY = 'gen-nsi-maths-v2';
var LIBRARY_KEY = 'gen-library-v2';
var _discipline = 'NSI';
var _apercuExpanded = false;
var _sectionsDesactivees = {};
var _sectionsRepliees = {};
var _slotActif = null;

/* ============================================================
   PROGRAMMES OFFICIELS NSI
   ============================================================ */
var PROGRAMME_NSI = {
    'Terminale NSI': [
        { val: 'nsi-t-struc', label: 'Structures de données', theme: 'Structures de données — listes chaînées, arbres et graphes', prerequis: 'POO en Python, récursivité, notion de complexité, listes, dictionnaires', notions: 'Interface vs implémentation, liste chaînée, arbre binaire (parcours), graphe orienté/non orienté, représentation par matrice/liste d\'adjacence', refBo: 'Programme NSI Terminale — BO 2019 — Structures de données' },
        { val: 'nsi-t-bdd', label: 'Bases de données', theme: 'Bases de données relationnelles — modèle relationnel et SQL', prerequis: 'Notion de table, clé primaire, bases du modèle entité-association', notions: 'Schéma relationnel, contraintes d\'intégrité, algèbre relationnelle, SELECT/WHERE/JOIN/GROUP BY, ACID', refBo: 'Programme NSI Terminale — BO 2019 — Bases de données' },
        { val: 'nsi-t-archi', label: 'Architectures matérielles', theme: 'Architecture matérielle — Von Neumann, systèmes embarqués et SoC', prerequis: 'Représentation binaire, circuits logiques, modèle OSI basique', notions: 'Modèle de Von Neumann, pipeline, mémoire cache, gestion des interruptions, systèmes sur puce', refBo: 'Programme NSI Terminale — BO 2019 — Architecture matérielle et systèmes d\'exploitation' },
        { val: 'nsi-t-syst', label: 'Systèmes d\'exploitation', theme: 'Systèmes d\'exploitation — processus, ordonnancement et sécurité', prerequis: 'Architecture matérielle, ligne de commande Linux basique', notions: 'Processus et threads, ordonnancement (FIFO, SJF, Round Robin), interblocage, appels système, droits UNIX', refBo: 'Programme NSI Terminale — BO 2019 — Architecture matérielle et systèmes d\'exploitation' },
        { val: 'nsi-t-reseau', label: 'Réseaux et sécurité', theme: 'Protocoles réseaux — TCP/IP, routage et sécurisation des communications', prerequis: 'Modèle OSI, adressage IP, notion de protocole', notions: 'Routage statique/dynamique (RIP, OSPF), TCP vs UDP, TLS/HTTPS, chiffrement symétrique/asymétrique, RSA simplifié', refBo: 'Programme NSI Terminale — BO 2019 — Réseaux' },
        { val: 'nsi-t-langages', label: 'Langages et paradigmes', theme: 'Langages et programmation — paradigmes, POO, spécification et calculabilité', prerequis: 'Python impératif, fonctions, listes, types construits, récursivité', notions: 'POO (classes, héritage, encapsulation, polymorphisme), programmation fonctionnelle (map/filter/lambda), modularité, spécification (préconditions/postconditions), typage, interprétation vs compilation, calculabilité', refBo: 'Programme NSI Terminale — BO 2019, mis à jour 2021 — Langages et programmation' },
        { val: 'nsi-t-algo', label: 'Algorithmique avancée', theme: 'Algorithmique — diviser pour régner et programmation dynamique', prerequis: 'Récursivité, complexité algorithmique O(n), arbres, listes', notions: 'Diviser pour régner (merge sort, quicksort), mémoïsation, approche tabulaire, sous-problèmes chevauchants, sac à dos 0/1', refBo: 'Programme NSI Terminale — BO 2019 — Algorithmique' },
        { val: 'nsi-t-ihm', label: 'IHM Web', theme: 'Interfaces Homme-Machine sur le Web — HTML/CSS/JS et événements', prerequis: 'HTML/CSS de base, notion de DOM, Python', notions: 'Modèle événementiel, formulaires HTML, manipulation du DOM en JS, interaction PyScript/JavaScript, accessibilité (ARIA)', refBo: 'Programme NSI Terminale — BO 2019 — Langages et programmation (IHM)' }
    ],
    'Première NSI': [
        { val: 'nsi-p-represent', label: 'Représentation des données', theme: 'Représentation des données — entiers, flottants, texte et images', prerequis: 'Bases numériques (binaire, hexadécimal), opérations booléennes', notions: 'Entiers signés (complément à 2), norme IEEE 754, ASCII/UTF-8/Unicode, encodage couleur RGB, compression sans perte', refBo: 'Programme NSI Première — BO 2019 — Représentation des données' },
        { val: 'nsi-p-traitement', label: 'Traitement de données', theme: 'Traitement de données en table — CSV et algorithmes sur tableaux', prerequis: 'Python listes et dictionnaires, lecture de fichiers', notions: 'Format CSV, recherche, tri (sélection, insertion), fusion de tables, indexation, notion de complexité', refBo: 'Programme NSI Première — BO 2019 — Traitement de données en table' },
        { val: 'nsi-p-interactions', label: 'Interactions Web', theme: 'Interactions Homme-Machine — Web, formulaires et pages dynamiques', prerequis: 'HTML/CSS basique, notion de client-serveur', notions: 'Modèle client-serveur, formulaires HTML, méthodes GET et POST, URL et paramètres, génération dynamique de pages (côté serveur), notion de page statique vs dynamique', refBo: 'Programme NSI Première — BO 2019 — Interactions entre l\'homme et la machine sur le Web' },
        { val: 'nsi-p-archi', label: 'Architecture et OS', theme: 'Architecture matérielle — circuits, Von Neumann et systèmes', prerequis: 'Logique booléenne, portes logiques, représentation binaire', notions: 'Circuits combinatoires et séquentiels, modèle de Von Neumann, systèmes de fichiers, commandes shell', refBo: 'Programme NSI Première — BO 2019 — Architecture matérielle et systèmes d\'exploitation' },
        { val: 'nsi-p-langages', label: 'Langages et types construits', theme: 'Langages et programmation — Python, types construits et spécification de fonctions', prerequis: 'Python fonctions, boucles, conditions, listes', notions: 'Tuples, listes, dictionnaires, sets, compréhensions de listes, spécification et documentation de fonctions, mise au point et tests', refBo: 'Programme NSI Première — BO 2019, mis à jour 2021 — Langages et programmation' },
        { val: 'nsi-p-algo', label: 'Algorithmique', theme: 'Algorithmique — recherche, tri et introduction à la récursivité', prerequis: 'Python, fonctions, listes', notions: 'Recherche séquentielle et dichotomique, tris (sélection, insertion), coût d\'un algorithme (notion de complexité), introduction à la récursivité', refBo: 'Programme NSI Première — BO 2019, mis à jour 2021 — Algorithmique' }
    ],
    'BTS SIO': [
        { val: 'sio-dev', label: 'Développement Python/Web', theme: 'Développement d\'applications Python avec framework Web', prerequis: 'Python POO, SQL basique, HTML/CSS', notions: 'Flask/Django, architecture MVC, templates Jinja2, API REST, authentification JWT, déploiement', refBo: 'BTS SIO — Développement de services informatiques' },
        { val: 'sio-bdd', label: 'Bases de données avancées', theme: 'Conception et interrogation avancée de bases de données', prerequis: 'Algèbre relationnelle, SQL SELECT/JOIN', notions: 'Merise MCD/MLD, requêtes imbriquées, vues, procédures stockées, triggers, transactions, ORM', refBo: 'BTS SIO — Bases de données' },
        { val: 'sio-reseau', label: 'Réseaux et sécurité', theme: 'Administration réseaux et sécurisation des systèmes', prerequis: 'Modèle OSI, TCP/IP, adressage', notions: 'VLANs, pare-feu, VPN, Active Directory, GPO, durcissement système, RGPD, ISO 27001', refBo: 'BTS SIO — Infrastructures, systèmes et réseaux' }
    ]
};

/* ============================================================
   PROGRAMMES OFFICIELS MATHS
   ============================================================ */
var PROGRAMME_MATHS = {
    'Terminale générale': [
        { val: 'm-t-suites', label: 'Suites', theme: 'Suites numériques — convergence, récurrences linéaires et modélisation', prerequis: 'Suites arithmétiques et géométriques (Première), raisonnement par récurrence', notions: 'Suite convergente, limite, suites définies par récurrence, suites arithmético-géométriques (u_{n+1}=au_n+b), point fixe et convergence, comportement asymptotique, modélisation, algorithmes de calcul', refBo: 'Programme Maths Terminale — BO 2019, mis à jour 2021 — Suites' },
        { val: 'm-t-limites', label: 'Limites et continuité', theme: 'Limites de fonctions, continuité et théorème des valeurs intermédiaires', prerequis: 'Fonctions de référence, dérivabilité, notion de limite intuitive', notions: 'Limite finie/infinie en un point et en ±∞, opérations sur les limites, continuité, TVI, branches infinies', refBo: 'Programme Maths Terminale — BO 2019 — Analyse (Limites)' },
        { val: 'm-t-derivation', label: 'Dérivation avancée', theme: 'Dérivation — variations, convexité, optimisation et applications', prerequis: 'Dérivée (définition, règles), tableau de variations', notions: 'Dérivée seconde, convexité, point d\'inflexion, optimisation, étude complète de fonction, applications à la physique', refBo: 'Programme Maths Terminale — BO 2019 — Analyse (Dérivation)' },
        { val: 'm-t-primitives', label: 'Primitives et intégrales', theme: 'Calcul intégral — primitives, intégrale définie et applications', prerequis: 'Fonctions dérivées, fonctions usuelles et leurs dérivées', notions: 'Primitive, théorème fondamental du calcul intégral, intégrale définie, aire entre deux courbes, valeur moyenne d\'une fonction', refBo: 'Programme Maths Terminale — BO 2019, mis à jour 2021 — Analyse (Intégration)' },
        { val: 'm-t-logarithme', label: 'Logarithme et exponentielle', theme: 'Fonctions logarithme et exponentielle — approfondissement et applications', prerequis: 'Dérivation, primitives, exponentielle et logarithme (notions de Première)', notions: 'Propriétés complètes de ln et exp, dérivées et primitives, équations différentielles y\'=ay+b, croissances comparées, modèles de croissance exponentielle et logarithmique', refBo: 'Programme Maths Terminale — BO 2019, mis à jour 2021 — Analyse (Fonctions)' },
        { val: 'm-t-proba', label: 'Probabilités', theme: 'Lois de probabilité continues — loi normale et estimation', prerequis: 'Variable aléatoire discrète, espérance, loi binomiale', notions: 'Variable aléatoire continue, loi normale N(μ,σ²), espérance, écart-type, intervalle de fluctuation, tests d\'hypothèses basiques', refBo: 'Programme Maths Terminale — BO 2019 — Probabilités et statistiques' },
        { val: 'm-t-geo', label: 'Géométrie vectorielle 3D', theme: 'Géométrie dans l\'espace — droites, plans, distances et produit scalaire', prerequis: 'Vecteurs du plan, équations de droites, produit scalaire plan', notions: 'Repère dans l\'espace, vecteur normal, équation cartésienne de plan, distances point-plan et droite-plan, angles, sphère', refBo: 'Programme Maths Terminale — BO 2019 — Géométrie' },
        { val: 'm-t-trig', label: 'Trigonométrie Terminale', theme: 'Trigonométrie — formules d\'addition, équations et applications à l\'analyse', prerequis: 'Cercle trigonométrique, radians, cosinus et sinus (Première)', notions: 'Formules d\'addition cos(a+b) et sin(a+b), formules de duplication, résolution d\'équations trigonométriques dans un intervalle, lien avec les fonctions dérivées et primitives', refBo: 'Programme Maths Terminale — BO 2019, mis à jour 2021 — Analyse et Trigonométrie' },
        { val: 'm-t-combi', label: 'Combinatoire', theme: 'Dénombrement et combinatoire — arrangements, combinaisons et lois discrètes', prerequis: 'Probabilités de base, ensembles, factorielles', notions: 'Principe de multiplication, arrangements, permutations, combinaisons C(n,k), coefficient binomial, triangle de Pascal, formule du binôme', refBo: 'Programme Maths Terminale — BO 2019 — Probabilités (Dénombrement)' }
    ],
    'Première générale': [
        { val: 'm-p-second-degre', label: 'Second degré', theme: 'Fonctions polynômes du second degré — forme canonique et applications', prerequis: 'Fonctions affines, factorisation, identités remarquables, équations du premier degré', notions: 'Trinôme ax²+bx+c, discriminant, forme canonique, parabole, signe du discriminant (deux racines réelles / racine double / pas de racine réelle), problèmes d\'optimisation', refBo: 'Programme Maths Première — BO 2019 — Algèbre' },
        { val: 'm-p-derivation', label: 'Dérivation', theme: 'Dérivation — définition, règles de calcul et applications aux variations', prerequis: 'Taux d\'accroissement, fonctions de référence, tableau de valeurs', notions: 'Nombre dérivé, tangente, fonction dérivée, règles (somme, produit, quotient, composée), tableau de variations', refBo: 'Programme Maths Première — BO 2019 — Analyse (Dérivation)' },
        { val: 'm-p-trig', label: 'Trigonométrie', theme: 'Fonctions trigonométriques — cercle trigonométrique et équations', prerequis: 'Angles orientés, cosinus et sinus dans un triangle rectangle', notions: 'Cercle trigonométrique, radians, cos(a+b) et sin(a+b), résolution d\'équations trigonométriques, représentations graphiques', refBo: 'Programme Maths Première — BO 2019 — Trigonométrie' },
        { val: 'm-p-suites', label: 'Suites', theme: 'Suites arithmétiques et géométriques — définitions et applications', prerequis: 'Récurrences simples, fonctions affines et linéaires', notions: 'Suite définie par une formule explicite ou une relation de récurrence, raison, terme général, somme des termes, modélisation financière', refBo: 'Programme Maths Première — BO 2019 — Suites' },
        { val: 'm-p-exp', label: 'Exponentielle et logarithme', theme: 'Fonction exponentielle et logarithme — introduction et propriétés', prerequis: 'Dérivation (Première), suites géométriques, équations du type e^x=k', notions: 'Définition et propriétés de la fonction exponentielle, nombre e, propriétés algébriques (e^(a+b)=e^a×e^b), fonction réciproque ln, équations e^x=k et ln(x)=k, applications à la croissance', refBo: 'Programme Maths Première — BO 2019, mis à jour 2021 — Analyse (Fonctions)' },
        { val: 'm-p-proba', label: 'Probabilités', theme: 'Variables aléatoires discrètes et loi binomiale', prerequis: 'Probabilités conditionnelles, arbres de probabilité', notions: 'Variable aléatoire discrète, loi de probabilité, espérance, variance, écart-type, loi binomiale B(n,p)', refBo: 'Programme Maths Première — BO 2019 — Probabilités et statistiques' },
        { val: 'm-p-geo', label: 'Géométrie plane', theme: 'Géométrie analytique — vecteurs, droites et produit scalaire', prerequis: 'Vecteurs de base, égalité de vecteurs, Thalès', notions: 'Coordonnées de vecteurs, opérations vectorielles, équations de droites (réduite, cartésienne, paramétrique), produit scalaire, distances', refBo: 'Programme Maths Première — BO 2019 — Géométrie' }
    ],
    'Seconde': [
        { val: 'm-s-fonctions', label: 'Fonctions', theme: 'Fonctions — représentations, propriétés et résolution graphique', prerequis: 'Calcul numérique, fractions, puissances, proportionnalité', notions: 'Image/antécédent, tableau de valeurs, sens de variation, extremum, lecture graphique, résolution graphique d\'équations', refBo: 'Programme Maths Seconde — BO 2019 — Fonctions' },
        { val: 'm-s-stat', label: 'Statistiques', theme: 'Statistiques descriptives — dispersion, quartiles et boîtes à moustaches', prerequis: 'Calcul de moyenne, effectifs et fréquences', notions: 'Médiane, quartiles, étendue, écart interquartile, boîtes à moustaches, fréquences cumulées, comparaison de séries', refBo: 'Programme Maths Seconde — BO 2019 — Statistiques et probabilités' },
        { val: 'm-s-proba', label: 'Probabilités', theme: 'Introduction aux probabilités — expériences aléatoires et fréquences', prerequis: 'Fractions, pourcentages', notions: 'Expérience aléatoire, événement, probabilité classique et fréquentiste, événements incompatibles/contraires, loi des grands nombres', refBo: 'Programme Maths Seconde — BO 2019 — Statistiques et probabilités' },
        { val: 'm-s-geo', label: 'Géométrie analytique', theme: 'Géométrie analytique — droites, distances et cercles dans le plan', prerequis: 'Coordonnées, théorème de Pythagore, proportionnalité', notions: 'Distance entre deux points, milieu, équation cartésienne de droite, pente, équation de cercle, intersections', refBo: 'Programme Maths Seconde — BO 2019 — Géométrie' },
        { val: 'm-s-algo', label: 'Algorithmique Python', theme: 'Algorithmique et programmation Python — introduction au lycée', prerequis: 'Aucun prérequis en Python', notions: 'Variables, types, affectation, boucles (for/while), conditions (if/elif/else), fonctions, listes, algorithmes de base (maximum, somme)', refBo: 'Programme Maths Seconde — BO 2019 — Algorithmique et programmation' },
        { val: 'm-s-second-degre', label: 'Fonctions polynômes (Seconde)', theme: 'Fonctions polynômes — représentation graphique, variations et lecture', prerequis: 'Identités remarquables, développement, factorisation', notions: 'Représentation graphique de ax²+bx+c, lecture de variations sur une courbe, résolution graphique d\'équations et inéquations du second degré, factorisation partielle', refBo: 'Programme Maths Seconde — BO 2019 — Fonctions' }
    ],
    'Maths expertes': [
        { val: 'm-e-compl', label: 'Nombres complexes', theme: 'Nombres complexes — formes algébrique et trigonométrique, applications géométriques', prerequis: 'Second degré (discriminant négatif), trigonométrie, vecteurs', notions: 'Forme algébrique et trigonométrique, module, argument, conjugué, formule de Moivre, racines n-ièmes de l\'unité, applications géométriques (rotations, symétries)', refBo: 'Programme Maths Expertes — BO 2019, mis à jour 2021 — Nombres complexes' },
        { val: 'm-e-arithm', label: 'Arithmétique', theme: 'Arithmétique entière — divisibilité, PGCD et congruences', prerequis: 'Division euclidienne, nombres premiers basiques', notions: 'Divisibilité, PGCD, algorithme d\'Euclide, théorème de Bézout, lemme de Gauss, congruences, indicatrice d\'Euler, chiffrement RSA simplifié', refBo: 'Programme Maths Expertes — BO 2019 — Arithmétique' },
        { val: 'm-e-matrices', label: 'Matrices', theme: 'Algèbre matricielle — opérations, inverse et systèmes linéaires', prerequis: 'Systèmes linéaires 2×2, calcul numérique', notions: 'Opérations matricielles, matrices carré, matrice identité, matrice inverse, déterminant 2×2, résolution de systèmes, suites vectorielles', refBo: 'Programme Maths Expertes — BO 2019 — Matrices et graphes' }
    ]
};

/* ============================================================
   COMPÉTENCES
   ============================================================ */
var COMPETENCES = {
    NSI: [
        { id: 'nsi-c-analyser', lettre: 'A', nom: 'Analyser/Modéliser', desc: 'Comprendre, identifier, abstraire' },
        { id: 'nsi-c-concevoir', lettre: 'C', nom: 'Concevoir', desc: 'Proposer, structurer, élaborer' },
        { id: 'nsi-c-impl', lettre: 'I', nom: 'Implémenter', desc: 'Coder, traduire, développer' },
        { id: 'nsi-c-tester', lettre: 'T', nom: 'Tester', desc: 'Vérifier, valider, déboguer' },
        { id: 'nsi-c-doc', lettre: 'D', nom: 'Documenter', desc: 'Décrire, commenter, spécifier' },
        { id: 'nsi-c-comm', lettre: 'Cm', nom: 'Communiquer', desc: 'Présenter, argumenter, partager' }
    ],
    Maths: [
        { id: 'math-c-chercher', lettre: 'Ch', nom: 'Chercher', desc: 'Explorer, conjecturer, expérimenter' },
        { id: 'math-c-model', lettre: 'Mo', nom: 'Modéliser', desc: 'Traduire, formaliser, interpréter' },
        { id: 'math-c-repr', lettre: 'Re', nom: 'Représenter', desc: 'Tracer, construire, visualiser' },
        { id: 'math-c-raisonner', lettre: 'Ra', nom: 'Raisonner', desc: 'Démontrer, justifier, prouver' },
        { id: 'math-c-calc', lettre: 'Ca', nom: 'Calculer', desc: 'Poser, résoudre, estimer' },
        { id: 'math-c-comm', lettre: 'Cm', nom: 'Communiquer', desc: 'Rédiger, présenter, expliquer' }
    ]
};

/* ============================================================
   SECTIONS PAR DÉFAUT — STRUCTURE
   ============================================================ */
var SECTIONS_DEFAULT = {
    'TP guidé': {
        NSI: '1. Introduction — Situation concrète du quotidien, problème ressenti AVANT le vocabulaire technique. Vocabulaire interdit dans cette section.\n2. Cours 1 — Premier concept central avec exemple animé ou visualisé. Comparaison avant/après.\n3. Exercice 1 — Mise en situation narrative, indices progressifs (2 niveaux), éditeur PyScript pré-rempli avec la fonction de test.\n4. Cours 2 — Approfondissement, deuxième concept, cas limite et contre-exemple.\n5. Exercice 2 — Problème plus complexe, correction cachée, même structure que l\'exercice 1.\n6. Synthèse — Tableau comparatif des approches, bilan des points clés, exercice bonus ouvert.',
        Maths: '1. Situation problème — Problème concret ancré dans le réel, sans vocabulaire technique. L\'élève explore avant de nommer.\n2. Construction du savoir — Définition(s), propriétés, démonstration ou justification. Exemples types résolus étape par étape avec commentaires méthodologiques.\n3. Exercices d\'application directe — Calculs ou résolutions progressifs du plus simple au plus complexe.\n4. Exercices de raisonnement — Démonstrations guidées ou problèmes ouverts nécessitant un raisonnement.\n5. Synthèse et méthode — Encadré récapitulatif, méthode en étapes, erreurs fréquentes à éviter.'
    },
    'Cours interactif': {
        NSI: '1. Introduction — Problème du monde réel (accroche), objectifs annoncés explicitement.\n2. Partie 1 — Concept central avec visualisation ou animation interactive, pas de code imposé.\n3. Vérification 1 — QCM ou question rapide (réponse binaire ou courte).\n4. Partie 2 — Approfondissement, deuxième concept, interactions plus complexes.\n5. Vérification 2 — Mini-exercice de code interactif.\n6. Synthèse — Carte mentale cliquable ou tableau récapitulatif, lien vers les exercices.',
        Maths: '1. Introduction — Situation déclenchante, question sans réponse immédiate. L\'élève conjecture.\n2. Construction — Manipulations, exemples numériques, observations guidées par des questions.\n3. Institutionnalisation — Définition et théorème officiels, démonstration ou justification selon le niveau.\n4. Exemples types résolus — 2-3 exercices avec solution commentée étape par étape.\n5. Synthèse — Méthode en étapes, encadré «à retenir», formules clés et notations.'
    },
    'Activité découverte': {
        NSI: '1. Situation déclenchante — Phénomène ou problème à observer, sans explication fournie.\n2. Exploration — Manipulation guidée (données, simulation, code à analyser) avec consignes ouvertes.\n3. Mise en commun — Questions structurantes pour formaliser les observations. L\'élève rédige ses conclusions.\n4. Institutionnalisation — Définition officielle présentée APRÈS que l\'élève ait découvert le concept.\n5. Application immédiate — Exercice simple d\'ancrage du concept découvert.',
        Maths: '1. Observation — Document numérique, géométrique ou algébrique à analyser sans guidage initial.\n2. Conjectures — L\'élève formule des hypothèses à partir de ses observations. Les écrit explicitement.\n3. Vérification — Tests numériques ou constructions géométriques pour valider/invalider les conjectures.\n4. Preuve — Démonstration guidée ou fournie validant la conjecture retenue.\n5. Application — Utilisation immédiate de la propriété découverte sur un exemple nouveau.'
    },
    'Évaluation': {
        NSI: '1. En-tête — Nom, prénom, classe, date. Durée et matériel autorisé clairement indiqués.\n2. Exercice 1 (X pts) — QCM/vrai-faux et questions courtes sur définitions et notions de base.\n3. Exercice 2 (X pts) — Lecture et analyse de code ou d\'algorithme (trace d\'exécution, explication).\n4. Exercice 3 (X pts) — Complétion ou écriture de fonction Python avec spécification donnée.\n5. Exercice 4 (X pts) — Problème de synthèse ou question ouverte de raisonnement.',
        Maths: '1. En-tête — Nom, prénom, classe, date. Durée, calculatrice et matériel autorisé.\n2. Exercice 1 (X pts) — Questions directes sur les définitions, propriétés et notations.\n3. Exercice 2 (X pts) — Calculs applicatifs et résolutions d\'équations ou inéquations.\n4. Exercice 3 (X pts) — Problème mettant en jeu une modélisation d\'une situation réelle.\n5. Exercice 4 (X pts) — Démonstration ou question ouverte nécessitant un raisonnement structuré.'
    },
    'Fiche de révision': {
        NSI: '1. En-tête — Titre, niveau, chapitre, référence programme BO.\n2. Notions essentielles — 5-8 points clés numérotés, mémorisables en 10 secondes chacun.\n3. Structures et algorithmes clés — Tableaux comparatifs, schémas, pseudo-code.\n4. Exemples de code annotés — 2-3 extraits courts avec commentaires explicatifs ciblés.\n5. Pièges fréquents — Erreurs classiques des élèves et comment les éviter.\n6. Glossaire — Termes techniques avec définitions concises (2 lignes maximum par terme).',
        Maths: '1. En-tête — Titre, niveau, chapitre, formules du programme BO.\n2. Définitions et théorèmes — Encadrés distincts, formulations précises, notation LaTeX.\n3. Formules et propriétés — Tableau ou liste structurée, toutes les formules en notation correcte.\n4. Méthodes types — Pour chaque type d\'exercice courant, méthode en 3-4 étapes numérotées.\n5. Exemples résolus — 2-3 exercices représentatifs avec solution complète et justifiée.\n6. Erreurs fréquentes — Ce que les élèves confondent le plus souvent, avec contre-exemples.'
    },
    'Projet en autonomie': {
        NSI: '1. Contexte et problématique — Situation réelle, enjeux, ce que le projet doit résoudre.\n2. Cahier des charges — Fonctionnalités obligatoires, contraintes techniques, données fournies.\n3. Ressources — Code de départ, bibliothèques autorisées, documentation fournie.\n4. Jalons — Étapes avec dates et livrables intermédiaires vérifiables.\n5. Critères de réussite — Grille d\'évaluation détaillée : fonctionnement, qualité, démarche, créativité.\n6. Rendu — Format exact, dépôt, présentation orale éventuelle.',
        Maths: '1. Contexte — Problème ouvert ancré dans le réel (statistiques, géométrie, modélisation).\n2. Questions guidées — Progression du simple vers l\'ouvert, permettent d\'entrer dans le problème.\n3. Exploration libre — L\'élève choisit son approche mathématique et l\'argumente.\n4. Modélisation et calculs — Mise en équation, résolution, interprétation des résultats.\n5. Critique du modèle — L\'élève discute les limites et les hypothèses de son approche.\n6. Rendu — Format, longueur, modalités d\'évaluation.'
    },
    'Devoir Maison': {
        NSI: '1. Contexte — Problème concret posé en classe, à approfondir à la maison. Rappel des notions nécessaires.\n2. Questions guidées — Du plus simple (application directe) au plus complexe (raisonnement). Chaque question indépendante.\n3. Partie ouverte — Question bonus non obligatoire, clairement identifiée, pour aller plus loin.',
        Maths: '1. Contexte — Situation problème avec toutes les données nécessaires, accessible sans aide extérieure.\n2. Questions progressives — Du calcul direct à la démonstration. Barème indicatif affiché par question.\n3. Partie bonus — Extension optionnelle clairement séparée pour les élèves avancés.'
    },
    'Investigation': {
        NSI: '1. Problème initial — Question ouverte, sans réponse évidente. L\'élève explore librement.\n2. Hypothèses — L\'élève formule des conjectures à partir de ses observations et tests.\n3. Expérimentation — Codes, simulations ou analyses de données pour tester les hypothèses.\n4. Conclusions — L\'élève argumente ses résultats. Incertitudes et limites identifiées.\n5. Prolongements — Questions ouvertes pour aller plus loin.',
        Maths: '1. Question directrice — Problème ouvert ancré dans les mathématiques ou le réel.\n2. Exploration — Exemples numériques, cas particuliers, représentations graphiques.\n3. Conjectures — L\'élève formule et argumente ses hypothèses explicitement.\n4. Démonstration — Preuve guidée ou contre-exemple selon la conjecture.\n5. Synthèse — Bilan, extensions et limites du résultat obtenu.'
    }
};

var PRINCIPES_DEFAULT = {
    'TP guidé': {
        NSI: 'Chaque concept est illustré par un exemple concret avant d\'être nommé. L\'élève ressent le problème avant de recevoir la solution. Un concept nouveau maximum par paragraphe. Ton oral, tutoiement, questions rhétoriques.',
        Maths: 'Chaque définition est précédée d\'un exemple numérique ou géométrique concret. Le niveau de formalisme est adapté au lycée — pas de notation ensembliste lourde, pas de démonstration epsilon-delta. Un concept par paragraphe maximum.'
    },
    'Cours interactif': {
        NSI: 'Alterner contenu et interaction toutes les 3-4 minutes. Jamais plus d\'un concept par écran. Ton direct, questions rhétoriques. Les visualisations précèdent les définitions formelles.',
        Maths: 'Chaque propriété est d\'abord observée sur des exemples avant d\'être énoncée. Alterner construction et formalisation. Un concept par section. L\'élève doit formuler sa propre conjecture avant de voir la définition.'
    },
    'Activité découverte': {
        NSI: 'L\'élève construit le savoir avant que l\'enseignant le nomme. Guidage par questions ouvertes, jamais par affirmations. La réponse n\'est donnée qu\'après que l\'élève ait formulé une hypothèse.',
        Maths: 'Approche inductivie obligatoire : observations → conjectures → preuves. L\'élève écrit ses hypothèses avant de voir la démonstration. Ne jamais confirmer une conjecture avant que l\'élève ait fourni une justification.'
    },
    'Évaluation': {
        NSI: 'Énoncés clairs et non ambigus. Questions ordonnées du plus simple au plus complexe. Barème affiché pour chaque question. Aucun indice implicite dans les consignes. Chaque question est indépendante si possible.',
        Maths: 'Énoncés précis avec toutes les données nécessaires. Notation conforme aux conventions lycée. Barème affiché. Questions indépendantes autant que possible. Aucun indice implicite dans les énoncés.'
    },
    'Fiche de révision': {
        NSI: 'Densité maximale d\'information utile. Chaque point mémorisable en 10 secondes. Priorité à la structure visuelle sur le style littéraire. Aucune phrase inutilement longue.',
        Maths: 'Formulations courtes et précises. Encadrés pour définitions et théorèmes. Méthodes en étapes numérotées. Notation LaTeX correcte si format HTML. Exemples courts et représentatifs.'
    },
    'Projet en autonomie': {
        NSI: 'Problématique ancrée dans le monde réel. Exigences minimales clairement séparées des options bonus. Chaque livrable a un format précis et une date.',
        Maths: 'Guidage suffisant pour éviter la paralysie, assez ouvert pour permettre la créativité. L\'élève justifie ses choix mathématiques. Distinguer calcul, modélisation et interprétation.'
    },
    'Devoir Maison': {
        NSI: 'Chaque question est indépendante. L\'énoncé est complet et sans ambiguïté — résolvable sans aide extérieure. La partie bonus est clairement séparée et non obligatoire.',
        Maths: 'Questions suffisamment détaillées pour être comprises sans aide. Notation conforme aux conventions lycée. Barème indicatif affiché. Partie bonus distincte et optionnelle.'
    },
    'Investigation': {
        NSI: 'L\'élève construit le savoir par essais et erreurs. Questions ouvertes, pas de réponse donnée avant exploration. L\'enseignant guide par questions, jamais par affirmations.',
        Maths: 'Approche inductive obligatoire. L\'élève conjecture avant de démontrer. Guidage progressif vers la rigueur sans brûler les étapes de découverte.'
    }
};

/* ============================================================
   BUILDERS SECTION 04 — CONTRAINTES SPÉCIFIQUES
   ============================================================ */
function buildSec04(disc, type) {
    if (type === 'TP guidé' || type === 'Cours interactif' || type === 'Activité découverte') {
        return disc === 'NSI' ? buildSec04ExoNSI() : buildSec04ExoMaths();
    }
    if (type === 'Évaluation') return disc === 'NSI' ? buildSec04EvalNSI() : buildSec04EvalMaths();
    if (type === 'Fiche de révision') return buildSec04Fiche(disc);
    if (type === 'Projet en autonomie') return buildSec04Projet(disc);
    if (type === 'Devoir Maison') return buildSec04DM(disc);
    if (type === 'Investigation') return buildSec04Investigation(disc);
    return '';
}

function buildSec04ExoNSI() {
    return '<div class="encart-pedago ep-bleu" style="margin-bottom:.85rem;"><span class="encart-pedago-titre">Few-shot + règles de test — clé de la qualité NSI</span><p>Un exemple concret de fonction de test est plus efficace que toutes les règles. L\'IA reproduit exactement le format de l\'exemple fourni.</p></div>' +
        '<div class="field-row"><div class="field"><label>Composants obligatoires de chaque exercice</label><div class="tag-group">' +
        '<label class="tag"><input type="checkbox" id="cb-narration" checked><span>Mise en situation narrative</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-enonce" checked><span>Énoncé numéroté</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-indices" checked><span>Indices progressifs (2 niveaux min.)</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-editeur" checked><span>Éditeur PyScript exécutable</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-correction" checked><span>Correction cachée déverrouillable</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-tests" checked><span>Fonctions test_ pré-écrites</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-schema"><span>Schéma ou figure</span></label>' +
        '</div></div></div>' +
        '<div class="field-row"><div class="field"><label>Règle des fonctions de test <span class="badge-oblig">OBLIGATOIRE NSI</span></label>' +
        '<textarea class="tall" id="regle-tests">Tout bloc de code Python contenant une fonction doit se terminer par une fonction test_nom() avec minimum 3 assertions sur des valeurs littérales pré-calculées et exactes, suivie de print("Les tests sont validés."), appelée immédiatement après sa définition. Pour les exercices : la fonction de test est pré-écrite dans l\'éditeur PyScript — l\'élève la complète. Pour les corrections : les mêmes assertions que l\'énoncé figurent dans le bloc correction.</textarea>' +
        '<div class="avert">Ne supprime jamais cette règle — elle garantit la testabilité des codes générés.</div></div></div>' +
        '<div class="field-row col2">' +
        '<div class="field"><label>Exemple de fonction de test (few-shot) <span class="badge-oblig">OBLIGATOIRE</span></label>' +
        '<textarea class="tall" id="exemple-test">def test_ma_fonction():\n    assert ma_fonction(0) == 0\n    assert ma_fonction(1) == 1\n    assert ma_fonction(5) == 25\n    print("Les tests sont validés.")\n\ntest_ma_fonction()</textarea>' +
        '<div class="astuce">Adapte cet exemple à ton thème — c\'est le format exact que l\'IA reproduira.</div></div>' +
        '<div class="field"><label>Exemple d\'exercice complet (few-shot) <span class="badge-rec">Recommandé</span></label>' +
        '<textarea class="tall" id="exemple-exo">## Exercice X — Titre\n\n> Contexte narratif : situation du monde réel.\n\n### Questions\n1. Complète la fonction `nom_fonction(param)` qui retourne…\n2. Vérifie avec la fonction de test déjà écrite.\n\n### Indices (masqués)\n→ Indice 1 : …\n→ Indice 2 : …\n\n### Correction (masquée)\n```python\n# Solution complète\n```</textarea></div></div>';
}

function buildSec04ExoMaths() {
    return '<div class="encart-pedago ep-violet" style="margin-bottom:.85rem;"><span class="encart-pedago-titre">Structurer les exercices en Maths</span><p>Un exercice bien spécifié distingue le type de réponse attendue (calcul, démonstration, représentation) et le niveau de guidage. Précise aussi la notation attendue (LaTeX/MathJax si HTML).</p></div>' +
        '<div class="field-row col2">' +
        '<div class="field"><label>Composants de chaque exercice</label><div class="tag-group">' +
        '<label class="tag"><input type="checkbox" id="cb-contexte" checked><span>Contexte ou mise en situation</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-enonce" checked><span>Énoncé numéroté</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-etapes"><span>Questions intermédiaires guidantes</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-figure"><span>Figure ou schéma</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-correction" checked><span>Correction détaillée justifiée</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-methode"><span>Encadré «méthode» associé</span></label>' +
        '</div></div>' +
        '<div class="field"><label>Types de réponse attendue</label><div class="tag-group">' +
        '<label class="tag"><input type="checkbox" id="cb-calcul-num" checked><span>Calcul numérique</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-alg"><span>Résolution algébrique</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-demo"><span>Démonstration rédigée</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-trace"><span>Tracé de courbe / figure</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-model"><span>Modélisation</span></label>' +
        '</div></div></div>' +
        '<div class="field-row"><div class="field"><label>Exemple de mise en forme d\'exercice (few-shot) <span class="badge-rec">Recommandé</span></label>' +
        '<textarea class="tall" id="exemple-exo">## Exercice X — Titre (X pts)\n\n**Contexte** : Mise en situation concrète une phrase.\n\n**Questions**\n1. Calculer … [Résultat : donner la valeur exacte] (X pts)\n2. Démontrer que … [Rédiger une démonstration en 3-4 lignes] (X pts)\n3. En déduire … (X pts)\n\n**Correction**\n1. On calcule : $...$ donc le résultat est $...$\n2. Démonstration : $...$ C.Q.F.D.\n3. On en déduit : $...$</textarea></div></div>';
}

function buildSec04EvalNSI() {
    return '<div class="field-row col3">' +
        '<div class="field"><label>Durée <span class="label-requis">*</span></label><input type="text" id="eval-duree" value="1 heure"></div>' +
        '<div class="field"><label>Barème total</label><input type="text" id="eval-bareme" value="20 points"></div>' +
        '<div class="field"><label>Matériel autorisé</label><input type="text" id="eval-materiel" value="Aucun document, aucun outil numérique"></div>' +
        '</div>' +
        '<div class="field-row col2">' +
        '<div class="field"><label>Types de questions</label><div class="tag-group">' +
        '<label class="tag"><input type="checkbox" id="cb-qcm" checked><span>QCM / Vrai-Faux</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-lect-code" checked><span>Lecture de code</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-compl-code" checked><span>Complétion de code</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-ecrit-code"><span>Écriture de code libre</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-trace-exec"><span>Trace d\'exécution</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-redac"><span>Question rédigée</span></label>' +
        '</div></div>' +
        '<div class="field"><label>Contraintes de rédaction</label>' +
        '<textarea id="eval-contraintes">Questions indépendantes autant que possible. Barème affiché pour chaque question. Ordonnées du plus simple au plus complexe. Aucun indice implicite dans les énoncés. Espace de réponse délimité pour les questions écrites.</textarea></div></div>';
}

function buildSec04EvalMaths() {
    return '<div class="field-row col3">' +
        '<div class="field"><label>Durée <span class="label-requis">*</span></label><input type="text" id="eval-duree" value="1 heure"></div>' +
        '<div class="field"><label>Barème total</label><input type="text" id="eval-bareme" value="20 points"></div>' +
        '<div class="field"><label>Matériel autorisé</label><input type="text" id="eval-materiel" value="Calculatrice autorisée, formules non fournies"></div>' +
        '</div>' +
        '<div class="field-row col2">' +
        '<div class="field"><label>Types de questions</label><div class="tag-group">' +
        '<label class="tag"><input type="checkbox" id="cb-calcul-eval" checked><span>Calcul / Résolution</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-demo-eval" checked><span>Démonstration</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-trace-eval"><span>Tracé / Construction</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-qcm-eval"><span>QCM</span></label>' +
        '<label class="tag"><input type="checkbox" id="cb-pb-eval"><span>Problème de modélisation</span></label>' +
        '</div></div>' +
        '<div class="field"><label>Système de barème</label>' +
        '<select id="eval-bareme-type">' +
        '<option value="points classiques — X points par question affiché dans l\'énoncé">Barème classique en points</option>' +
        '<option value="compétences bac (Ch/Mo/Re/Ra/Ca/Cm) — indicateurs cochés par question">Compétences bac (Ch / Mo / Re / Ra / Ca / Cm)</option>' +
        '<option value="mixte — points par question ET indicateurs de compétences">Mixte : points + indicateurs compétences</option>' +
        '</select><div class="astuce">Le barème compétences est recommandé pour les DS type baccalauréat.</div></div></div>' +
        '<div class="field-row"><div class="field"><label>Contraintes de rédaction</label>' +
        '<textarea id="eval-contraintes">Questions indépendantes autant que possible. Barème affiché. Notation conforme aux conventions lycée. Données numériques réalistes. Figures avec axes légendés si besoin. Aucun indice implicite.</textarea></div></div>';
}

function buildSec04Fiche(disc) {
    return '<div class="field-row col2">' +
        '<div class="field"><label>Format visuel <span class="label-requis">*</span></label>' +
        '<select id="fiche-format"><option value="Colonnes + encadrés colorés distincts">Colonnes + encadrés colorés</option><option value="Tableau de référence organisé">Tableau de référence</option><option value="Questions / réponses alternées">Questions / réponses</option><option value="Carte mentale ASCII hiérarchique">Carte mentale ASCII</option></select></div>' +
        '<div class="field"><label>Densité</label>' +
        '<select id="fiche-densite"><option value="Dense — maximum d\'information utile par zone">Dense</option><option value="Équilibrée — lisible avec marges confortables" selected>Équilibrée</option><option value="Aérée — peu de contenu, grand corps de texte">Aérée</option></select></div>' +
        '</div>' +
        '<div class="field-row"><div class="field"><label>Contraintes spécifiques</label>' +
        '<textarea id="fiche-contraintes">' +
        (disc === 'Maths' ? 'Formules dans des encadrés distincts avec notation LaTeX/MathJax. Méthodes en étapes numérotées. Un exemple résolu par type d\'exercice courant. Pièges fréquents en encadré rouge ou mis en évidence. Glossaire si besoin.' :
            'Structures de données en tableaux comparatifs. Algorithmes en pseudo-code ou Python annoté. Complexités indiquées. Chaque notion avec un exemple court. Pièges fréquents nommés explicitement.') +
        '</textarea></div></div>';
}

function buildSec04Projet(disc) {
    return '<div class="field-row col2">' +
        '<div class="field"><label>Livrables attendus <span class="label-requis">*</span></label>' +
        '<textarea id="projet-livrables">' +
        (disc === 'NSI' ? '1. Code source commenté (archive .zip ou dépôt Git)\n2. Rapport 2-4 pages (PDF) : choix techniques, difficultés rencontrées, pistes d\'amélioration\n3. Démonstration fonctionnelle (5 min en classe ou capture vidéo)' :
            '1. Production écrite (4-6 pages) : démarche, calculs détaillés, interprétations\n2. Présentation orale courte (5 min) — optionnel\n3. Annexes : données brutes, tracés, outils numériques utilisés') +
        '</textarea></div>' +
        '<div class="field"><label>Grille d\'évaluation</label>' +
        '<textarea id="projet-grille">' +
        (disc === 'NSI' ? 'Fonctionnement (40%) : le livrable fait ce qui est demandé.\nQualité technique (25%) : code lisible, commenté, structuré.\nDémarche (20%) : rapport clair, difficultés identifiées, solutions expliquées.\nCréativité / bonus (15%) : fonctionnalités supplémentaires pertinentes.' :
            'Pertinence mathématique (40%) : démarche correcte et rigoureuse.\nQualité rédactionnelle (25%) : justifications claires, notation correcte.\nInitiative (20%) : l\'élève dépasse les questions posées.\nPrésentation (15%) : clarté, organisation, qualité des tracés.') +
        '</textarea></div></div>';
}

function buildSec04DM(disc) {
    return '<div class="encart-pedago" style="margin-bottom:.85rem;"><span class="encart-pedago-titre">Devoir Maison — règles essentielles</span><p>Un DM doit être entièrement résolvable <strong style="color:white;">sans aide extérieure</strong>. Toutes les données sont dans l\'énoncé. La partie bonus est optionnelle et clairement séparée.</p></div>' +
        '<div class="field-row col2">' +
        '<div class="field"><label>Format du rendu</label>' +
        '<select id="dm-rendu"><option value="Feuille manuscrite rendue en classe">Feuille manuscrite</option><option value="Document numérique déposé sur ENT">Dépôt ENT (numérique)</option><option value="Manuscrit ou numérique — les deux acceptés">Manuscrit ou numérique</option></select></div>' +
        '<div class="field"><label>Délai de rendu</label>' +
        '<input type="text" id="dm-delai" value="1 semaine" placeholder="Ex : 1 semaine, avant le..."></div></div>' +
        '<div class="field-row"><div class="field"><label>Contraintes de rédaction</label>' +
        '<textarea id="dm-contraintes">Chaque question est indépendante et résolvable sans les réponses précédentes. Toutes les données nécessaires sont dans l\'énoncé. La partie bonus est clairement identifiée (BONUS) et non obligatoire. Le barème indicatif est affiché par question. Préciser les ressources autorisées (cours, calculatrice, internet).</textarea></div></div>';
}

function buildSec04Investigation(disc) {
    var exNSI = 'Analyse de données : fournir un jeu de données CSV à explorer avec Python.\nSimulation : problème simulable (probabilités, tri, graphes).\nExploration algorithmique : mesurer expérimentalement la complexité d\'un algorithme.';
    var exMaths = 'Exploration numérique : calculer des valeurs, observer un pattern, conjecturer.\nConstruction géométrique : tracer pour émettre une hypothèse.\nÉtude de cas : généraliser à partir d\'exemples particuliers soigneusement choisis.';
    return '<div class="encart-pedago ep-bleu" style="margin-bottom:.85rem;"><span class="encart-pedago-titre">Travail d\'investigation — spécificités</span><p>L\'investigation commence par un problème <strong style="color:white;">ouvert</strong>. Aucune réponse n\'est donnée avant exploration. Guidage par questions uniquement.</p></div>' +
        '<div class="field-row"><div class="field"><label>Composantes de l\'investigation</label><div class="tag-group">' +
        '<label class="tag"><input type="checkbox" id="inv-exp" checked><span>Expérimentation (simulation, données)</span></label>' +
        '<label class="tag"><input type="checkbox" id="inv-conj" checked><span>Formulation de conjectures</span></label>' +
        '<label class="tag"><input type="checkbox" id="inv-demo"><span>Démonstration ou preuve</span></label>' +
        '<label class="tag"><input type="checkbox" id="inv-crit"><span>Critique et limites du résultat</span></label>' +
        '</div></div></div>' +
        '<div class="field-row"><div class="field"><label>Exemples de contextes d\'investigation (' + disc + ')</label>' +
        '<textarea id="inv-exemples">' + (disc === 'NSI' ? exNSI : exMaths) + '</textarea>' +
        '<div class="astuce">Utilise ces exemples pour inspirer la situation problème dans la Section Structure.</div></div></div>';
}

/* ============================================================
   BUILDER SECTION 05 — FORMAT TECHNIQUE
   ============================================================ */
function buildSec05(fmt) {
    var h = '';
    h += '<div class="encart-pedago ep-bleu" style="margin-bottom:.85rem;"><span class="encart-pedago-titre">Format : ' + fmt + '</span><p>' + descFormat(fmt) + '</p></div>';
    if (fmt === 'HTML interactif') {
        h += '<div class="field-row col2">' +
            '<div class="field"><label>CDN et versions exactes <span class="badge-oblig">OBLIGATOIRE</span></label>' +
            '<textarea class="tall" id="cdn">Bootstrap 5.3.3 → https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css\nGoogle Fonts → Rubik Dirt + Source Serif 4 + JetBrains Mono\nMathJax v3 → https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js\nPyScript 2026.3.1 → https://pyscript.net/releases/2026.3.1/core.js</textarea></div>' +
            '<div class="field"><label>Charte graphique — variables CSS</label>' +
            '<textarea class="tall" id="charte">--bg-main: #1a1f2e\n--bg-panel: #242b3d\n--bg-cours: #1e2538\n--accent: #8ca5b4\n--accent-or: #c9a84c\n--accent-vert: #4caf50\n--text-main: #d4dde4\n--text-muted: #8a9ab0</textarea></div></div>' +
            '<div class="field-row col2">' +
            '<div class="field"><label>Polices</label><textarea id="polices">Titres h1–h4 : Rubik Dirt\nCorps de texte : Source Serif 4\nCode, boutons, labels : JetBrains Mono</textarea></div>' +
            '<div class="field"><label>Composants UI obligatoires</label><textarea id="composants">.encadre → cours (bordure accent bleu-gris)\n.encadre-conseil → remarque (bordure or)\n.encadre-indice → indice caché (bordure verte)\nNavigation sticky + bouton retour en haut\nBoutons : .btn-tp / .btn-tp-or / .btn-tp-vert</textarea></div></div>' +
            '<div class="field-row"><div class="field"><label>Règles HTML critiques <span class="badge-oblig">OBLIGATOIRE</span></label>' +
            '<textarea id="regles-html">id et class : ASCII strict — sans accent, sans espace, sans caractère spécial. Aucune exception même pour le texte français.\nFonctions JavaScript : camelCase ASCII uniquement.\nPage fonctionnelle sans serveur (mode fichier local).\nStyles dans &lt;style&gt; dans le &lt;head&gt; — scripts JavaScript en fin de &lt;body&gt;.\nÉditeur Python PyScript : &lt;script type="py-editor" env="nom-env"&gt; exclusivement.\nSi la page dépasse 2000 lignes HTML, avertir et proposer de diviser en deux appels.</textarea>' +
            '<div class="avert">Un seul accent dans un id peut casser CSS ou JavaScript selon le navigateur.</div></div></div>';
    } else if (fmt === 'PDF imprimable') {
        h += '<div class="field-row col2">' +
            '<div class="field"><label>Format papier</label><select id="pdf-format"><option value="A4 portrait">A4 portrait</option><option value="A4 paysage">A4 paysage</option></select></div>' +
            '<div class="field"><label>Marges</label><input type="text" id="pdf-marges" value="2cm haut/bas, 2.5cm gauche/droite"></div></div>' +
            '<div class="field-row"><div class="field"><label>Règles d\'impression</label>' +
            '<textarea id="regles-html">Styles @media print obligatoires. Éviter les sauts de page en milieu d\'exercice (page-break-inside: avoid). Numérotation des pages en pied de page. Fond blanc uniquement. Polices lisibles à l\'impression (min. 11pt). Formules mathématiques lisibles en noir et blanc.</textarea></div></div>' +
            '<div class="field-row"><div class="field"><label>Polices</label><textarea id="polices">Corps : Arial 11pt ou Times New Roman 11pt\nTitres : gras 13-14pt\nCode : Courier New 10pt</textarea></div></div>';
    } else if (fmt === 'Markdown') {
        h += '<div class="field-row col2">' +
            '<div class="field"><label>Dialecte Markdown</label><select id="md-dialecte"><option value="Markdown standard">Standard</option><option value="GitHub Flavored Markdown (GFM)">GitHub Flavored (GFM)</option><option value="Pandoc Markdown avec LaTeX">Pandoc + LaTeX</option></select></div>' +
            '<div class="field"><label>Règles Markdown</label>' +
            '<textarea id="regles-html">Titres hiérarchisés (# ## ###) sans sauter de niveau. Blocs de code avec ``` et le nom du langage. Formules mathématiques : $...$ inline, $$...$$ display. Tableaux GFM si nécessaire. Pas de HTML inline sauf absolument nécessaire.</textarea></div></div>' +
            '<div class="field-row"><div class="field"><label>Polices</label><textarea id="polices">Format texte brut — rendu dépend du lecteur Markdown.</textarea></div></div>';
    } else if (fmt === 'DOCX') {
        h += '<div class="field-row col2">' +
            '<div class="field"><label>Style de document</label>' +
            '<select id="docx-style"><option value="Formel — Calibri 11pt, titres bleus">Formel — Calibri, titres bleus</option><option value="Épuré — Arial 11pt, noir et blanc">Épuré — Arial, noir et blanc</option><option value="Lycée — Times New Roman 12pt classique">Lycée — Times New Roman</option></select></div>' +
            '<div class="field"><label>Règles DOCX</label>' +
            '<textarea id="regles-html">Décrire la mise en forme avec les noms de styles Word : Titre 1, Titre 2, Corps de texte, Code. Encadrés décrits : "[Encadré fond gris clair : définition]". Formules décrites en LaTeX entre $. L\'IA produit le texte avec instructions de mise en forme entre [crochets].</textarea></div></div>' +
            '<div class="field-row"><div class="field"><label>Polices</label><textarea id="polices">Titres : style Word "Titre 1 / Titre 2"\nCorps : style Word "Corps de texte" (Calibri 11pt)\nCode : style Word "Code" (Courier New 10pt)</textarea></div></div>';
    } else if (fmt === 'Présentation HTML') {
        h += '<div class="field-row col2">' +
            '<div class="field"><label>Bibliothèque slides</label><select id="slides-lib"><option value="reveal.js (CDN officiel)">reveal.js (CDN)</option><option value="HTML/CSS pur — transitions CSS">HTML/CSS pur</option></select></div>' +
            '<div class="field"><label>Paramètres</label>' +
            '<textarea id="regles-html">Thème : dark ou white (reveal.js). Transitions : slide ou fade. Un concept principal par slide. Code avec highlight.js (coloration syntaxique). MathJax pour les formules mathématiques.</textarea></div></div>' +
            '<div class="field-row col2">' +
            '<div class="field"><label>Charte</label><textarea id="charte">Couleur fond : #1a1f2e\nCouleur accent : #8ca5b4\nPolice titre : Rubik Dirt</textarea></div>' +
            '<div class="field"><label>Polices</label><textarea id="polices">Titre slide : Rubik Dirt 36-48pt\nContenu : Source Serif 4, 28pt minimum\nCode : JetBrains Mono</textarea></div></div>';
    }
    return h;
}

function descFormat(fmt) {
    return {
        'HTML interactif': 'Page HTML autonome, sans serveur, fonctionnelle dans Chrome/Firefox/Edge. CDN versionnés, charte CSS et règles ASCII s\'appliquent.',
        'PDF imprimable': 'Page HTML avec CSS @media print pour rendu PDF A4. Fond blanc, polices lisibles, sauts de page cohérents.',
        'Markdown': 'Document texte structuré. Formules mathématiques en LaTeX ($...$). Structure sémantique uniquement.',
        'DOCX': 'L\'IA produit le texte avec instructions de mise en forme Word entre [crochets] à appliquer dans Word.',
        'Présentation HTML': 'Diaporama HTML autonome avec slides (reveal.js). Un concept par slide, coloration syntaxique.'
    }[fmt] || '';
}

/* ============================================================
   RAPPELS ET AUTO-VÉRIFICATION ADAPTATIFS
   ============================================================ */
function getRappels(disc, type, fmt) {
    var r = [];
    if (disc === 'NSI') {
        r.push('1. Chaque fonction Python est suivie de test_nom() avec min. 3 assertions et print("Les tests sont validés.").');
        if (fmt === 'HTML interactif' || fmt === 'Présentation HTML') {
            r.push('2. Aucun id ou class HTML ne contient d\'accent, d\'espace ou de caractère non-ASCII — aucune exception.');
            r.push('3. PyScript version 2026.3.1 exclusivement — URL exacte dans le CDN.');
            r.push('4. L\'introduction n\'utilise aucun terme technique sauf dans l\'encadré «Vocabulaire».');
            r.push('5. Si la page dépasse 2000 lignes HTML, avertir et proposer de diviser en deux appels.');
        } else {
            r.push('2. L\'introduction n\'utilise aucun terme technique sauf dans l\'encadré «Vocabulaire».');
            r.push('3. Chaque section suit exactement la structure demandée — aucune section inventée.');
            r.push('4. Ton pédagogique, tutoiement, questions rhétoriques maintenus tout au long.');
            r.push('5. Accents français corrects dans tout le document (é, è, ê, à, â, ç…).');
        }
    } else {
        if (type === 'Évaluation') {
            r.push('1. Le barème est affiché pour chaque question ou partie — aucune exception.');
            r.push('2. Les questions sont ordonnées du plus simple au plus complexe dans chaque exercice.');
            r.push('3. Aucun indice implicite dans la formulation des questions — c\'est une évaluation.');
            r.push('4. Notation conforme aux conventions lycée ' + v('niveau') + ' (ex : f\'(x), lim, ∑).');
            r.push('5. L\'en-tête comporte le titre, le niveau, la date, la durée et le matériel autorisé.');
        } else if (type === 'Fiche de révision') {
            r.push('1. Chaque point est mémorisable en 10 secondes maximum — formulations télégraphiques.');
            r.push('2. Formules et définitions clés dans des encadrés visuellement distincts.');
            r.push('3. Notation mathématique cohérente et correcte du début à la fin.');
            r.push('4. Exemples courts et directement liés aux méthodes présentées.');
            r.push('5. Les pièges fréquents sont nommés explicitement avec contre-exemples.');
        } else {
            r.push('1. Chaque définition est précédée d\'un exemple numérique ou géométrique concret.');
            r.push('2. Niveau de formalisme adapté au lycée — pas de ε-δ, pas de notation ensembliste lourde.');
            r.push('3. Formules en notation LaTeX correcte si format HTML ou Markdown ($...$ et $$...$$).');
            r.push('4. Chaque exercice précise le type de réponse attendu (calcul, démonstration, tracé).');
            r.push('5. Les résultats intermédiaires sont justifiés — pas de «on obtient» sans calcul.');
        }
    }
    return r.join('\n');
}

function getAutoVerif(disc, fmt) {
    if (fmt === 'HTML interactif' || fmt === 'Présentation HTML') {
        if (disc === 'NSI') return 'Avant de clore : vérifier que chaque id/class est en ASCII pur, que chaque fonction Python a sa test_() avec 3 assertions, que PyScript est en version 2026.3.1, et que la navigation sticky fonctionne.';
        else return 'Avant de clore : vérifier que les formules MathJax sont correctement délimitées ($...$ et $$...$$), que la charte graphique est cohérente, et que chaque section s\'affiche sans erreur de console.';
    }
    if (fmt === 'Markdown') return 'Avant de clore : vérifier la hiérarchie des titres (# → ## → ###), les délimiteurs de blocs de code (``` avec nom du langage), et la notation LaTeX des formules.';
    if (fmt === 'PDF imprimable') return 'Avant de clore : vérifier les styles @media print, la lisibilité en noir et blanc, les sauts de page cohérents et la taille de police lisible à l\'impression.';
    return 'Avant de clore : parcourir la checklist point par point. Pour chaque point non satisfait, corriger immédiatement avant de terminer.';
}

/* ============================================================
   ADAPTER LE CONTEXTE
   ============================================================ */
function adapterContexte() {
    var disc = _discipline, type = v('type-ressource'), fmt = v('format-sortie'), niveau = v('niveau');

    // Visibilité champs disciplinaires
    var rowLang = document.getElementById('row-langage-env');
    var rowMaths = document.getElementById('row-maths-specifique');
    var champLangPy = document.getElementById('champ-langue-python');
    var champNotMaths = document.getElementById('champ-notations-maths');
    var champVocab = document.getElementById('champ-vocab-interdit');
    if (rowLang) rowLang.style.display = disc === 'NSI' ? '' : 'none';
    if (rowMaths) rowMaths.style.display = disc === 'Maths' ? '' : 'none';
    if (champLangPy) champLangPy.style.display = disc === 'NSI' ? '' : 'none';
    if (champNotMaths) champNotMaths.style.display = disc === 'Maths' ? '' : 'none';
    if (champVocab) champVocab.style.display = (type === 'Évaluation' || type === 'Fiche de révision') ? 'none' : '';

    // Titre sec03
    var titresSec03 = { 'TP guidé': { t: 'Structure du TP', d: 'Plan détaillé — l\'IA suit cet ordre à la lettre.' }, 'Cours interactif': { t: 'Plan du cours', d: 'Progression — alterne exposé et interactions.' }, 'Activité découverte': { t: 'Structure de l\'activité', d: 'Progression vers la découverte par l\'élève.' }, 'Évaluation': { t: 'Structure du sujet', d: 'Parties, questions, barème — une ligne par exercice.' }, 'Fiche de révision': { t: 'Structure de la fiche', d: 'Rubriques et sous-rubriques.' }, 'Projet en autonomie': { t: 'Cahier des charges', d: 'Livrables, contraintes, jalons.' }, 'Devoir Maison': { t: 'Structure du DM', d: 'Questions progressives et partie bonus séparée.' }, 'Investigation': { t: 'Structure de l\'investigation', d: 'Problème → hypothèses → expérimentation → conclusions.' } };
    var cfgSec03 = titresSec03[type] || { t: 'Structure', d: '' };
    var s3t = document.getElementById('sec03-titre'); if (s3t) s3t.textContent = cfgSec03.t;
    var s3d = document.getElementById('sec03-desc'); if (s3d) s3d.textContent = cfgSec03.d;

    // Contenu dynamique
    var b4 = document.getElementById('sec04-body'); if (b4) { b4.innerHTML = buildSec04(disc, type); reattachListeners(); }
    var b5 = document.getElementById('sec05-body'); if (b5) { b5.innerHTML = buildSec05(fmt); reattachListeners(); }

    // Valeurs par défaut si vides
    var sectEl = document.getElementById('sections');
    if (sectEl && !sectEl.value.trim()) { var def = SECTIONS_DEFAULT[type] || {}; sectEl.value = def[disc] || def.NSI || ''; }
    var princEl = document.getElementById('principe-central');
    if (princEl && !princEl.value.trim()) { var def2 = PRINCIPES_DEFAULT[type] || {}; princEl.value = def2[disc] || def2.NSI || ''; }

    // Rappels et auto-vérif adaptatifs
    var rappelsEl = document.getElementById('rappels'); if (rappelsEl) rappelsEl.value = getRappels(disc, type, fmt);
    var avEl = document.getElementById('auto-verif'); if (avEl) avEl.value = getAutoVerif(disc, fmt);

    // Pied de page
    var piedEl = document.getElementById('pied-page');
    if (piedEl && !piedEl.value) { piedEl.value = disc + ' ' + niveau + ' — ' + (v('theme') || '…') + ' — Lycée Antoine Watteau — Auteur : DarkSATHI Li'; }

    mettreAJourApercu();
}

function adapterNiveau() {
    chargerChapitres(_discipline, v('niveau'));
    adapterContexte();
}

/* ============================================================
   CHANGER DISCIPLINE
   ============================================================ */
function changerDiscipline(disc) {
    _discipline = disc;
    document.getElementById('btn-disc-nsi').classList.toggle('active', disc === 'NSI');
    document.getElementById('btn-disc-maths').classList.toggle('active', disc === 'Maths');

    // Niveaux
    var sel = document.getElementById('niveau');
    sel.innerHTML = '';
    var niveaux = disc === 'NSI' ? ['Terminale NSI', 'Première NSI', 'BTS SIO'] : ['Terminale générale', 'Première générale', 'Seconde', 'Maths expertes'];
    niveaux.forEach(function (n) { var o = document.createElement('option'); o.value = n; o.textContent = n; sel.appendChild(o); });

    chargerChapitres(disc, sel.value);
    renderCompetences(disc);

    // Vider champs contextuels
    ['prerequis', 'profil-eleves', 'sections', 'principe-central', 'vocab-interdit', 'theme', 'sous-titre', 'pied-page', 'ref-programme'].forEach(function (id) { var el = document.getElementById(id); if (el) el.value = ''; });

    // Badge h1
    var h1 = document.querySelector('h1');
    h1.querySelectorAll('.disc-h1-badge').forEach(function (b) { b.remove(); });
    var span = document.createElement('span');
    span.className = 'disc-h1-badge';
    span.style.cssText = "font-family:'JetBrains Mono',monospace;font-size:.58rem;padding:2px 9px;border-radius:7px;margin-left:11px;font-weight:bold;";
    if (disc === 'NSI') { span.style.background = 'rgba(37,99,235,.68)'; span.style.color = '#bfdbfe'; }
    else { span.style.background = 'rgba(124,58,237,.68)'; span.style.color = '#ddd6fe'; }
    span.textContent = disc;
    h1.appendChild(span);

    adapterContexte();
}

function chargerChapitres(disc, niveau) {
    var sel = document.getElementById('chapitre-preset');
    sel.innerHTML = '<option value="">— Sélectionner dans le programme —</option>';
    var prog = disc === 'NSI' ? PROGRAMME_NSI : PROGRAMME_MATHS;
    var liste = prog[niveau] || [];
    liste.forEach(function (c) { var o = document.createElement('option'); o.value = c.val; o.textContent = c.label; sel.appendChild(o); });
}

function appliquerPresetChapitre() {
    var disc = _discipline, niveau = v('niveau'), val = v('chapitre-preset');
    if (!val) return;
    var prog = disc === 'NSI' ? PROGRAMME_NSI : PROGRAMME_MATHS;
    var item = (prog[niveau] || []).find(function (c) { return c.val === val; });
    if (!item) return;
    document.getElementById('theme').value = item.theme;
    document.getElementById('prerequis').value = item.prerequis;
    if (document.getElementById('ref-programme')) document.getElementById('ref-programme').value = item.refBo;
    var piedEl = document.getElementById('pied-page');
    if (piedEl) piedEl.value = disc + ' ' + niveau + ' — ' + item.label + ' — Lycée Antoine Watteau — Auteur : DarkSATHI Li';
    // Réinitialiser les champs qu'on va recalculer
    document.getElementById('sections').value = '';
    document.getElementById('principe-central').value = '';
    adapterContexte();
}

/* ============================================================
   COMPÉTENCES
   ============================================================ */
function renderCompetences(disc) {
    var grid = document.getElementById('comp-grid');
    var comps = COMPETENCES[disc] || [];
    grid.innerHTML = comps.map(function (c) {
        return '<label class="comp-item ' + (disc === 'NSI' ? 'nsi-comp' : 'math-comp') + '">'
            + '<input type="checkbox" id="' + c.id + '" checked>'
            + '<span class="comp-letter">' + c.lettre + '</span>'
            + '<span class="comp-name">' + c.nom + '</span>'
            + '<span class="comp-desc">' + c.desc + '</span>'
            + '</label>';
    }).join('');
    reattachListeners();
}

function getCompetencesSelec() {
    return (COMPETENCES[_discipline] || []).filter(function (c) { var el = document.getElementById(c.id); return el && el.checked; }).map(function (c) { return c.nom; });
}

/* ============================================================
   OBJECTIFS
   ============================================================ */
function ajouterObjectif() {
    var list = document.getElementById('objectifs-list');
    var div = document.createElement('div'); div.className = 'objectif-item';
    div.innerHTML = "<input type='text' class='objectif-input' placeholder='À la fin, l\\'élève sait…'><button onclick='supprimerObjectif(this)'>✕</button>";
    list.appendChild(div); div.querySelector('input').focus(); reattachListeners();
}
function supprimerObjectif(btn) { var list = document.getElementById('objectifs-list'); if (list.children.length > 1) btn.parentElement.remove(); }
function getObjectifs() { var r = []; document.querySelectorAll('.objectif-input').forEach(function (i) { if (i.value.trim()) r.push(i.value.trim()); }); return r; }

/* ============================================================
   HELPERS
   ============================================================ */
function v(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
function cb(id) { var el = document.getElementById(id); return el && el.checked; }
function secActive(secId) { return !_sectionsDesactivees[secId]; }
function getDiff() { var sel = document.querySelector('input[name="differentiation"]:checked'); return sel ? sel.value : 'une_version'; }
function diffToPrompt(val) {
    if (val === 'deux_versions') return 'DIFFÉRENCIATION : Produire deux versions de chaque exercice :\n- Version accessible : guidage renforcé, questions intermédiaires, cadre de réponse pré-structuré.\n- Version approfondie : énoncé plus direct, exigence plus élevée, pistes d\'extension.';
    if (val === 'trois_versions') return 'DIFFÉRENCIATION : Produire trois versions de chaque exercice :\n- Version guidée : décomposition maximale, chaque étape est une sous-question explicite.\n- Version attendue : niveau classe standard, quelques questions intermédiaires.\n- Version expert : problème ouvert, aucune décomposition imposée, raisonnement autonome exigé.';
    return '';
}

/* ============================================================
   TOGGLE SECTIONS
   ============================================================ */
function toggleSection(secId, btn) {
    _sectionsDesactivees[secId] = !_sectionsDesactivees[secId];
    var sec = document.getElementById(secId);
    if (!sec) return;
    sec.classList.toggle('disabled', _sectionsDesactivees[secId]);
    btn.textContent = _sectionsDesactivees[secId] ? 'Désactivé' : 'Actif';
    btn.classList.toggle('active', _sectionsDesactivees[secId]);
    mettreAJourApercu();
}
function toggleCollapse(secId, btn) {
    _sectionsRepliees[secId] = !_sectionsRepliees[secId];
    var sec = document.getElementById(secId); if (!sec) return;
    sec.classList.toggle('collapsed', _sectionsRepliees[secId]);
    btn.textContent = _sectionsRepliees[secId] ? '▼' : '▲';
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function allerPage(n) {
    document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
    document.getElementById('page' + n).classList.add('active');
    ['1', '2', '3'].forEach(function (i) { var el = document.getElementById('step-ind-' + i); el.classList.remove('active', 'done'); if (parseInt(i) < n) el.classList.add('done'); if (parseInt(i) === n) el.classList.add('active'); });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
function allerPage1() { allerPage(1); }
function allerPage2() { if (!validerPage1()) return; promptGenere = construirePrompt(); afficherApercu(); allerPage(2); }
function allerPage3() { afficherApercu(); afficherChecklist(); document.getElementById('apercu-final').textContent = promptGenere; allerPage(3); }
function validerPage1() {
    var ok = true;
    ['theme', 'prerequis', 'sections', 'principe-central'].forEach(function (id) { var el = document.getElementById(id); if (!el) return; if (!el.value.trim()) { el.style.borderColor = '#e05c5c'; ok = false; } else el.style.borderColor = ''; });
    document.getElementById('err-page1').classList.toggle('visible', !ok);
    return ok;
}

/* ============================================================
   CONSTRUCTION DU PROMPT
   ============================================================ */
function construirePrompt() {
    var disc = _discipline, niveau = v('niveau'), type = v('type-ressource'), fmt = v('format-sortie');
    var numRes = v('num-ressource'), theme = v('theme'), sousTitre = v('sous-titre');
    var prerequis = v('prerequis'), profil = v('profil-eleves'), refProg = v('ref-programme');
    var sections = v('sections'), principe = v('principe-central'), vocabInter = v('vocab-interdit');
    var typo = v('typographie'), ton = v('ton'), langPy = v('langue-python'), notMaths = v('notations-maths');
    var piedPage = v('pied-page'), rappels = v('rappels'), autoVerif = v('auto-verif');
    var objectifs = getObjectifs(), comps = getCompetencesSelec(), diff = getDiff();
    var isNSI = disc === 'NSI';
    var p = '';

    /* RÔLE */
    p += '## RÔLE ET CONTEXTE\n\n';
    var duree = v('duree-ressource') || '1 heure';
    var modeTravail = v('mode-travail') || 'Individuel';
    /* Conseil sections selon durée */
    var nbSectionsConseil = { '30 minutes': '2 à 3 sections maximum', '45 minutes': '3 à 4 sections', '1 heure': '4 à 6 sections', '1h30': '5 à 7 sections', '2 heures': '6 à 8 sections', 'TP 4 heures (2 séances)': '8 à 12 sections sur 2 séances', 'Travail à la maison (sans contrainte de durée)': 'nombre de sections libre' };
    var conseilSections = nbSectionsConseil[duree] || 'adapter au contenu';
    p += 'Tu es un enseignant expert en ' + disc + ' au lycée, niveau ' + niveau + '. ';
    p += 'Tu crées du matériel pédagogique de haute qualité sous forme de **' + fmt + '**. ';
    p += 'Ton objectif est de produire ' + (numRes ? 'la ressource n°' + numRes + ' — ' : '') + 'un(e) **' + type + '** complet(e) sur le thème : **' + theme + '**.\n';
    p += '- Durée : ' + duree + ' — Mode de travail : ' + modeTravail + '\n';
    p += '- Conseil structurel : ' + conseilSections + '. Calibre le nombre de sections en conséquence.\n';
    if (sousTitre) p += 'Sous-titre : ' + sousTitre + '\n';
    if (refProg) p += 'Référence programme : ' + refProg + '\n';
    p += '\n**Méthode :** avant de générer, décompose mentalement la progression section par section, identifie les contraintes critiques de chaque section, puis génère dans l\'ordre indiqué sans omettre aucune section.\n\n---\n\n';

    /* PROFIL */
    if (secActive('sec-02')) {
        p += '## PROFIL DES ÉLÈVES\n\n';
        p += '- Discipline : ' + disc + ' — Niveau : ' + niveau + '\n';
        p += '- Pré-requis validés : ' + prerequis + '\n';
        if (isNSI && v('langage') && v('environnement')) p += '- Langage : ' + v('langage') + ' — Environnement : ' + v('environnement') + '\n';
        if (!isNSI && v('formalisme')) p += '- Niveau de formalisme : ' + v('formalisme') + '\n';
        if (!isNSI && v('calculatrice')) p += '- Calculatrice : ' + v('calculatrice') + '\n';
        if (profil) p += '- Profil et contraintes de la classe : ' + profil + '\n';
        var diffTxt = diffToPrompt(diff);
        if (diffTxt) p += '\n' + diffTxt + '\n';
        p += '\n---\n\n';
    }

    /* COMPÉTENCES + OBJECTIFS */
    if (secActive('sec-01')) {
        if (comps.length > 0) {
            p += '## COMPÉTENCES OFFICIELLES CIBLÉES\n\n';
            p += 'Cette ressource doit explicitement développer les compétences suivantes du programme ' + disc + ' :\n\n';
            comps.forEach(function (c) { p += '- **' + c + '**\n'; });
            p += '\nChaque activité, question et exercice doit être conçu pour mobiliser ces compétences.\n\n';
        }
        if (objectifs.length > 0) {
            p += '## OBJECTIFS D\'APPRENTISSAGE MESURABLES\n\n';
            p += 'À la fin de cette ressource, l\'élève doit être capable de :\n\n';
            objectifs.forEach(function (o, i) { p += (i + 1) + '. ' + o + '\n'; });
            p += '\nTous les contenus doivent contribuer directement à ces objectifs.\n\n';
        }
        p += '---\n\n';
    }

    /* PRINCIPES PÉDAGOGIQUES */
    if (secActive('sec-03')) {
        p += '## PRINCIPES PÉDAGOGIQUES FONDAMENTAUX\n\n';
        p += 'Ces règles s\'appliquent à chaque section, cours comme exercice, sans exception :\n\n' + principe + '\n\n---\n\n';

        /* STRUCTURE */
        p += '## STRUCTURE — ' + type.toUpperCase() + '\n\n';
        p += 'La ressource doit suivre cette progression exacte, dans cet ordre :\n\n';
        sections.split('\n').forEach(function (l) { if (l.trim()) p += l.trim() + '\n'; });
        if (vocabInter && type !== 'Évaluation' && type !== 'Fiche de révision') {
            p += '\n### Vocabulaire interdit en introduction\n\nTermes INTERDITS dans l\'introduction — autorisés uniquement dans les sections de cours, après illustration concrète :\n' + vocabInter + '\n';
        }
        p += '\n---\n\n';
    }

    /* SEC 04 SPÉCIFIQUE */
    if (secActive('sec-04')) {
        if (type === 'TP guidé' || type === 'Cours interactif' || type === 'Activité découverte') {
            if (isNSI) {
                var compoExo = [];
                if (cb('cb-narration')) compoExo.push('Mise en situation narrative');
                if (cb('cb-enonce')) compoExo.push('Énoncé numéroté');
                if (cb('cb-indices')) compoExo.push('Indices progressifs masqués (2 niveaux minimum)');
                if (cb('cb-editeur')) compoExo.push('Éditeur PyScript exécutable pré-rempli avec la fonction de test');
                if (cb('cb-correction')) compoExo.push('Correction cachée déverrouillable');
                if (cb('cb-tests')) compoExo.push('Fonctions test_ pré-écrites dans les éditeurs [OBLIGATOIRE]');
                if (cb('cb-schema')) compoExo.push('Schéma ou figure illustrative');
                if (compoExo.length > 0) {
                    p += '## CONTRAINTES DES EXERCICES NSI\n\nChaque exercice contient dans cet ordre :\n';
                    compoExo.forEach(function (c) { p += '- ' + c + '\n'; });
                    p += '\n';
                }
                if (v('regle-tests')) {
                    p += '### [OBLIGATOIRE] Fonctions de test Python\n\n' + v('regle-tests') + '\n\n';
                    if (v('exemple-test')) p += '**Exemple (format EXACT à reproduire dans CHAQUE exercice) :**\n\n```python\n' + v('exemple-test') + '\n```\n\n';
                    if (v('exemple-exo')) p += '### Exemple d\'exercice complet (format EXACT)\n\n' + v('exemple-exo') + '\n\n';
                }
            } else {
                var compoMaths = [];
                if (cb('cb-contexte')) compoMaths.push('Contexte ou mise en situation concrète');
                if (cb('cb-enonce')) compoMaths.push('Énoncé numéroté avec barème indiqué si évaluation');
                if (cb('cb-etapes')) compoMaths.push('Questions intermédiaires guidantes');
                if (cb('cb-figure')) compoMaths.push('Figure ou schéma (légendé si attendu)');
                if (cb('cb-correction')) compoMaths.push('Correction détaillée avec justifications de chaque étape');
                if (cb('cb-methode')) compoMaths.push('Encadré «méthode» associé en marge ou en fin d\'exercice');
                if (compoMaths.length > 0) {
                    p += '## CONTRAINTES DES EXERCICES MATHS\n\nChaque exercice contient :\n';
                    compoMaths.forEach(function (c) { p += '- ' + c + '\n'; });
                    p += '\n';
                }
                var typeRepMaths = [];
                if (cb('cb-calcul-num')) typeRepMaths.push('Calcul numérique');
                if (cb('cb-alg')) typeRepMaths.push('Résolution algébrique');
                if (cb('cb-demo')) typeRepMaths.push('Démonstration rédigée');
                if (cb('cb-trace')) typeRepMaths.push('Tracé de courbe ou figure');
                if (cb('cb-model')) typeRepMaths.push('Modélisation');
                if (typeRepMaths.length > 0) p += 'Types de réponses attendues : ' + typeRepMaths.join(', ') + '.\n\n';
                if (v('exemple-exo')) p += '### Exemple de mise en forme (format EXACT à reproduire)\n\n' + v('exemple-exo') + '\n\n';
            }
            p += '\n---\n\n';
        }
        if (type === 'Évaluation') {
            p += '## PARAMÈTRES DE L\'ÉVALUATION\n\n';
            if (v('eval-duree')) p += '- Durée : ' + v('eval-duree') + '\n';
            if (v('eval-bareme')) p += '- Barème : ' + v('eval-bareme') + '\n';
            if (v('eval-materiel')) p += '- Matériel autorisé : ' + v('eval-materiel') + '\n';
            if (!isNSI && v('eval-bareme-type')) p += '- Système de barème : ' + v('eval-bareme-type') + '\n';
            var tq = [];
            ['cb-qcm', 'cb-lect-code', 'cb-compl-code', 'cb-ecrit-code', 'cb-trace-exec', 'cb-redac', 'cb-calcul-eval', 'cb-demo-eval', 'cb-trace-eval', 'cb-qcm-eval', 'cb-pb-eval'].forEach(function (id) {
                var el = document.getElementById(id);
                if (el && el.checked) { var labels = { 'cb-qcm': 'QCM/Vrai-Faux', 'cb-lect-code': 'Lecture de code', 'cb-compl-code': 'Complétion de code', 'cb-ecrit-code': 'Écriture de code libre', 'cb-trace-exec': 'Trace d\'exécution', 'cb-redac': 'Question rédigée', 'cb-calcul-eval': 'Calcul', 'cb-demo-eval': 'Démonstration', 'cb-trace-eval': 'Tracé', 'cb-qcm-eval': 'QCM', 'cb-pb-eval': 'Problème de modélisation' }; tq.push(labels[id] || id); }
            });
            if (tq.length > 0) p += '- Types de questions : ' + tq.join(', ') + '\n';
            if (v('eval-contraintes')) p += '\n### Contraintes de rédaction\n\n' + v('eval-contraintes') + '\n';
            p += '\n---\n\n';
        }
        if (type === 'Fiche de révision') {
            p += '## PARAMÈTRES DE LA FICHE\n\n';
            if (v('fiche-format')) p += '- Format visuel : ' + v('fiche-format') + '\n';
            if (v('fiche-densite')) p += '- Densité : ' + v('fiche-densite') + '\n';
            if (v('fiche-contraintes')) p += '\n### Contraintes de mise en forme\n\n' + v('fiche-contraintes') + '\n';
            p += '\n---\n\n';
        }
        if (type === 'Projet en autonomie') {
            p += '## CAHIER DES CHARGES DU PROJET\n\n';
            if (v('projet-livrables')) p += '### Livrables attendus\n\n' + v('projet-livrables') + '\n\n';
            if (v('projet-grille')) p += '### Grille d\'évaluation\n\n' + v('projet-grille') + '\n\n';
            p += '\n---\n\n';
        }
    }

    /* FORMAT TECHNIQUE */
    if (secActive('sec-05')) {
        p += '## FORMAT DE SORTIE : ' + fmt.toUpperCase() + '\n\n';
        if (fmt === 'HTML interactif') {
            p += 'Produire une seule page HTML complète et autonome (de <!DOCTYPE html> à </html>), fonctionnelle sans serveur dans Chrome, Firefox et Edge.\n';
            if (v('cdn')) { p += '\n### [OBLIGATOIRE] CDN et versions exactes\n\n'; v('cdn').split('\n').forEach(function (l) { if (l.trim()) p += l.trim() + '\n'; }); }
            if (v('charte')) { p += '\n### [OBLIGATOIRE] Charte graphique (variables CSS)\n\n'; v('charte').split('\n').forEach(function (l) { if (l.trim()) p += l.trim() + '\n'; }); }
            if (v('polices')) { p += '\n### Polices de caractères\n\n' + v('polices') + '\n'; }
            if (v('composants')) { p += '\n### [OBLIGATOIRE] Composants UI\n\n'; v('composants').split('\n').forEach(function (l) { if (l.trim()) p += l.trim() + '\n'; }); }
            if (v('regles-html')) { p += '\n### [OBLIGATOIRE] Règles HTML critiques\n\n'; v('regles-html').split('\n').forEach(function (l) { if (l.trim()) p += l.trim() + '\n'; }); }
        } else if (fmt === 'PDF imprimable') {
            p += 'Produire une page HTML avec styles @media print pour rendu PDF A4 imprimable.\n';
            if (v('pdf-format')) p += '- Format papier : ' + v('pdf-format') + '\n';
            if (v('pdf-marges')) p += '- Marges : ' + v('pdf-marges') + '\n';
            if (v('polices')) p += '\n### Polices\n\n' + v('polices') + '\n';
            if (v('regles-html')) { p += '\n### Règles d\'impression\n\n'; v('regles-html').split('\n').forEach(function (l) { if (l.trim()) p += l.trim() + '\n'; }); }
        } else if (fmt === 'Markdown') {
            p += 'Produire un document Markdown structuré.\n';
            if (v('md-dialecte')) p += '- Dialecte Markdown : ' + v('md-dialecte') + '\n';
            if (v('regles-html')) { p += '\n### Règles Markdown\n\n'; v('regles-html').split('\n').forEach(function (l) { if (l.trim()) p += l.trim() + '\n'; }); }
        } else if (fmt === 'DOCX') {
            p += 'Produire le texte du document avec instructions de mise en forme Word entre [crochets].\n';
            if (v('docx-style')) p += '- Style de document : ' + v('docx-style') + '\n';
            if (v('polices')) p += '\n### Styles Word\n\n' + v('polices') + '\n';
            if (v('regles-html')) { p += '\n### Règles DOCX\n\n'; v('regles-html').split('\n').forEach(function (l) { if (l.trim()) p += l.trim() + '\n'; }); }
        } else if (fmt === 'Présentation HTML') {
            p += 'Produire une présentation HTML autonome avec slides.\n';
            if (v('slides-lib')) p += '- Bibliothèque : ' + v('slides-lib') + '\n';
            if (v('charte')) p += '\n### Charte graphique\n\n' + v('charte') + '\n';
            if (v('polices')) p += '\n### Polices\n\n' + v('polices') + '\n';
            if (v('regles-html')) { p += '\n### Paramètres\n\n'; v('regles-html').split('\n').forEach(function (l) { if (l.trim()) p += l.trim() + '\n'; }); }
        }
        p += '\n- Pied de page / auteur : « ' + piedPage + ' »\n';
        p += '\n**Auto-vérification avant de terminer :** ' + autoVerif + '\n\n---\n\n';
    }

    /* LINGUISTIQUE */
    if (secActive('sec-06')) {
        p += '## EXIGENCES LINGUISTIQUES\n\n';
        if (typo) p += '### Typographie\n\n' + typo + '\n\n';
        if (ton) p += '### Ton et registre\n\n' + ton + '\n\n';
        if (isNSI && langPy) p += '### Langue des identifiants Python\n\n' + langPy + '\n\n';
        if (!isNSI && notMaths) p += '### Notations mathématiques\n\n' + notMaths + '\n\n';
        p += '\n---\n\n';
    }

    /* CONTRÔLE QUALITÉ */
    p += '## CONTRÔLE QUALITÉ FINAL\n\n';
    p += 'Lire avant de commencer. Revérifier avant de clore.\n\n';
    p += '### Pédagogie\n';
    p += '- [ ] Introduction sans terme technique interdit\n';
    p += '- [ ] Chaque concept illustré avant d\'être nommé\n';
    p += '- [ ] Un concept maximum par paragraphe\n';
    p += '- [ ] Ton, registre et tutoiement conformes\n';
    if (comps.length > 0) p += '- [ ] Compétences ciblées mobilisées explicitement : ' + comps.join(', ') + '\n';
    if (objectifs.length > 0) p += '- [ ] Tous les objectifs d\'apprentissage couverts\n';
    if (diff !== 'une_version') p += '- [ ] Différenciation en ' + (diff === 'deux_versions' ? '2' : '3') + ' versions produite pour chaque exercice\n';
    p += '\n';
    if (isNSI && (type === 'TP guidé' || type === 'Cours interactif')) {
        p += '### [OBLIGATOIRE] Tests de code NSI\n';
        p += '- [ ] Chaque fonction Python a sa test_nom() avec ≥ 3 assertions sur valeurs littérales\n';
        p += '- [ ] print("Les tests sont validés.") présent dans chaque fonction test_\n';
        p += '- [ ] Éditeurs PyScript pré-remplis avec la fonction de test\n';
        p += '- [ ] Corrections contiennent les mêmes assertions que les énoncés\n\n';
    }
    if (!isNSI) {
        p += '### Mathématiques\n';
        p += '- [ ] Notation conforme aux conventions lycée ' + niveau + '\n';
        if (notMaths && notMaths.indexOf('LaTeX') !== -1) p += '- [ ] Formules LaTeX correctement délimitées ($...$ inline, $$...$$ display)\n';
        if (type === 'Évaluation') { p += '- [ ] Barème affiché pour chaque question\n'; p += '- [ ] Questions indépendantes autant que possible\n'; }
        p += '\n';
    }
    p += '### Format — ' + fmt + '\n';
    if (fmt === 'HTML interactif' || fmt === 'Présentation HTML') {
        p += '- [ ] Aucun id ou class contient un caractère non-ASCII\n';
        p += '- [ ] Versions CDN exactes utilisées\n';
        p += '- [ ] Page fonctionnelle sans serveur\n';
        if (isNSI) p += '- [ ] PyScript 2026.3.1 exclusivement\n';
    } else if (fmt === 'PDF imprimable') { p += '- [ ] Styles @media print définis\n- [ ] Lisible en noir et blanc\n'; }
    else if (fmt === 'Markdown') { p += '- [ ] Hiérarchie des titres cohérente\n- [ ] Blocs de code délimités avec nom du langage\n'; }
    p += '- [ ] Pied de page correct : ' + piedPage + '\n\n---\n\n';

    /* RAPPELS */
    if (secActive('sec-07')) {
        p += '## RAPPELS DE DERNIÈRE MINUTE\n\n';
        p += '*Contraintes les plus susceptibles d\'être oubliées en milieu de contexte long.*\n\n';
        rappels.split('\n').forEach(function (l) { var ligne = l.trim(); if (ligne) { if (!/^\d+\./.test(ligne)) ligne = '- ' + ligne; p += ligne + '\n'; } });
    }
    return p;
}

/* ============================================================
   APERÇU
   ============================================================ */
function afficherApercu() {
    var el = document.getElementById('apercu-prompt'); if (el) el.textContent = promptGenere;
    var chars = promptGenere.length, mots = promptGenere.split(/\s+/).filter(Boolean).length;
    var tokens = Math.round(chars / 4), lignes = promptGenere.split('\n').length;
    var statsEl = document.getElementById('stats-prompt');
    if (statsEl) statsEl.innerHTML = statBloc(chars.toLocaleString('fr-FR'), 'Caractères') + statBloc(mots.toLocaleString('fr-FR'), 'Mots') + statBloc(tokens.toLocaleString('fr-FR'), 'Tokens') + statBloc(lignes.toLocaleString('fr-FR'), 'Lignes');
}
function statBloc(val, lbl) { return '<div class="stat-bloc"><span class="stat-val">' + val + '</span><span class="stat-lbl">' + lbl + '</span></div>'; }

function mettreAJourApercu() {
    var p = construirePrompt();
    var preview = document.getElementById('live-preview');
    if (preview) { preview.dataset.full = p; if (_apercuExpanded) preview.textContent = p; else { var lines = p.split('\n'); preview.textContent = lines.slice(0, 20).join('\n') + (lines.length > 20 ? '\n…' : ''); } }
    var statsEl = document.getElementById('live-stats');
    if (statsEl) { var tok = Math.round(p.length / 4); statsEl.textContent = '~' + tok.toLocaleString('fr-FR') + ' tokens · ' + p.split('\n').length + ' lignes'; }
    sauvegarderBrouillon();
}
function toggleApercu() {
    var preview = document.getElementById('live-preview'), btn = document.getElementById('btn-voir-tout');
    if (!preview || !btn) return;
    _apercuExpanded = !_apercuExpanded;
    if (_apercuExpanded) { preview.textContent = preview.dataset.full || preview.textContent; preview.classList.remove('collapsed'); preview.classList.add('expanded'); btn.textContent = '▲ Réduire'; }
    else { var lines = (preview.dataset.full || preview.textContent).split('\n'); preview.textContent = lines.slice(0, 20).join('\n') + (lines.length > 20 ? '\n…' : ''); preview.classList.remove('expanded'); preview.classList.add('collapsed'); btn.textContent = '▼ Voir tout'; preview.closest('.live-preview-wrap').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
}

/* ============================================================
   BIBLIOTHÈQUE
   ============================================================ */
function chargerLib() { try { return JSON.parse(localStorage.getItem(LIBRARY_KEY) || '{}'); } catch (e) { return {}; } }
function sauvegarderLib(lib) { try { localStorage.setItem(LIBRARY_KEY, JSON.stringify(lib)); } catch (e) { } }
function renderLibrarySlots() {
    var lib = chargerLib(), container = document.getElementById('library-slots');
    container.innerHTML = '';
    var keys = Object.keys(lib);
    if (keys.length === 0) { var empty = document.createElement('span'); empty.style.cssText = "font-family:'JetBrains Mono',monospace;font-size:.65rem;color:rgba(255,255,255,.22);"; empty.textContent = 'Aucun prompt sauvegardé'; container.appendChild(empty); return; }
    keys.forEach(function (k) { var btn = document.createElement('button'); btn.className = 'slot-btn' + (k === _slotActif ? ' active' : ''); btn.title = 'Charger : ' + k; btn.textContent = k; btn.onclick = function () { chargerSlot(k); }; container.appendChild(btn); });
}
function ouvrirModalSauvegarde() {
    var inp = document.getElementById('modal-slot-name');
    inp.value = _slotActif || ((v('theme') || 'prompt').replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30));
    document.getElementById('modal-rename').classList.add('visible');
    setTimeout(function () { inp.focus(); inp.select(); }, 80);
}
function fermerModal() { document.getElementById('modal-rename').classList.remove('visible'); }
function confirmerSauvegardeSlot() {
    var nom = document.getElementById('modal-slot-name').value.trim(); if (!nom) return;
    var lib = chargerLib(); lib[nom] = collecterEtat(); sauvegarderLib(lib);
    _slotActif = nom; fermerModal(); renderLibrarySlots(); afficherToast('✓ Sauvegardé : ' + nom);
}
function chargerSlot(nom) {
    var lib = chargerLib(), data = lib[nom]; if (!data) return;
    _slotActif = nom; appliquerEtat(data); renderLibrarySlots(); afficherToast('Chargé : ' + nom);
}
function supprimerSlotActif() {
    if (!_slotActif) { afficherToast('Aucun prompt sélectionné'); return; }
    if (!confirm('Supprimer « ' + _slotActif + ' » ?')) return;
    var lib = chargerLib(); delete lib[_slotActif]; sauvegarderLib(lib);
    _slotActif = null; renderLibrarySlots(); afficherToast('Supprimé');
}
function nouveauPrompt() {
    _slotActif = null; _sectionsDesactivees = {}; _sectionsRepliees = {};
    ['theme', 'sous-titre', 'prerequis', 'profil-eleves', 'sections', 'principe-central', 'vocab-interdit', 'num-ressource', 'ref-programme', 'pied-page'].forEach(function (id) { var el = document.getElementById(id); if (el) el.value = ''; });
    document.getElementById('objectifs-list').innerHTML = "<div class='objectif-item'><input type='text' class='objectif-input' placeholder='À la fin, l\\'élève sait\u2026'><button onclick='supprimerObjectif(this)'>✕</button></div>";
    // Réactiver toutes les sections
    ['sec-01', 'sec-02', 'sec-03', 'sec-04', 'sec-05', 'sec-06', 'sec-07'].forEach(function (id) {
        var sec = document.getElementById(id); if (!sec) return;
        sec.classList.remove('disabled', 'collapsed');
        var togBtn = sec.querySelector('.section-toggle-btn'); if (togBtn) { togBtn.textContent = 'Actif'; togBtn.classList.remove('active'); }
        var colBtn = sec.querySelector('.collapse-btn'); if (colBtn) colBtn.textContent = '▲';
    });
    adapterContexte(); renderLibrarySlots(); afficherToast('Nouveau prompt vide');
}

function collecterEtat() {
    var data = { discipline: _discipline, sectionsDesactivees: JSON.parse(JSON.stringify(_sectionsDesactivees)) };
    var ids = ['niveau', 'type-ressource', 'format-sortie', 'num-ressource', 'theme', 'sous-titre', 'prerequis', 'profil-eleves', 'sections', 'principe-central', 'vocab-interdit', 'typographie', 'ton', 'langue-python', 'notations-maths', 'pied-page', 'ref-programme', 'rappels', 'auto-verif', 'formalisme', 'calculatrice', 'regle-tests', 'exemple-test', 'exemple-exo', 'cdn', 'charte', 'polices', 'composants', 'regles-html', 'eval-duree', 'eval-bareme', 'eval-materiel', 'eval-contraintes', 'eval-bareme-type', 'fiche-format', 'fiche-densite', 'fiche-contraintes', 'projet-livrables', 'projet-grille', 'pdf-format', 'pdf-marges', 'md-dialecte', 'docx-style', 'slides-lib'];
    ids.forEach(function (id) { var el = document.getElementById(id); if (el) data[id] = el.value; });
    var objs = []; document.querySelectorAll('.objectif-input').forEach(function (i) { objs.push(i.value); }); data._objectifs = objs;
    var diff = document.querySelector('input[name="differentiation"]:checked'); data._diff = diff ? diff.value : 'une_version';
    return data;
}

function appliquerEtat(data) {
    if (data.discipline && data.discipline !== _discipline) changerDiscipline(data.discipline);
    ['niveau', 'type-ressource', 'format-sortie'].forEach(function (id) { var el = document.getElementById(id); if (el && data[id] !== undefined) el.value = data[id]; });
    adapterContexte();
    var ids = ['num-ressource', 'theme', 'sous-titre', 'prerequis', 'profil-eleves', 'sections', 'principe-central', 'vocab-interdit', 'typographie', 'ton', 'langue-python', 'notations-maths', 'pied-page', 'ref-programme', 'rappels', 'auto-verif', 'formalisme', 'calculatrice', 'regle-tests', 'exemple-test', 'exemple-exo', 'cdn', 'charte', 'polices', 'composants', 'regles-html', 'eval-duree', 'eval-bareme', 'eval-materiel', 'eval-contraintes', 'eval-bareme-type', 'fiche-format', 'fiche-densite', 'fiche-contraintes', 'projet-livrables', 'projet-grille', 'pdf-format', 'pdf-marges', 'md-dialecte', 'docx-style', 'slides-lib'];
    ids.forEach(function (id) { var el = document.getElementById(id); if (el && data[id] !== undefined) el.value = data[id]; });
    if (data._objectifs && data._objectifs.length > 0) {
        var list = document.getElementById('objectifs-list'); list.innerHTML = '';
        data._objectifs.forEach(function (val) { var div = document.createElement('div'); div.className = 'objectif-item'; div.innerHTML = "<input type='text' class='objectif-input' placeholder='À la fin, l\\'élève sait\u2026'><button onclick='supprimerObjectif(this)'>✕</button>"; div.querySelector('input').value = val; list.appendChild(div); });
    }
    if (data._diff) { var r = document.querySelector('input[name="differentiation"][value="' + data._diff + '"]'); if (r) r.checked = true; }
    if (data.sectionsDesactivees) {
        _sectionsDesactivees = data.sectionsDesactivees;
        Object.keys(_sectionsDesactivees).forEach(function (secId) {
            if (_sectionsDesactivees[secId]) { var sec = document.getElementById(secId); if (sec) { sec.classList.add('disabled'); var btn = sec.querySelector('.section-toggle-btn'); if (btn) { btn.textContent = 'Désactivé'; btn.classList.add('active'); } } }
        });
    }
    mettreAJourApercu();
}

/* ============================================================
   SAUVEGARDE AUTOMATIQUE
   ============================================================ */
function sauvegarderBrouillon() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(collecterEtat())); afficherToast('💾 Brouillon sauvegardé'); } catch (e) { } }, 1400);
}
function chargerBrouillon() {
    try { var raw = localStorage.getItem(STORAGE_KEY); if (!raw) return false; appliquerEtat(JSON.parse(raw)); return true; } catch (e) { return false; }
}
function reinitialiser() { if (!confirm('Réinitialiser le formulaire ?')) return; _slotActif = null; nouveauPrompt(); }
function afficherToast(msg) { var t = document.getElementById('toast'); t.textContent = msg; t.classList.add('visible'); setTimeout(function () { t.classList.remove('visible'); }, 2000); }

/* ============================================================
   GROQ
   ============================================================ */
async function testerAPI() {
    var cle = document.getElementById('api-key').value.trim();
    var statut = document.getElementById('api-statut'), errEl = document.getElementById('err-api'), okEl = document.getElementById('ok-api');
    errEl.classList.remove('visible'); okEl.classList.remove('visible');
    if (!cle) { statut.className = 'api-statut ko'; statut.textContent = 'Clé manquante'; return; }
    statut.className = 'api-statut idle'; statut.textContent = 'Test…';
    try {
        var resp = await fetch('https://api.groq.com/openai/v1/models', { headers: { 'Authorization': 'Bearer ' + cle } });
        if (resp.ok) { statut.className = 'api-statut ok'; statut.textContent = 'OK'; okEl.textContent = 'Connexion établie — tu peux évaluer.'; okEl.classList.add('visible'); }
        else { statut.className = 'api-statut ko'; statut.textContent = 'Invalide'; errEl.textContent = 'Clé API invalide ou expirée.'; errEl.classList.add('visible'); }
    } catch (e) { statut.className = 'api-statut ko'; statut.textContent = 'Réseau'; errEl.textContent = 'Impossible de contacter Groq.'; errEl.classList.add('visible'); }
}

async function evaluerPrompt() {
    var cle = document.getElementById('api-key').value.trim();
    if (!cle) { document.getElementById('err-api').textContent = 'Saisis ta clé API Groq.'; document.getElementById('err-api').classList.add('visible'); return; }
    document.getElementById('loading-msg').textContent = 'Évaluation en cours…';
    document.getElementById('loading').classList.add('visible');
    document.getElementById('btn-evaluer').disabled = true;
    var disc = _discipline;
    var sysP = 'Tu es un expert en prompt engineering pour l\'enseignement secondaire, spécialisé en ' + disc + '.\nTu évalues des prompts pédagogiques destinés à générer des ressources lycée.\nRéponds UNIQUEMENT en JSON valide, sans markdown ni backticks.\nFormat exact :\n{"criteres":[{"nom":"Clarté pédagogique","note":4,"commentaire":"...","section_a_corriger":"Section 03"},{"nom":"Précision discipline ' + disc + '","note":3,"commentaire":"...","section_a_corriger":"Section 04"},{"nom":"Exemples few-shot","note":5,"commentaire":"...","section_a_corriger":null},{"nom":"Résistance anti-oubli","note":4,"commentaire":"...","section_a_corriger":"Section 07"},{"nom":"Cohérence type×format","note":4,"commentaire":"...","section_a_corriger":null}],"note_globale":4,"resume":"Résumé en une ligne.","suggestions":[{"texte":"Suggestion 1.","section":"Section 04"},{"texte":"Suggestion 2.","section":null}]}\nNotes sur 5.';
    var userP = 'Évalue ce prompt ' + disc + ' selon : (1) clarté pédagogique, (2) précision spécifique à la discipline ' + disc + ' (notations, formalisme, conventions), (3) qualité des exemples few-shot, (4) résistance au phénomène lost-in-the-middle, (5) cohérence entre type de ressource et format de sortie.\n\n' + promptGenere;
    try {
        var resp = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { 'Authorization': 'Bearer ' + cle, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: 1600, temperature: 0.3, messages: [{ role: 'system', content: sysP }, { role: 'user', content: userP }] }) });
        var data = await resp.json();
        if (!resp.ok) throw new Error(data.error && data.error.message ? data.error.message : 'Erreur Groq');
        var contenu = data.choices[0].message.content.trim().replace(/```json/g, '').replace(/```/g, '').trim();
        afficherEvaluation(JSON.parse(contenu));
    } catch (e) {
        var errMsg = document.getElementById('err-api');
        errMsg.textContent = 'Erreur : ' + e.message + ' — Clique pour réessayer.';
        errMsg.classList.add('visible');
        errMsg.style.cursor = 'pointer';
        errMsg.onclick = function () { errMsg.classList.remove('visible'); errMsg.onclick = null; errMsg.style.cursor = ''; };
    }
    finally { document.getElementById('loading').classList.remove('visible'); document.getElementById('btn-evaluer').disabled = false; }
}

function afficherEvaluation(data) {
    var zone = document.getElementById('eval-zone'), critEl = document.getElementById('eval-criteres');
    var globalEl = document.getElementById('eval-global-bloc'), suggEl = document.getElementById('eval-suggestions-bloc');
    var btnRow = document.getElementById('btn-row-p2');
    critEl.innerHTML = '';
    data.criteres.forEach(function (c) {
        var cls = 'n' + Math.min(5, Math.max(1, Math.round(c.note)));
        var lien = c.section_a_corriger ? '<button onclick="retournerSection(\'' + c.section_a_corriger + '\')" style="font-family:\'JetBrains Mono\',monospace;font-size:.66rem;background:rgba(255,193,7,.12);border:1px solid rgba(255,193,7,.32);color:#ffc107;border-radius:4px;padding:2px 7px;cursor:pointer;margin-left:7px;">→ Corriger</button>' : '';
        critEl.innerHTML += '<div class="eval-critere"><div class="eval-note ' + cls + '">' + c.note + '/5</div><div class="eval-contenu"><h4>' + c.nom + lien + '</h4><p>' + c.commentaire + '</p></div></div>';
    });
    globalEl.innerHTML = '<div class="eval-global"><div class="eval-global-note">' + data.note_globale + '/5</div><div class="eval-global-texte"><strong style="color:white;">Note globale</strong><br>' + (data.resume || '') + '</div></div>';
    if (data.suggestions && data.suggestions.length) {
        var sugg = '<div class="eval-suggestions"><h4>Suggestions</h4><ul>';
        data.suggestions.forEach(function (s) { var texte = typeof s === 'string' ? s : (s.texte || ''); var section = typeof s === 'object' ? s.section : null; var lienC = section ? '<button onclick="retournerSection(\'' + section + '\')" style="font-family:\'JetBrains Mono\',monospace;font-size:.64rem;background:rgba(255,193,7,.1);border:1px solid rgba(255,193,7,.25);color:#ffc107;border-radius:4px;padding:1px 5px;cursor:pointer;margin-left:5px;">→ ' + section + '</button>' : ''; sugg += '<li>' + texte + lienC + '</li>'; });
        sugg += '</ul></div>'; suggEl.innerHTML = sugg;
    }
    zone.style.display = 'block'; btnRow.style.display = 'none';
}
function retournerSection(sectionLabel) {
    allerPage(1);
    setTimeout(function () { document.querySelectorAll('.section-titre-bloc h2').forEach(function (h) { if (h.textContent.toLowerCase().indexOf(sectionLabel.toLowerCase().replace(/section \d+ ?[—-]? ?/i, '')) !== -1) { h.closest('.form-section').scrollIntoView({ behavior: 'smooth', block: 'center' }); h.closest('.form-section').style.boxShadow = '0 0 0 3px #ffc107'; setTimeout(function () { h.closest('.form-section').style.boxShadow = ''; }, 2800); } }); }, 200);
}

/* ============================================================
   CHECKLIST PAGE 3
   ============================================================ */
function afficherChecklist() {
    var p = promptGenere, disc = _discipline, type = v('type-ressource'), fmt = v('format-sortie'), niveau = v('niveau');
    function contient(m) { return typeof m === 'string' ? p.indexOf(m) !== -1 : m.test(p); }
    function li(ok, crit, label, conseil) { var ico = ok ? '<span class="check-ok">✓</span>' : (crit ? '<span class="check-manq">✗</span>' : '<span class="check-warn">△</span>'); var s = conseil && !ok ? ' <span style="font-size:.66rem;color:rgba(255,255,255,.32);">— ' + conseil + '</span>' : ''; return '<li>' + ico + ' ' + label + s + '</li>'; }

    var pedago = [];
    pedago.push(li(contient('PRINCIPES PÉDAGOGIQUES'), true, 'Principes pédagogiques présents'));
    pedago.push(li(contient('STRUCTURE'), true, 'Structure de la ressource présente'));
    pedago.push(li(contient('un concept') || contient('Un concept') || contient('par paragraphe'), false, 'Règle un concept/paragraphe présente'));
    pedago.push(li(contient('tutoiement') || contient('"tu"'), false, 'Consigne de tutoiement présente'));
    pedago.push(li(contient('OBJECTIFS D\'APPRENTISSAGE') || contient('capable de'), false, 'Objectifs d\'apprentissage présents'));
    pedago.push(li(contient('COMPÉTENCES OFFICIELLES') || contient('compétences'), false, 'Compétences officielles référencées'));
    pedago.push(li(contient('CONTRÔLE QUALITÉ') || contient('checklist'), true, 'Checklist qualité finale incluse'));
    pedago.push(li(contient('RAPPELS DE DERNIÈRE MINUTE'), true, 'Rappels de dernière minute présents'));

    var spec = [];
    if (disc === 'NSI' && (type === 'TP guidé' || type === 'Cours interactif')) {
        spec.push(li(contient('test_') && contient('assert'), true, 'Convention test_ + assertions présente'));
        spec.push(li(contient('minimum 3') || contient('≥ 3 assertions'), true, 'Minimum 3 assertions exigé'));
        spec.push(li(contient('Les tests sont valid'), true, 'print("Les tests sont validés.") requis'));
        spec.push(li(contient('pré-écrite') || contient('pré-rempli'), true, 'Éditeur avec fonction de test pré-remplie'));
        spec.push(li(contient('```python') || contient('def test_'), true, 'Exemple few-shot de fonction de test présent'));
        spec.push(li(contient('[OBLIGATOIRE]') && contient('test'), false, 'Marquage [OBLIGATOIRE] sur la règle des tests'));
        spec.push(li(contient('PyScript') && contient('2026'), true, 'Version PyScript 2026 précisée'));
    } else if (disc === 'Maths') {
        spec.push(li(contient('formalisme') || contient('Formalisme') || contient('notation') || contient('LaTeX'), true, 'Contraintes de formalisme/notation présentes'));
        spec.push(li(contient('Programme') || contient('BO ') || contient('Terminale') || contient('Première') || contient('Seconde'), false, 'Référence au programme officiel présente'));
        if (type === 'Évaluation') {
            spec.push(li(contient('Durée') || contient('durée'), true, 'Durée de l\'évaluation précisée'));
            spec.push(li(contient('Barème') || contient('barème'), true, 'Barème présent'));
            spec.push(li(v('eval-bareme-type') && contient('compétences') || contient('Ch/Mo/Re/Ra'), false, 'Barème compétences défini si attendu'));
        }
        if (type === 'Fiche de révision') {
            spec.push(li(contient('PARAMÈTRES DE LA FICHE'), true, 'Paramètres de la fiche présents'));
            spec.push(li(contient('10 secondes') || contient('mémorisable'), false, 'Contrainte de mémorisation présente'));
        }
        if (type === 'Projet en autonomie') {
            spec.push(li(contient('CAHIER DES CHARGES') || contient('Livrables'), true, 'Cahier des charges présent'));
            spec.push(li(contient('Grille d\'évaluation') || contient('grille'), true, 'Grille d\'évaluation présente'));
        }
        if (type === 'TP guidé' || type === 'Cours interactif') {
            spec.push(li(contient('exemple numérique') || contient('exemple concret'), false, 'Exemples numériques exigés avant les définitions'));
        }
        if (v('notations-maths') && v('notations-maths').indexOf('LaTeX') !== -1) {
            spec.push(li(contient('$...$') || contient('LaTeX') || contient('MathJax'), false, 'Notation LaTeX/MathJax référencée'));
        }
    } else {
        spec.push(li(true, false, 'Type de ressource pris en compte'));
    }

    var tech = [];
    tech.push(li(contient('FORMAT DE SORTIE'), true, 'Section format de sortie présente'));
    if (fmt === 'HTML interactif' || fmt === 'Présentation HTML') {
        tech.push(li(contient('ASCII') && (contient('id') || contient('class')), true, 'Règle ASCII sur id/class présente'));
        tech.push(li(contient('Bootstrap') && contient('5.3'), false, 'Version Bootstrap précisée'));
        if (disc === 'NSI') tech.push(li(contient('PyScript') && contient('2026'), true, 'Version PyScript 2026 précisée'));
        tech.push(li(contient('sticky'), false, 'Navigation sticky mentionnée'));
        tech.push(li(contient('2000 lignes') || contient('diviser'), false, 'Règle de division si trop long'));
    } else if (fmt === 'PDF imprimable') {
        tech.push(li(contient('@media print') || contient('impression'), true, 'Styles d\'impression définis'));
        tech.push(li(contient('A4'), false, 'Format A4 précisé'));
    } else if (fmt === 'Markdown') {
        tech.push(li(contient('Markdown'), true, 'Format Markdown précisé'));
        tech.push(li(contient('$...$') || contient('LaTeX'), false, 'Notation LaTeX dans les règles Markdown'));
    }
    tech.push(li(contient('pied') || contient('footer') || contient('Lycée') || contient('Watteau'), false, 'Pied de page renseigné'));
    tech.push(li(contient('Auto-vérification') || contient('auto-vérification') || contient('avant de terminer') || contient('avant de clore'), false, 'Instruction d\'auto-vérification présente'));
    tech.push(li(contient('Programme') || contient('BO ') || contient('référence programme'), false, 'Référence programme dans le prompt'));

    document.getElementById('cq-pedago').innerHTML = pedago.join('');
    document.getElementById('cq-specifique').innerHTML = spec.join('');
    document.getElementById('cq-technique').innerHTML = tech.join('');

    var tous = [];
    function extract(html) { var m = html.match(/check-ok|check-manq|check-warn/g) || []; m.forEach(function (c) { tous.push(c === 'check-ok'); }); }
    extract(pedago.join('')); extract(spec.join('')); extract(tech.join(''));
    var total = tous.length, ok = tous.filter(Boolean).length, pct = Math.round((ok / total) * 100);
    var col = pct >= 85 ? '#4caf50' : pct >= 65 ? '#ffc107' : '#e05c5c';
    var lbl = pct >= 85 ? 'Prompt de qualité professionnelle' : pct >= 65 ? 'Prompt correct — améliorations possibles' : 'Prompt incomplet — points critiques manquants';
    document.getElementById('score-chiffre').textContent = ok + '/' + total;
    document.getElementById('score-chiffre').style.color = col;
    document.getElementById('score-label').textContent = lbl;
    document.getElementById('score-detail').textContent = pct + '% validés · ' + (total - ok) + ' point(s) à corriger';
    var alerteEl = document.getElementById('cq-alerte');
    var nCrit = document.querySelectorAll('.check-manq').length;
    if (nCrit > 0) { alerteEl.textContent = nCrit + ' point(s) critique(s) manquant(s) — retourne à l\'étape 1 pour corriger.'; alerteEl.classList.add('visible'); }
    else alerteEl.classList.remove('visible');
}

/* ============================================================
   EXPORT
   ============================================================ */
function telechargerTxt() {
    var blob = new Blob([promptGenere], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob); var a = document.createElement('a');
    var nom = (v('theme') || 'prompt').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 35);
    var type = (v('type-ressource') || 'tp').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    a.href = url; a.download = 'prompt-' + _discipline.toLowerCase() + '-' + type + '-' + nom + '.txt';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}
async function copierPressePapier() {
    try { await navigator.clipboard.writeText(promptGenere); var m = document.getElementById('msg-copie'); m.classList.add('visible'); setTimeout(function () { m.classList.remove('visible'); }, 2800); }
    catch (e) { alert('Copie impossible — Ctrl+A puis Ctrl+C dans l\'aperçu.'); }
}

/* ============================================================
   LISTENERS
   ============================================================ */
function reattachListeners() {
    document.querySelectorAll('#page1 input[type="text"],#page1 select,#page1 textarea').forEach(function (el) {
        el.removeEventListener('input', mettreAJourApercu); el.removeEventListener('change', mettreAJourApercu);
        el.addEventListener('input', mettreAJourApercu); el.addEventListener('change', mettreAJourApercu);
    });
    document.querySelectorAll('#page1 input[type="checkbox"],#page1 input[type="radio"]').forEach(function (el) {
        el.removeEventListener('change', mettreAJourApercu); el.addEventListener('change', mettreAJourApercu);
    });
}

/* ============================================================
   TOGGLE THÈME CLAIR / SOMBRE
   ============================================================ */
function toggleTheme() {
    var root = document.documentElement;
    var isLight = root.getAttribute('data-theme') === 'light';
    root.setAttribute('data-theme', isLight ? '' : 'light');
    var icon = document.getElementById('theme-icon');
    var lbl = document.getElementById('theme-label');
    if (icon) icon.textContent = isLight ? '☀️' : '🌙';
    if (lbl) lbl.textContent = isLight ? 'Thème clair' : 'Thème sombre';
    try { localStorage.setItem('gen-theme', isLight ? 'dark' : 'light'); } catch (e) { }
}

/* ============================================================
   EXPORT LaTeX — GÉNÉRATEUR COMPLET
   ============================================================ */
function hex2rgb(hex) {
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return (r / 255).toFixed(3) + ',' + (g / 255).toFixed(3) + ',' + (b / 255).toFixed(3);
}

function ouvrirModalLatex() {
    var modal = document.getElementById('modal-latex');
    if (!modal) return;
    modal.classList.add('visible');
    genererLatex();
}
function fermerModalLatex() {
    var modal = document.getElementById('modal-latex');
    if (modal) modal.classList.remove('visible');
}

function genererLatex() {
    var disc = _discipline, type = v('type-ressource'), niveau = v('niveau'), theme = v('theme') || 'Thème';
    var sousTitre = v('sous-titre'), piedPage = v('pied-page') || 'DarkSATHI Li — Lycée Antoine Watteau';
    var sections = v('sections') || '', principe = v('principe-central') || '';
    var prerequis = v('prerequis') || '', objectifs = getObjectifs();
    var comps = getCompetencesSelec();
    var fmt = document.getElementById('latex-format') ? document.getElementById('latex-format').value : 'a4paper,landscape,twocolumn';
    var police = document.getElementById('latex-police') ? document.getElementById('latex-police').value : 'iwona';
    var colorTitre = document.getElementById('latex-color-titre') ? document.getElementById('latex-color-titre').value : '#D32F2F';
    var colorEncadre = document.getElementById('latex-color-encadre') ? document.getElementById('latex-color-encadre').value : '#1976D2';
    var rgbTitre = hex2rgb(colorTitre), rgbEncadre = hex2rgb(colorEncadre);
    var duree = v('duree-ressource') || '1 heure';

    var policeCmd = '';
    if (police === 'iwona') policeCmd = '\\\\usepackage[light,math]{iwona}';
    else if (police === 'libertine') policeCmd = '\\\\usepackage{libertine}\\\\usepackage[libertine]{newtxmath}';
    else policeCmd = '\\\\usepackage{lmodern}';

    var isLandscape = fmt.indexOf('landscape') !== -1;
    var isTwocol = fmt.indexOf('twocolumn') !== -1;

    /* Construire les sections LaTeX */
    var secLines = sections.split('\n').filter(function (l) { return l.trim(); });
    var secLatex = secLines.map(function (l) {
        var clean = l.replace(/&/g, '\\\\&').replace(/%/g, '\\\\%').replace(/#/g, '\\\\#').replace(/\$/g, '\\\\$').replace(/_/g, '\\\\_');
        return '  \\\\item ' + clean;
    }).join('\n');

    var objLatex = objectifs.map(function (o) {
        return '  \\\\item ' + o.replace(/&/g, '\\\\&').replace(/%/g, '\\\\%');
    }).join('\n');

    var compsLatex = comps.length > 0 ? comps.join(', ') : 'Non précisées';
    var typeLabel = type.replace(/&/g, '\\\\&');
    var themeLabel = theme.replace(/&/g, '\\\\&').replace(/%/g, '\\\\%').replace(/_/g, '\\\\_');
    var niveauLabel = niveau.replace(/&/g, '\\\\&');
    var piedLatex = piedPage.replace(/&/g, '\\\\&').replace(/%/g, '\\\\%');
    var sousTitreLatex = sousTitre ? sousTitre.replace(/&/g, '\\\\&') : '';

    var tex = '% ============================================================\n';
    tex += '% GÉNÉRATEUR NSI & MATHS — DarkSATHI Li — Lycée Antoine Watteau\n';
    tex += '% Compile avec : lualatex -synctex=1 -interaction=nonstopmode document.tex\n';
    tex += '% ============================================================\n\n';
    tex += '\\\\documentclass[11pt,' + fmt + ']{article}\n\n';
    tex += '% --- Encodage et langue ---\n';
    tex += '\\\\usepackage[T1]{fontenc}\n';
    tex += '\\\\usepackage[utf8]{inputenc}\n';
    tex += '\\\\usepackage[french]{babel}\n\n';
    tex += '% --- Police ---\n';
    tex += policeCmd + '\n\n';
    tex += '% --- Mise en page ---\n';
    var marges = isLandscape ? 'top=1.4cm,bottom=1.4cm,left=1.6cm,right=1.6cm' : 'top=2cm,bottom=2cm,left=2.5cm,right=2.5cm';
    tex += '\\\\usepackage[' + fmt + ',' + marges + ']{geometry}\n';
    tex += '\\\\setlength{\\\\columnsep}{1.2em}\n\n';
    tex += '% --- Maths ---\n';
    tex += '\\\\usepackage{amsmath,amssymb}\n\n';
    tex += '% --- Couleurs ---\n';
    tex += '\\\\usepackage[dvipsnames,table]{xcolor}\n';
    tex += '\\\\definecolor{couleurTitre}{rgb}{' + rgbTitre + '}\n';
    tex += '\\\\definecolor{couleurEncadre}{rgb}{' + rgbEncadre + '}\n';
    tex += '\\\\definecolor{couleurVert}{rgb}{0.22,0.55,0.24}\n';
    tex += '\\\\definecolor{couleurCode}{rgb}{0.94,0.95,0.96}\n';
    tex += '\\\\definecolor{couleurRose}{rgb}{0.76,0.09,0.36}\n\n';
    tex += '% --- Listes et mise en forme ---\n';
    tex += '\\\\usepackage{enumitem}\n';
    tex += '\\\\usepackage{pifont}\n';
    tex += '\\\\usepackage{mdframed}\n';
    tex += '\\\\usepackage{fancyhdr}\n\n';
    tex += '% --- Encadrés pédagogiques ---\n';
    tex += '\\\\newmdenv[linecolor=couleurEncadre,linewidth=1.5pt,topline=false,bottomline=false,\n';
    tex += '  backgroundcolor=couleurEncadre!6,innerleftmargin=8pt,innerrightmargin=8pt]{encadreCours}\n';
    tex += '\\\\newmdenv[linecolor=couleurVert,linewidth=1.5pt,topline=false,bottomline=false,\n';
    tex += '  backgroundcolor=couleurVert!5,innerleftmargin=8pt,innerrightmargin=8pt]{encadreIndice}\n';
    tex += '\\\\newmdenv[linecolor=orange,linewidth=1.5pt,topline=false,bottomline=false,\n';
    tex += '  backgroundcolor=orange!5,innerleftmargin=8pt,innerrightmargin=8pt]{encadreConseil}\n\n';
    tex += '% --- En-tête et pied de page ---\n';
    tex += '\\\\pagestyle{fancy}\\\\fancyhf{}\n';
    tex += '\\\\fancyhead[L]{\\\\small\\\\textcolor{couleurTitre}{\\\\textbf{' + typeLabel + ' — ' + niveauLabel + '}}}\n';
    tex += '\\\\fancyhead[R]{\\\\small\\\\textcolor{gray}{' + themeLabel + '}}\n';
    tex += '\\\\fancyfoot[C]{\\\\small\\\\textcolor{gray}{' + piedLatex + ' — p.~\\\\thepage}}\n';
    tex += '\\\\renewcommand{\\\\headrulewidth}{0.4pt}\n\n';
    tex += '\\\\begin{document}\n\n';
    tex += '% ---- TITRE ----\n';
    if (isTwocol) {
        tex += '\\\\twocolumn[\n';
        tex += '  \\\\begin{@twocolumnfalse}\n';
    }
    tex += '\\\\begin{center}\n';
    tex += '  {\\\\Large\\\\bfseries\\\\textcolor{couleurTitre}{' + themeLabel + '}}\\\\\\\\\n';
    if (sousTitreLatex) tex += '  {\\\\normalsize\\\\textcolor{gray}{' + sousTitreLatex + '}}\\\\\\\\\n';
    tex += '  {\\\\small ' + typeLabel + ' · ' + niveauLabel + ' · Durée : ' + duree + '}\n';
    tex += '\\\\end{center}\n';
    tex += '\\\\vspace{.4em}\\\\hrule\\\\vspace{.8em}\n\n';
    if (isTwocol) {
        tex += '  \\\\end{@twocolumnfalse}\n';
        tex += ']\n\n';
    }
    if (prerequis) {
        tex += '% ---- PRÉ-REQUIS ----\n';
        tex += '\\\\begin{encadreConseil}\n';
        tex += '\\\\textbf{\\\\textcolor{orange}{Pré-requis :}} ' + prerequis.replace(/&/g, '\\\\&').replace(/%/g, '\\\\%') + '\n';
        tex += '\\\\end{encadreConseil}\n\\\\vspace{.5em}\n\n';
    }
    if (comps.length > 0) {
        tex += '% ---- COMPÉTENCES ----\n';
        tex += '\\\\begin{encadreCours}\n';
        tex += '\\\\textbf{\\\\textcolor{couleurEncadre}{Compétences ciblées :}} ' + compsLatex.replace(/&/g, '\\\\&') + '\n';
        tex += '\\\\end{encadreCours}\n\\\\vspace{.5em}\n\n';
    }
    if (objectifs.length > 0) {
        tex += '% ---- OBJECTIFS ----\n';
        tex += "\\\\textbf{\\\\textcolor{couleurTitre}{Objectifs d'apprentissage}}\n";
        tex += '\\\\begin{itemize}[leftmargin=1em,itemsep=0pt]\n';
        tex += objLatex + '\n';
        tex += '\\\\end{itemize}\n\\\\vspace{.5em}\n\n';
    }
    if (secLines.length > 0) {
        tex += '% ---- STRUCTURE ----\n';
        tex += '\\\\textbf{\\\\textcolor{couleurTitre}{Structure de la ressource}}\n';
        tex += '\\\\begin{enumerate}[leftmargin=1.2em,itemsep=2pt]\n';
        tex += secLatex + '\n';
        tex += '\\\\end{enumerate}\n\\\\vspace{.5em}\n\n';
    }
    if (principe) {
        tex += '% ---- PRINCIPE PÉDAGOGIQUE ----\n';
        tex += '\\\\begin{encadreIndice}\n';
        tex += '\\\\textbf{\\\\textcolor{couleurVert}{Principe pédagogique :}} ';
        tex += principe.replace(/&/g, '\\\\&').replace(/%/g, '\\\\%').replace(/_/g, '\\\\_').replace(/\n/g, ' \\\\\\\\ ') + '\n';
        tex += '\\\\end{encadreIndice}\n\\\\vspace{.5em}\n\n';
    }
    tex += '% ---- ESPACE PRODUCTION ÉLÈVE ----\n';
    tex += "% (compléter ici avec les exercices générés par l'IA)\n\n";
    tex += '\\\\end{document}\n';

    /* Affichage dans la modal */
    var prev = document.getElementById('latex-preview');
    if (prev) prev.textContent = tex;
    window._latexCode = tex;
    return tex;
}

async function copierLatex() {
    var tex = window._latexCode || genererLatex();
    try {
        await navigator.clipboard.writeText(tex);
        var btn = document.getElementById('btn-copier-latex');
        if (btn) { var old = btn.textContent; btn.textContent = '✓ Copié !'; btn.style.background = '#28a745'; setTimeout(function () { btn.textContent = old; btn.style.background = ''; }, 2200); }
        afficherToast('✓ Code LaTeX copié dans le presse-papier');
    } catch (e) {
        alert('Copie impossible — sélectionne le code LaTeX et copie manuellement (Ctrl+A, Ctrl+C).');
    }
}

function telechargerLatex() {
    var tex = window._latexCode || genererLatex();
    var nom = (v('theme') || 'document').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().substring(0, 30);
    var blob = new Blob([tex], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'nsi-maths-' + nom + '.tex';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    afficherToast('✓ Fichier .tex téléchargé');
}

document.addEventListener('DOMContentLoaded', function () {
    changerDiscipline('NSI');
    if (!chargerBrouillon()) { adapterContexte(); }
    renderLibrarySlots();
    reattachListeners();
    var obs = new MutationObserver(function () { mettreAJourApercu(); });
    var objList = document.getElementById('objectifs-list');
    if (objList) obs.observe(objList, { childList: true, subtree: true });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { fermerModal(); fermerModalLatex(); } });
    /* Restaurer le thème sauvegardé */
    try {
        var savedTheme = localStorage.getItem('gen-theme');
        if (savedTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            var icon = document.getElementById('theme-icon');
            var lbl = document.getElementById('theme-label');
            if (icon) icon.textContent = '🌙';
            if (lbl) lbl.textContent = 'Thème sombre';
        }
    } catch (e) { }
});

