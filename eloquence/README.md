# Éloquence

Coach personnel de prise de parole propulsé par l'IA. Application **personnelle, gratuite et sans aucune limite** : pas d'abonnement, pas de paywall, pas de fonctionnalité verrouillée.

**Parler → Analyser → Comprendre → Recommencer → Progresser**

## Démarrer

Prérequis : Node.js 22.13 ou plus récent (SQLite est intégré à Node).

```bash
cd eloquence
npm install
npm run dev          # API sur :8787 + web app sur http://localhost:5173
```

En production :

```bash
npm run build        # construit la web app (apps/web/dist)
npm start            # l'API sert aussi la web app sur http://localhost:8787
```

Configuration : copier `.env.example` en `.env` et renseigner uniquement ce dont on a besoin.
**Aucune clé n'est obligatoire** : sans clé, tout fonctionne avec la transcription du navigateur et le moteur d'analyse intégré.

| Variable | Effet |
| --- | --- |
| `ANTHROPIC_API_KEY` | Le feedback après chaque exercice, le coach, la « réponse modèle » et les reformulations les plus fines sont générés par Claude (`ANTHROPIC_MODEL`, par défaut `claude-opus-5`). Le coach incarne alors n'importe quelle simulation de rôle librement, au lieu de suivre un script fixe. |
| `OPENAI_API_KEY` | L'audio est retranscrit côté serveur par Whisper (plus précis, garde les « euh »). |
| `DATABASE_URL` | Remplace le fichier SQLite par une base Postgres (ex. Supabase gratuit) — voir « Déploiement gratuit » ci-dessous. |
| `JWT_SECRET` | À définir explicitement si le disque du serveur n'est pas persistant (sinon tout le monde est déconnecté à chaque redémarrage). |

## Déploiement gratuit, sans perdre les données

Par défaut, l'API stocke tout dans un fichier SQLite local (`DATA_DIR`). C'est parfait en local, mais certains hébergeurs gratuits (comme le plan gratuit de Render) ont un **disque non persistant** : le fichier disparaît à chaque redémarrage/redéploiement.

Solution gratuite : héberger la base sur **Supabase** (Postgres gratuit et persistant) et laisser Render (ou un autre hébergeur gratuit) exécuter uniquement le serveur, sans état.

1. Créer un projet sur [supabase.com](https://supabase.com) (gratuit).
2. Dans *Project Settings → Database → Connection string*, copier l'URI (mode « Session pooler » recommandé), et y mettre le mot de passe du projet.
3. Sur Render (ou l'hébergeur choisi), ajouter deux variables d'environnement au service :
   - `DATABASE_URL` = l'URI Supabase copiée à l'étape 2.
   - `JWT_SECRET` = une chaîne aléatoire longue (sinon les connexions sautent à chaque redémarrage).
4. Redéployer. Le serveur détecte `DATABASE_URL`, crée les tables automatiquement au démarrage, et toutes les données (comptes, sessions, coach, programmes...) survivent désormais aux redémarrages et sont accessibles depuis n'importe quel appareil connecté au même compte.

Sans `DATABASE_URL`, rien ne change : le serveur continue d'utiliser SQLite comme avant.

### Et les enregistrements audio ?

`DATABASE_URL` ne couvre que les données (comptes, sessions, transcriptions, scores) : les fichiers audio eux-mêmes restent, par défaut, écrits sur le disque du serveur — donc perdus au redémarrage sur un hébergeur sans disque persistant, même une fois `DATABASE_URL` configuré.

Pour que les enregistrements survivent aussi, ajouter un bucket S3 (Cloudflare R2 a un vrai plan gratuit : 10 Go, sans frais de sortie) :

1. Créer un bucket sur [dash.cloudflare.com](https://dash.cloudflare.com) → R2, puis un jeton d'accès API (Account API Token) avec les droits lecture/écriture sur ce bucket.
2. Sur Render, ajouter : `S3_BUCKET`, `S3_ENDPOINT` (l'URL R2 du compte), `S3_REGION=auto`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`.
3. Redéployer. Le serveur détecte ces variables et bascule automatiquement du disque local vers S3 pour les nouveaux enregistrements.

Sans ces variables, rien ne change : le serveur continue d'écrire sur le disque local comme avant.

Tests : `npm test` (35 tests — moteur d'analyse, API de bout en bout). Vérification des types : `npm run typecheck`.

## Ce que fait l'app

- **Onboarding** multi-objectifs (on peut en choisir plusieurs simultanément parmi 16), niveau, fréquence, prénom, premier test oral gratuit — **aucun formulaire de compte** : le profil est créé automatiquement et silencieusement (pas d'e-mail, pas de mot de passe), sauvegardé sur le serveur dès qu'il est joignable.
- **Diagnostic initial** en 8 étapes (présentation, improvisation, argumentation, explication, question difficile, storytelling, entretien, culture générale) → bilan détaillé par compétence.
- **Mode démo** : un profil complet généré par le vrai moteur d'analyse (17 sessions sur 30 jours, série, programme en cours, badges).
- **Accueil** : session du jour, objectifs hebdomadaires calculés (pas hand-set), session rapide 5/15/30 min, détection et relance sur une difficulté qui revient souvent, programme en cours, scores par compétence.
- **S'entraîner** — hub central :
  - **Exercices** : 10 catégories de situations réalistes (improvisation, entretien, pitch, présentation, débat, communication pro, prononciation, culture générale, storytelling, libre), chacune avec **au moins 100 prompts réellement distincts** (sauf l'entraînement libre, volontairement sans prompt) — près de 1 000 au total, aucun titre ni consigne répété deux fois dans une même catégorie.
  - **Jeux** : plus de 50 mini-jeux dans 12 familles (anti-parasites, rythme, diction, improvisation, confiance, argumentation, vocabulaire, persuasion, storytelling, structure, mémoire, écoute), avec de vraies contraintes vérifiées (mot interdit, zéro « euh », débit cible, mots imposés, pas de répétition).
  - **Sujets** : bibliothèque de 400+ sujets nommés (histoire, philosophie, géographie, économie, entreprise, technologie, sciences, société, institutions — traitées de façon strictement neutre —, arts, quotidien), combinés à 6 gabarits de question → plus de 2 500 formulations distinctes générées à la volée, jamais répétitives.
  - **Simulations** : 23 mises en situation avec un personnage qui réagit (recruteur, banque, commercial, client difficile, négociation salariale, vente, réunion, jury, networking, situation conflictuelle, manager, presse, service client, colocataire, professeur, investisseur, administration, rencontre, concours, fournisseur, famille…).
  - **Bibliothèque pédagogique** : mini-cours (Éloquence, Argumentation, Communication, Présentation, Entretien, Vocabulaire), chacun suivi d'un exercice.
- **Analyse** : 11 dimensions mesurées honnêtement (clarté, fluidité, confiance, structure, vocabulaire, débit, mots parasites, **argumentation, grammaire, persuasion, concision**), transcription surlignée, détection de tournures fautives à l'oral, marqueurs d'argumentation (exemples, contre-arguments). Le feedback suit toujours le même contrat : **ce que tu fais bien** (≤3 points) / **ce qui te pénalise** (≤3 points) / **un exemple réel tiré de ta transcription** / **pourquoi c'est un problème** / **comment corriger** (nommant PREP, STAR, le modèle de Toulmin ou la Story Spine quand c'est pertinent) / **un objectif chiffré**. Rien n'est jamais inventé : une citation générée par l'IA est vérifiée contre la vraie transcription avant affichage. Les longs silences sont mesurés directement depuis le micro et pèsent lourd sur le score, pas seulement sur un compteur de pauses.
- **Pertinence du contenu (avec `ANTHROPIC_API_KEY`)** : en plus des 11 dimensions de forme, Claude juge si la réponse a vraiment du sens et répond à la consigne — une prestation bien articulée mais hors-sujet ou incohérente est notée en conséquence. Ce score ne peut que faire baisser le score global mesuré, jamais l'augmenter. Sans clé IA, cette dimension n'apparaît simplement pas : elle n'est jamais devinée par le moteur heuristique.
- **Réponse modèle** et **Améliorer ma réponse** (clair / concis / pro / persuasif) — la version mécanique (toujours disponible, même hors ligne) retravaille tes propres mots sans jamais inventer de contenu ; la version IA va plus loin.
- **Avant/après** automatique quand on refait un exercice.
- **Progression** : courbes 7 j / 30 j / 3 mois, **profil de compétences par catégorie** (ta moyenne réelle en entretien, en débat, etc. — pas un score inventé), niveaux (Découverte → Maîtrise), 40 badges honnêtes.
- **Programmes** : 11 parcours nommés prêts à l'emploi (14 à 30 jours) + génération personnalisée à partir de tes objectifs, de ton diagnostic et de tes difficultés récurrentes.
- **Coach** : conversation illimitée, personnalisée avec tes résultats, capable d'incarner n'importe laquelle des 10 simulations, jamais de compliment vide — un vrai avis, honnête, toujours suivi d'une action.
- **Historique** avec recherche plein texte dans tes transcriptions.
- **Profil** : édition multi-objectifs, thème clair/sombre/auto, export/suppression des données, tout est gratuit — aucune section abonnement.

## Recherche & sources

Les techniques citées par le coach ne sont pas inventées :

- **PREP** (Point-Raison-Exemple-Point) et **STAR** (Situation-Tâche-Action-Résultat) — cadres classiques de prise de parole impromptue et d'entretien.
- **Modèle de Toulmin** (thèse, preuve, garantie, réfutation) — *The Uses of Argument*, Stephen Toulmin, 1958 — pour structurer et réfuter un argument.
- **Story Spine** (structure Pixar, Kenn Adams, 1991) — pour le storytelling.
- **Grille Toastmasters** (structure du contenu, clarté de la livraison, variété vocale, non-verbal) — confirme les dimensions mesurées et le format du feedback (constat précis + recommandation actionnable).
- **Réduction des mots parasites par la pratique délibérée** : les techniques de coaching vocal (« one-minute drill » sans tic, remplacement du tic par un silence) montrent un progrès net en 2 à 4 semaines de pratique régulière — d'où le rythme des défis hebdomadaires et la détection de difficulté récurrente.

## Architecture

```
eloquence/
├── packages/core     Moteur partagé (TypeScript pur, sans dépendance)
│   ├── analysis.ts    11 dimensions, grammaire, argumentation, transcription annotée, contraintes de jeu
│   ├── feedback.ts     Contrat forces/faiblesses/citation/pourquoi/comment corriger/objectif
│   ├── topics.ts       Bibliothèque de sujets + génération combinatoire
│   ├── games.ts         50+ mini-jeux + moteur de contraintes
│   ├── simulations.ts   10 personas de mise en situation
│   ├── library.ts        mini-cours pédagogiques
│   ├── diagnostic.ts      8 étapes + bilan initial
│   ├── coaching.ts         Objectifs hebdomadaires, session rapide, réécriture heuristique, recherche
│   ├── progress.ts     Séries, XP, niveaux, 40 badges, profil par catégorie, difficulté récurrente
│   ├── programs.ts     11 programmes nommés + génération personnalisée multi-objectifs
│   └── coach.ts        Coach à base de règles (repli hors ligne), généralise toutes les simulations
├── apps/server        API Express + SQLite (node:sqlite) — aucune route de facturation
│   └── providers/     STT et IA interchangeables (heuristique ↔ Claude)
└── apps/web           React + Vite, mobile d'abord, PWA — aucun paywall dans l'interface
```

Le **même moteur d'analyse** tourne dans le navigateur (invité, démo, hors ligne) et sur le serveur (compte). Les jeux, sujets et étapes de diagnostic sont générés à la volée et envoyés au serveur avec la session : rien n'est limité au contenu écrit à la main dans le catalogue statique. Si un fournisseur d'IA distant échoue, l'API retombe sur le moteur local : l'utilisateur obtient toujours son analyse.

## Limites connues

- **Le débit et les pauses** ne sont mesurés qu'à l'oral (micro), pas en mode texte.
- **La transcription du navigateur** (Chrome/Edge/Safari, pas Firefox) gomme parfois les hésitations ; Whisper (`OPENAI_API_KEY`) est plus fidèle.
- **La grammaire** est détectée par une liste de tournures fautives courantes à l'oral, pas par un analyseur syntaxique complet.
- **« Actualité »** (sujets d'actualité récente, avec distinction faits/opinions) n'est pas branchée : ça demanderait un accès fiable à une source d'actualité avec attribution, que l'app n'a pas par défaut. L'architecture (`TopicCategory`, génération combinatoire) est prête à l'accueillir.
- **Les scores restent des indicateurs d'entraînement**, pas une mesure scientifique exacte, et ne prétendent jamais lire un état psychologique : uniquement des éléments observables dans la voix ou le texte.
- **Les rappels quotidiens** sont des notifications du navigateur, actives uniquement quand l'app est ouverte.
