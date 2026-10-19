/** Bounded XLSX text extraction. Never evaluates formulas or loads remote workbook content. */
import { unzipSync } from 'fflate';
import { XMLParser } from 'fast-xml-parser';

const MAX_SHEETS = 60;
const MAX_ROWS = 3000;
const MAX_TEXT = 240000;
const parser = new XMLParser({ ignoreAttributes: false, processEntities: false, ignoreDeclaration: true });
const asArray = value => value == null ? [] : Array.isArray(value) ? value : [value];
const textValue = value => {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(textValue).join('');
  if (value && typeof value === 'object') return value['#text'] == null ? '' : textValue(value['#text']);
  return '';
};
const joinInline = value => asArray(value).map(run => {
  if (run?.t !== undefined) return textValue(run.t);
  return asArray(run?.r).map(part => textValue(part?.t)).join('');
}).join('');
const readXml = (archive, path) => {
  const bytes = archive[path];
  if (!bytes) return null;
  if (bytes.length > 12 * 1024 * 1024) throw new Error('Spreadsheet XML part is too large.');
  return parser.parse(Buffer.from(bytes).toString('utf8'));
};
function resolveSheetName(path) {
  // Relationship targets are package-relative, never filesystem paths.
  if (typeof path !== 'string' || path.includes('://') || path.includes('\\')) return null;
  const normalized = path.replace(/^\/+/, '');
  const relative = normalized.startsWith('xl/') ? normalized : `xl/${normalized}`;
  return /^xl\/worksheets\/[^/]+\.xml$/.test(relative) ? relative : null;
}
export function readXlsxText(buffer) {
  const archive = unzipSync(buffer);
  const workbook = readXml(archive, 'xl/workbook.xml')?.workbook;
  const relationships = readXml(archive, 'xl/_rels/workbook.xml.rels')?.Relationships;
  if (!workbook || !relationships) throw new Error('Invalid XLSX workbook structure.');
  const relationById = new Map(asArray(relationships.Relationship)
    .filter(rel => /\/worksheet$/.test(rel?.['@_Type'] || ''))
    .map(rel => [rel['@_Id'], resolveSheetName(rel['@_Target'])]));
  const shared = asArray(readXml(archive, 'xl/sharedStrings.xml')?.sst?.si)
    .slice(0, 150000).map(joinInline);
  const sheets = asArray(workbook.sheets?.sheet).slice(0, MAX_SHEETS);
  const lines = [];
  let characters = 0;
  const push = line => {
    if (characters >= MAX_TEXT) return false;
    const part = String(line).slice(0, MAX_TEXT - characters);
    lines.push(part);
    characters += part.length + 1;
    return characters < MAX_TEXT;
  };
  for (const sheet of sheets) {
    const name = String(sheet['@_name'] || 'Sheet').slice(0, 100);
    const path = relationById.get(sheet['@_r:id']);
    if (!path) continue;
    const xml = readXml(archive, path)?.worksheet;
    if (!xml) continue;
    if (!push(`Worksheet: ${name}`)) break;
    const rows = asArray(xml.sheetData?.row).slice(0, MAX_ROWS);
    for (const row of rows) {
      const cells = asArray(row.c).slice(0, 256).map(cell => {
        const type = cell['@_t'];
        if (type === 's') {
          const index = Number(textValue(cell.v));
          return Number.isSafeInteger(index) && index >= 0 ? (shared[index] || '') : '';
        }
        if (type === 'inlineStr') return joinInline(cell.is);
        if (type === 'e') return ''; // Exclude formula error values.
        // Cached scalar value only; formula content is never executed.
        return textValue(cell.v ?? '');
      });
      if (!push(cells.join(' | '))) break;
    }
    if (characters >= MAX_TEXT) break;
  }
  return lines.join('\n');
}
