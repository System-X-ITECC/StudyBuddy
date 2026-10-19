import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
async function read(path){return readFile(new URL('../../'+path,import.meta.url),'utf8')}
test('demo backend cannot load a PptxGenJS runtime', async()=>{
  const pkg=JSON.parse(await read('backend/package.json'));
  assert.equal(pkg.dependencies.pptxgenjs,undefined);
  assert.equal(pkg.dependencies.mammoth,undefined);
  const exp=await read('backend/src/export.js');
  assert.doesNotMatch(exp,/from ["']pptxgenjs["']/);
  assert.match(exp,/format === "pptx"/);
  const index=await read('backend/src/index.js');
  assert.match(index,/FEATURE_NOT_ENABLED/);
});
test('PowerPoint uploads remain available and UI advertises export limitation', async()=>{
  const source=await read('backend/src/sources.js');
  assert.match(source,/ext === "pptx"/);
  const ui=await read('frontend/src/pages/index.astro');
  assert.match(ui,/Slides \(soon\)/);
  assert.doesNotMatch(ui,/data-export="pptx"/);
});
