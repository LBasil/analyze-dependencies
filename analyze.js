#!/usr/bin/env node
// Analyse un dossier de code JavaScript et écrit dependencies.js : pour chaque module
// importé (require, import ... from, import()), la liste des fichiers qui l'utilisent.
//
//   node analyze.js <dossier> [--out dependencies.js]
//
// index.html lit ce fichier pour afficher le résultat.
const fs = require('fs');
const path = require('path');

const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'coverage']);
const EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.vue']);

/** Liste récursivement les fichiers de code, en ignorant node_modules, .git, dist, etc. */
function getAllSourceFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) getAllSourceFiles(fullPath, files);
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

// require('x'), import x from 'x', import 'x', export ... from 'x', import('x')
const IMPORT_PATTERNS = [
  /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g,
  /\bimport\s+(?:[\w*{}\s,$]+?\s+from\s+)?['"]([^'"]+)['"]/g,
  /\bexport\s+[\w*{}\s,$]+?\s+from\s+['"]([^'"]+)['"]/g,
  /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
];

/** Retourne les noms (nom de fichier seul, sans extension) des modules importés par un contenu. */
function extractImports(content) {
  const found = new Set();
  for (const pattern of IMPORT_PATTERNS) {
    for (const match of content.matchAll(pattern)) {
      found.add(path.basename(match[1]).replace(/\.(c|m)?[jt]sx?$|\.vue$/, ''));
    }
  }
  return [...found];
}

/** Construit { module: [fichiers qui l'importent] }. */
function buildDependencyMap(files, root) {
  const map = {};
  for (const file of files) {
    const relative = root ? path.relative(root, file) : file;
    for (const dep of extractImports(fs.readFileSync(file, 'utf-8'))) {
      (map[dep] = map[dep] || []).push(relative);
    }
  }
  return map;
}

function main(argv) {
  const outIndex = argv.indexOf('--out');
  const outPath = outIndex !== -1 ? argv[outIndex + 1] : path.join(__dirname, 'dependencies.js');
  const target = argv.find((arg, i) => !arg.startsWith('--') && (outIndex === -1 || i !== outIndex + 1));
  if (!target || !fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
    console.error('Usage : node analyze.js <dossier> [--out dependencies.js]');
    process.exit(1);
  }
  const files = getAllSourceFiles(target);
  const map = buildDependencyMap(files, target);
  fs.writeFileSync(outPath, 'var dependencies = ' + JSON.stringify(map, null, 2) + ';\n', 'utf-8');
  console.log(`${files.length} fichiers analysés, ${Object.keys(map).length} modules trouvés -> ${outPath}`);
}

if (require.main === module) main(process.argv.slice(2));

module.exports = { getAllSourceFiles, extractImports, buildDependencyMap };
