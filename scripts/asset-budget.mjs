/** Build asset sanity check; metrics still require real mobile/desktop testing. */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
const root = 'frontend/dist';
if (!existsSync(`${root}/index.html`)) throw new Error('Run the Astro build first.');
function walk(directory) {
  return readdirSync(directory).flatMap(name => {
    const path = join(directory,name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}
const files = walk(root);
const js = files.filter(file=>file.endsWith('.js'));
const css = files.filter(file=>file.endsWith('.css'));
const results = [...js,...css].map(file=>({name:file, bytes:readFileSync(file).byteLength, gzip:gzipSync(readFileSync(file)).byteLength}));
const gzipTotal = results.reduce((size,item)=>size+item.gzip,0);
for (const row of results) console.log(`${row.name}: ${(row.gzip/1024).toFixed(1)} KiB gzip`);
console.log(`Total JS/CSS transfer (gzip estimate): ${(gzipTotal/1024).toFixed(1)} KiB`);
if (gzipTotal > 600 * 1024) throw new Error('Production asset budget exceeded 600 KiB gzip.');
if (results.some(row => row.gzip > 300*1024)) throw new Error('Single frontend asset exceeds 300 KiB gzip.');
