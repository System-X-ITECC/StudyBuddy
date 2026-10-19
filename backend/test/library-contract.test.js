import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root = new URL('../../', import.meta.url);
async function source(path){return readFile(new URL(path,root),'utf8');}
test('Library migration defines private RLS with per-user Storage paths and additive schema',async()=>{
  const sql=await source('supabase/migrations/002_studyspace_library.sql');
  assert.match(sql,/create table public\.library_items/i);
  assert.match(sql,/references auth\.users\(id\) on delete cascade/i);
  assert.match(sql,/alter table public\.library_items enable row level security/i);
  assert.match(sql,/user_id = \(select auth\.uid\(\)\)/i);
  assert.match(sql,/studyspace-library','studyspace-library',false/i);
  assert.match(sql,/\(storage\.foldername\(name\)\)\[1\] = \(select auth\.uid\(\)\)::text/i);
  assert.match(sql,/on delete set null \(source_chat_id\)/i);
  assert.doesNotMatch(sql,/public\s*=\s*true/i);
});
test('Frontend provides accessible Library navigation, filters, and editing controls',async()=>{
  const page=await source('frontend/src/pages/index.astro');
  for(const id of ['tab-library','library-grid','library-search','library-category','library-tag','library-edit-form','library-file-input'])
    assert.ok(page.includes(`id="${id}"`),`Missing ${id}`);
  assert.match(page,/data-tab="library"/);
  const client=await source('frontend/src/scripts/app.js');
  assert.match(client,/loadLibrary\(\)/);
  assert.match(client,/api\('\/library\/upload'/);
});
test('Generated and exported Library items are automatically saved with existing auth middleware',async()=>{
  const api=await source('backend/src/index.js');
  assert.ok(api.indexOf('app.use("/api", authenticate)') < api.indexOf('app.use("/api/library", libraryRouter)'));
  assert.match(api,/saveGeneratedItem\(req, output\.artifact/);
  assert.match(api,/saveExportItem\(req, req\.body\.artifact/);
  assert.match(api,/removeAccountLibraryFiles\(req\)/);
  const lib=await source('backend/src/library.js');
  for(const route of ["libraryRouter.get('/',","libraryRouter.get('/:id',","libraryRouter.put('/:id',","libraryRouter.post('/upload',","libraryRouter.get('/:id/download',","libraryRouter.delete('/:id',"])
    assert.ok(lib.includes(route),`Missing API: ${route}`);
});
