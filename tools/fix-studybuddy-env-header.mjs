import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const backendPath = resolve(process.cwd(), 'backend/src/index.js');
const testPath = resolve(process.cwd(), 'backend/test/api.test.js');

function read(path) {
  try { return readFileSync(path, 'utf8'); }
  catch (error) { throw new Error(`Could not read ${path}: ${error.message}`); }
}

const oldLine = '  const incoming = req.get("X-StudySpace-Environment");';
const updatedBlock = [
  '  const current = req.get("X-StudyBuddy-Environment");',
  '  const legacy = req.get("X-StudySpace-Environment");',
  '  if (current && legacy && current !== legacy) return res.status(409).json({ error: "Conflicting environment headers." });',
  '  const incoming = current || legacy;',
].join('\n');

let backend = read(backendPath);
if (backend.includes(updatedBlock)) {
  console.log('Backend header fix is already installed.');
} else if (backend.includes(oldLine)) {
  backend = backend.replace(oldLine, updatedBlock);
  writeFileSync(backendPath, backend);
  console.log('Updated backend to accept StudyBuddy and legacy StudySpace environment headers.');
} else {
  throw new Error('Expected environment header middleware was not found. File unchanged. Inspect backend/src/index.js manually.');
}

let tests = read(testPath);
const anchor = '    assert.equal(anonymous.status, 401);';
if (tests.includes('X-StudyBuddy-Environment')) {
  console.log('StudyBuddy header regression tests already present.');
} else if (tests.includes(anchor)) {
  tests = tests.replace(anchor, `${anchor}

    // A current StudyBuddy client must be able to reach auth middleware.
    const currentClient = await fetch(\`\${base}/chats\`, {
      headers: { "X-StudyBuddy-Environment": "testbed" },
    });
    assert.equal(currentClient.status, 401);

    // Mismatched and contradictory headers must remain rejected.
    const wrongCurrentClient = await fetch(\`\${base}/chats\`, {
      headers: { "X-StudyBuddy-Environment": "production" },
    });
    assert.equal(wrongCurrentClient.status, 409);

    const conflictingClient = await fetch(\`\${base}/chats\`, {
      headers: {
        "X-StudyBuddy-Environment": "testbed",
        "X-StudySpace-Environment": "production",
      },
    });
    assert.equal(conflictingClient.status, 409);`);
  writeFileSync(testPath, tests);
  console.log('Added regression tests for the current and legacy environment headers.');
} else {
  console.warn('Could not find test insertion point. Backend is fixed, but add an API test for the new header manually.');
}
