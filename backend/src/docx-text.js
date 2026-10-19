// StudySpace DOCX text reader. DOCX is an OPC/ZIP container, not executable code.
// This reader extracts only known Word text-bearing XML parts; it never renders
// HTML, evaluates macros, loads remote relationships, or executes field commands.
import { unzipSync } from "fflate";
import { XMLParser } from "fast-xml-parser";

const ALLOWED_PART = /^word\/(?:document\.xml|(?:header|footer)\d+\.xml|(?:footnotes|endnotes)\.xml)$/;
const MAX_SELECTED_XML = 24 * 1024 * 1024;
const MAX_SINGLE_XML = 12 * 1024 * 1024;

function plainText(nodes) {
  // fast-xml-parser's preserveOrder mode represents runs as nested node arrays.
  if (Array.isArray(nodes)) return nodes.map(plainText).join("");
  if (nodes === null || typeof nodes !== "object") return String(nodes ?? "");
  return Object.entries(nodes)
    .filter(([key]) => key !== ":@")
    .map(([key, value]) => key === "#text" ? String(value ?? "") : plainText(value))
    .join("");
}

function readPart(xml) {
  const parser = new XMLParser({
    preserveOrder: true,
    ignoreAttributes: true,
    processEntities: false,
    trimValues: false,
  });
  const nodes = parser.parse(xml);
  const output = [];

  function walk(value) {
    if (!Array.isArray(value)) return;
    for (const node of value) {
      if (!node || typeof node !== "object") continue;
      for (const [tag, children] of Object.entries(node)) {
        if (tag === ":@" || tag === "#text") continue;
        if (["w:del", "w:delText", "w:instrText", "w:fldChar", "w:commentReference"].includes(tag)) {
          // Deleted text and Word field instructions are not visible document prose.
          continue;
        }
        if (tag === "w:t") {
          output.push(plainText(children));
        } else if (tag === "w:tab" || tag === "w:ptab") {
          output.push("\t");
        } else if (tag === "w:br" || tag === "w:cr") {
          output.push("\n");
        } else if (tag === "w:noBreakHyphen") {
          output.push("-");
        } else if (tag === "w:tc") {
          const start = output.length;
          walk(children);
          // Keep each table cell readable while preserving its cell boundaries.
          const cell = output.splice(start).join("").replace(/\s*\n\s*/g, " ").trim();
          output.push(cell, "\t");
        } else if (tag === "w:tr") {
          const start = output.length;
          walk(children);
          const row = output.splice(start).join("").replace(/\t+$/, "").trim();
          if (row) output.push(row, "\n");
        } else if (tag === "w:p") {
          walk(children);
          output.push("\n");
        } else {
          walk(children);
        }
      }
    }
  }

  walk(nodes);
  return output.join("").replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Read the visible text in a DOCX document, its headers/footers and notes.
 * Called only after sources.js has inspected the archive's declared expansion
 * budget. We add a second, tighter budget for actual XML extraction.
 */
export function readDocxText(buffer) {
  let total = 0;
  let tooLarge = false;
  const parts = unzipSync(buffer, {
    filter(entry) {
      if (!ALLOWED_PART.test(entry.name)) return false;
      const size = entry.originalSize;
      if (!Number.isFinite(size) || size > MAX_SINGLE_XML || total + size > MAX_SELECTED_XML) {
        tooLarge = true;
        return false;
      }
      total += size;
      return true;
    },
  });
  if (tooLarge) throw new Error("Word document text is too large to process safely.");
  if (!parts["word/document.xml"]) throw new Error("This Word file is missing word/document.xml.");

  const names = Object.keys(parts).filter((name) => name !== "word/document.xml").sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  const chunks = [readPart(Buffer.from(parts["word/document.xml"]).toString("utf8"))];
  for (const name of names) {
    const section = readPart(Buffer.from(parts[name]).toString("utf8"));
    if (section) chunks.push(`${name.split("/").pop().replace(/\.xml$/, "")}:\n${section}`);
  }
  return chunks.filter(Boolean).join("\n\n");
}
