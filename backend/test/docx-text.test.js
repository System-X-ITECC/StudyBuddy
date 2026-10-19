import test from "node:test";
import assert from "node:assert/strict";
import { zipSync, strToU8 } from "fflate";
import { readDocxText } from "../src/docx-text.js";
import { extract } from "../src/sources.js";

const xml = `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>
<w:p><w:r><w:t>Welcome to StudySpace</w:t></w:r></w:p>
<w:p><w:r><w:t>Keep</w:t></w:r><w:r><w:tab/></w:r><w:r><w:t>learning</w:t></w:r><w:r><w:br/></w:r><w:r><w:t>today</w:t></w:r></w:p>
<w:tbl><w:tr><w:tc><w:p><w:r><w:t>Topic</w:t></w:r></w:p></w:tc><w:tc><w:p><w:r><w:t>Biology</w:t></w:r></w:p></w:tc></w:tr></w:tbl>
<w:p><w:del><w:r><w:delText>deleted private note</w:delText></w:r></w:del><w:r><w:t>Final note</w:t></w:r></w:p>
</w:body></w:document>`;

function docx(parts = { "word/document.xml": xml }) {
  return Buffer.from(zipSync(Object.fromEntries(Object.entries(parts).map(([name, content]) => [name, strToU8(content)]))));
}

test("reads DOCX paragraphs, tabs, line breaks, and table cells", async () => {
  const buffer = docx();
  const text = readDocxText(buffer);
  assert.match(text, /Welcome to StudySpace/);
  assert.match(text, /Keep\tlearning\ntoday/);
  assert.match(text, /Topic\tBiology/);
  assert.match(text, /Final note/);
  assert.doesNotMatch(text, /deleted private note/);
  const throughImport = await extract(buffer, "lesson.docx");
  assert.match(throughImport, /Welcome to StudySpace/);
  assert.match(throughImport, /Topic/);
});

test("reads text from optional Word header and footer without importing embedded files", () => {
  const text = readDocxText(docx({
    "word/document.xml": xml,
    "word/header1.xml": '<w:hdr><w:p><w:r><w:t>School notes</w:t></w:r></w:p></w:hdr>',
    "word/footer1.xml": '<w:ftr><w:p><w:r><w:t>Page footer</w:t></w:r></w:p></w:ftr>',
    "word/media/payload.txt": "EXCLUDED MEDIA",
  }));
  assert.match(text, /School notes/);
  assert.match(text, /Page footer/);
  assert.doesNotMatch(text, /EXCLUDED MEDIA/);
});

test("rejects Word packages without the main document", () => {
  assert.throws(() => readDocxText(docx({ "word/header1.xml": "<w:hdr/>" })), /missing word\/document\.xml/i);
});

test("rejects declared oversized Word XML entries", () => {
  const oversized = docx({ "word/document.xml": "<w:document>" + "x".repeat(12 * 1024 * 1024 + 1024) + "</w:document>" });
  assert.throws(() => readDocxText(oversized), /too large/i);
});
