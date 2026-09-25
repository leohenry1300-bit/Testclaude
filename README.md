# SuperAnki Pro

Application de cartes mémoire (répétition espacée façon Anki) en **un seul fichier** : `index.html`.

- Ouvrir `index.html` dans le navigateur (double-clic), ou le déployer tel quel sur Netlify.
- Fonctionne hors ligne (icônes intégrées, aucun framework). Seules les polices et la synchro cloud utilisent Internet.

## Modifier le code

Les sources sont dans `src/` (`styles.css`, `body.html`, `app.js`, `seed-data.js` = les cartes d'origine).
Après une modification, régénérer le fichier final :

```
python3 build.py
```

---

## Éloquence — coach de prise de parole

Le dossier [`eloquence/`](eloquence/README.md) contient une application distincte : un coach de prise de parole propulsé par l'IA (web app React + API Node/SQLite). Voir son README pour la lancer.
