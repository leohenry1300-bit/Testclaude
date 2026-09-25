# Éloquence

Coach de prise de parole propulsé par l'IA. On parle, l'app analyse, on comprend, on recommence, on progresse.

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
| `ANTHROPIC_API_KEY` | Le feedback après chaque exercice et le coach sont rédigés par Claude (`ANTHROPIC_MODEL`, par défaut `claude-opus-5`). |
| `OPENAI_API_KEY` | L'audio est retranscrit côté serveur par Whisper (plus précis, garde les « euh »). |
| `GOOGLE_CLIENT_ID` | Active « Continuer avec Google ». |
| `RESEND_API_KEY` | Envoie réellement les e-mails de réinitialisation (sinon : console du serveur, et lien affiché à l'écran en développement). |

Tests : `npm test` (moteur d'analyse + API de bout en bout). Vérification des types : `npm run typecheck`.

## Parcours

- **Onboarding** en 6 écrans (accroche, objectif, niveau, fréquence, prénom, premier test oral gratuit), sans compte.
- **Mode démo** : un profil complet (17 sessions sur 30 jours, série de 6 jours, programme en cours, badges) généré par le vrai moteur d'analyse.
- **Accueil** : session du jour (orientée vers ton point faible), série, temps de la semaine, programme, scores par compétence.
- **S'entraîner** : 7 catégories, 32 exercices (improvisation, entretien, pitch, présentation, débat, communication pro, prononciation).
- **Exercice** : consigne, structure suggérée, compte à rebours, gros bouton micro, halo et onde réactifs à la voix, transcription en direct, pause, arrêt, arrêt auto au temps imparti. Repli « répondre par écrit » si pas de micro.
- **Analyse** : score global et 7 compétences, transcription surlignée (mots parasites, répétitions, formules floues, phrases trop longues, longues pauses), points à améliorer, retour du coach en 4 temps (ce que tu fais bien / à améliorer / conseil du jour / à refaire), réécoute de l'audio, analyse avancée (débit seconde par seconde, diversité lexicale…).
- **Avant / après** automatique quand on refait un exercice (+points, écarts par compétence, variation des mots parasites en %).
- **Progression** : courbe 7 j / 30 j / 3 mois, temps parlé, sessions, mots, moyenne, meilleur score, séries, activité de la semaine, niveaux (Découverte → Éloquence), badges.
- **Programme 14 jours** construit à partir d'un objectif écrit, coché automatiquement au fil des sessions.
- **Coach IA** : conversation personnalisée avec tes résultats, exercices lançables en un tap, simulation d'entretien question par question.
- **Profil** : photo, objectif, niveau, rappel quotidien, durée des improvisations, langue de reconnaissance vocale, thème clair/sombre/auto, conservation de l'audio, export et suppression des données, abonnement.
- **Gratuit / Premium** : 3 exercices et 5 messages au coach par jour, historique de 7 jours, analyse avancée et programmes réservés à Premium. Paywall en feuille, non bloquant.

## Architecture

```
eloquence/
├── packages/core     Moteur partagé (TypeScript pur, sans dépendance)
│   ├── analysis.ts   Mots parasites, répétitions, pauses, débit, scores, transcription annotée
│   ├── feedback.ts   Retour « coach » construit à partir des mesures
│   ├── progress.ts   Séries, XP, niveaux, badges, comparaison avant/après, statistiques
│   ├── pipeline.ts   Règles d'accès (gratuit/premium) et création d'une session récompensée
│   ├── programs.ts   Programmes de 14 jours
│   ├── coach.ts      Coach à base de règles (repli hors ligne) + contexte pour le LLM
│   └── demo.ts       Compte de démonstration
├── apps/server       API Express + SQLite (node:sqlite)
│   ├── auth.ts       Mots de passe scrypt, jetons HS256, liens audio signés, limitation de débit
│   ├── db.ts         Schéma et requêtes (users, sessions, analyses, progress, badges, programs, coach_messages, password_resets)
│   ├── app.ts        Routes REST
│   └── providers/    Fournisseurs interchangeables
│       ├── stt.ts        ClientTranscriptStt | OpenAiWhisperStt
│       ├── llm.ts        HeuristicLlm | AnthropicLlm (sorties structurées)
│       └── services.ts   Stockage audio (disque), e-mails (console | Resend), vérification Google
└── apps/web          React + Vite, mobile d'abord, PWA
    ├── lib/recorder.ts   Micro : MediaRecorder + Web Audio (volume, silences) + Web Speech API
    ├── lib/backend.ts    Même interface pour l'API (compte) et l'appareil (invité, démo)
    └── lib/store.tsx     État de l'app, authentification, thème, paywall
```

Le **même moteur d'analyse** tourne dans le navigateur (invité, démo, hors ligne) et sur le serveur (compte). Les fournisseurs d'IA sont derrière des interfaces (`SttProvider`, `LlmProvider`, `AudioStorage`, `Mailer`) : en ajouter un revient à écrire une classe et à la brancher dans `apps/server/src/index.ts`. Si un fournisseur distant échoue, l'API retombe sur le moteur local : l'utilisateur obtient toujours son analyse.

Données : un invité est stocké dans le navigateur (localStorage + IndexedDB pour l'audio). À la création de compte, ses sessions, badges, programme et conversation sont importés.

### API

| Méthode | Route | Rôle |
| --- | --- | --- |
| POST | `/api/auth/signup` · `/login` · `/google` · `/forgot` · `/reset` | Authentification |
| GET | `/api/state` | Profil, sessions, programme, coach, badges |
| PATCH / DELETE | `/api/me` | Modifier le profil / supprimer le compte |
| GET | `/api/me/export` | Export JSON des données |
| POST | `/api/sessions` | Multipart : `audio` + `meta` (exercice, capture) → session analysée, XP, badges, comparaison |
| DELETE | `/api/sessions/:id` | Supprimer une session et son audio |
| GET | `/api/audio/:key` | Lecture d'un enregistrement (URL signée, expirante) |
| POST / DELETE | `/api/program` | Créer / supprimer le programme |
| POST / DELETE | `/api/coach` | Message au coach / effacer la conversation |
| POST | `/api/billing/checkout` · `/cancel` | Abonnement |

## Limites connues

- **Paiement** : le fournisseur de facturation fourni est un fournisseur de développement qui active directement un essai Premium de 7 jours. Brancher Stripe ou RevenueCat se fait dans les routes `/api/billing/*` (création de session de paiement + webhook).
- **Transcription dans le navigateur** : la Web Speech API est disponible dans Chrome, Edge et Safari récents, pas dans Firefox. Sans elle et sans `OPENAI_API_KEY`, l'app propose de répondre par écrit (le débit n'est alors pas mesuré). Elle a tendance à gommer les « euh » : Whisper est plus fidèle.
- **Rappels** : notifications du navigateur, déclenchées quand l'app est ouverte (pas de push serveur).
- Les scores heuristiques sont calibrés pour le français parlé spontané ; ils mesurent la forme, le LLM (s'il est configuré) commente aussi le fond.
