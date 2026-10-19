import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const root = JSON.parse(readFileSync('package.json', 'utf8'));
const backend = JSON.parse(readFileSync('backend/package.json', 'utf8'));
const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
assert.deepEqual(root.workspaces,['frontend','backend']);
for(const name of ['mammoth','pptxgenjs','image-size']) {
  assert.equal(backend.dependencies[name],undefined,`Unexpected backend dependency: ${name}`);
  assert.equal(root.dependencies?.[name],undefined,`Unexpected root dependency: ${name}`);
  const locked = Object.keys(lock.packages).filter(path=>path.endsWith(`/node_modules/${name}`)||path===`node_modules/${name}`);
  assert.equal(locked.length,0,`Unexpected package-lock dependency: ${name}`);
}
const idx = readFileSync('backend/src/index.js','utf8');
assert.match(idx,/FEATURE_NOT_ENABLED/);
const ui = readFileSync('frontend/src/pages/index.astro','utf8');
assert.doesNotMatch(ui,/data-export="pptx"/);
console.log('PASS: Mammoth, PptxGenJS, image-size excluded from main demo dependency tree.');
console.log('PASS: PPTX export route/UI gated. NOTE: this is not a substitute for npm audit and integration tests.');
