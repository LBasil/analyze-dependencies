# Dependency Analyzer

Outil Node.js qui parcourt un dossier de code et indique, pour chaque module importé, quels fichiers l'utilisent. Utile avant de toucher à un composant partagé : on voit tout de suite ce qui risque de régresser.

Il comprend `require()`, `import ... from`, `export ... from` et `import()`, dans des fichiers `.js`, `.mjs`, `.cjs`, `.jsx`, `.ts`, `.tsx` et `.vue`. Les dossiers `node_modules`, `.git`, `dist`, `build` et `coverage` sont ignorés.

## Utilisation

```bash
node analyze.js <dossier>             # par exemple : node analyze.js ../mon-projet/src
node analyze.js <dossier> --out autre.js
```

Le script écrit `dependencies.js`. Ouvre ensuite `index.html` dans un navigateur : on choisit un module dans la liste, on voit les fichiers qui l'importent, et un bouton copie un texte « Might have regressions on » à coller dans une description de pull request.

## Limites

L'analyse est faite avec des expressions régulières, pas avec un vrai parseur : un import écrit dans un commentaire ou une chaîne sera compté. Les modules sont identifiés par leur nom de fichier seul, donc deux fichiers de même nom dans des dossiers différents sont regroupés.

## Tests

```bash
npm test
```

## Licence

MIT, voir [LICENSE](LICENSE).
