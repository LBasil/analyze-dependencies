const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { extractImports, getAllSourceFiles, buildDependencyMap } = require('../analyze');

test('require, import, export from et import dynamique', () => {
  const code = `
    const a = require('./utils/a');
    import b from "../b.js";
    import { c } from '@/stores/c';
    import './side-effect';
    export * from './d';
    const e = await import('./e.mjs');
  `;
  assert.deepEqual(extractImports(code).sort(), ['a', 'b', 'c', 'd', 'e', 'side-effect']);
});

test('un même module importé deux fois compte une fois par fichier', () => {
  assert.deepEqual(extractImports("require('x'); require('x');"), ['x']);
});

test('ignore node_modules et trouve les fichiers .vue, .ts, .js', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'analyze-'));
  fs.mkdirSync(path.join(dir, 'src'));
  fs.mkdirSync(path.join(dir, 'node_modules', 'lib'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'src', 'main.ts'), "import { store } from './store'");
  fs.writeFileSync(path.join(dir, 'src', 'App.vue'), "<script>import { store } from './store'</script>");
  fs.writeFileSync(path.join(dir, 'node_modules', 'lib', 'index.js'), "require('ignore-me')");
  const files = getAllSourceFiles(dir);
  assert.equal(files.length, 2);
  const map = buildDependencyMap(files, dir);
  assert.deepEqual(Object.keys(map), ['store']);
  assert.deepEqual(map.store.sort(), [path.join('src', 'App.vue'), path.join('src', 'main.ts')]);
});

test('la ligne de commande accepte le dossier sans --out', () => {
  const { spawnSync } = require('node:child_process');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'analyze-cli-'));
  fs.writeFileSync(path.join(dir, 'a.js'), "require('./b')");
  const out = path.join(dir, 'out.js');
  const run = spawnSync('node', [path.join(__dirname, '..', 'analyze.js'), dir, '--out', out]);
  assert.equal(run.status, 0);
  assert.match(fs.readFileSync(out, 'utf8'), /"b"/);
  const noOut = spawnSync('node', [path.join(__dirname, '..', 'analyze.js'), dir], { cwd: dir });
  assert.equal(noOut.status, 0);
});
