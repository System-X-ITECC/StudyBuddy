import test from 'node:test';
import assert from 'node:assert/strict';
import { SINGAPORE_RESOURCES, selectResources } from '../src/resource-hub.js';
import { readFileSync } from 'node:fs';

test('official Singapore education resource hub covers MOE, ITE, poly and work skills',()=>{
  const categories = SINGAPORE_RESOURCES.map(r=>r.category).join(' ');
  for(const word of ['MOE','ITE','Polytechnic','Work Skills']) assert.ok(categories.includes(word));
  for(const r of SINGAPORE_RESOURCES) {
    const u = new URL(r.url);
    assert.equal(u.protocol, 'https:');
    assert.ok(r.name && r.publisher && r.description);
  }
});
test('resource recommendations come from curated entries, not fabricated citations',()=>{
  const items = selectResources('How do I study cybersecurity at ITE polytechnic?');
  assert.ok(items.length > 0 && items.length <= 5);
  assert.ok(items.some(item=>/ITE|Polytechnic/.test(item.category)));
  assert.ok(items.every(item => item.access.includes('not been verified')));
});
test('chat requests no longer require uploaded sources',()=>{
  const ai=readFileSync(new URL('../src/ai.js',import.meta.url),'utf8');
  const client=readFileSync(new URL('../../frontend/src/scripts/app.js',import.meta.url),'utf8');
  assert.match(ai,/sources.length \? retrieve\(/);
  assert.doesNotMatch(ai,/Add at least one source to this chat first/);
  assert.doesNotMatch(client,/Add a source first so the answer/);
});
test('studios keep private authentication and export permissions on server',()=>{
  const html=readFileSync(new URL('../../frontend/src/pages/index.astro',import.meta.url),'utf8');
  for(const id of ['tab-word','tab-slides','tab-flashcards','folder-create','display-name','custom-prompt']) assert.match(html,new RegExp(`id="${id}"`));
  const backend=readFileSync(new URL('../src/index.js',import.meta.url),'utf8');
  assert.match(backend,/app.use\("\/api", authenticate\)/);
  assert.match(backend,/mountOrganisationRoutes\(app/);
});

test('profile changes preserve older clients and clearing AI memory keeps chat folders',()=>{
  const api=readFileSync(new URL('../src/index.js',import.meta.url),'utf8');
  assert.match(api,/displayName: z\.string\(\)\.trim\(\)\.max\(60\)\.optional\(\)/);
  assert.match(api,/customPrompt: z\.string\(\)\.trim\(\)\.max\(1600\)\.optional\(\)/);
  assert.match(api,/chatFolders: folders,\s*chatFolderAssignments: assignments/);
});
test('mobile tools have dedicated navigation and preference fields remain inside existing settings',()=>{
  const html=readFileSync(new URL('../../frontend/src/pages/index.astro',import.meta.url),'utf8');
  for (const kind of ['word','slides','flashcards']) assert.match(html,new RegExp(`class="studio-quicklink" data-tab="${kind}"`));
  assert.equal((html.match(/id="settings-dialog"/g)||[]).length,1);
  assert.equal((html.match(/id="settings-form"/g)||[]).length,1);
});
