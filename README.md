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

## Fonctions principales

SM-2 et FSRS, options par paquet, sous-paquets, textes à trous, cartes inversées liées, drapeaux / marquage / suspension / enfouissement,
navigateur avec recherche à la Anki et édition en masse, annuler / rétablir, révisions personnalisées, statistiques,
synchronisation Supabase fusionnée carte par carte (chiffrement optionnel), sauvegardes automatiques, export / import TXT.

## Bibliothèque de paquets

Le contenu prêt à apprendre est dans `content/*.txt` (anglais / TOEIC, banque, assurance, finance, BUT TC).
Format : `question ;; réponse ;; indice` ou `C: texte avec {{c1::trou}} ;; infos`. `python3 build.py` le compile dans `index.html`.
