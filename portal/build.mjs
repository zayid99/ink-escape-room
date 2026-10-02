// Builds the portal version and zips it: node portal/build.mjs
// Output: portal/build/marginalia/ (the folder to upload) and portal/marginalia-portal.zip.
import { build } from 'vite';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = join(here, 'build', 'marginalia');
const zip = join(here, 'marginalia-portal.zip');

await build({ configFile: join(here, 'vite.config.js'), logLevel: 'warn' });

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else files.push(p);
  }
})(out);
const bytes = files.reduce((n, f) => n + statSync(f).size, 0);

// Portal limits and rules: index.html at the top, < 1,000 files, < 50 MB, nothing external.
const fail = (msg) => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};
if (!files.includes(join(out, 'index.html'))) fail('index.html is not at the top level');
if (files.length >= 1000) fail(`${files.length} files (limit 1,000)`);
if (bytes >= 50 * 1024 * 1024) fail(`${bytes} bytes (limit 50 MB)`);
for (const f of files) {
  if (!/\.(html|js|css)$/.test(f)) continue;
  const text = readFileSync(f, 'utf8');
  const ext = text.match(/https?:\/\/(?!www\.w3\.org\/)[^\s"'`)]+/g);
  if (ext) fail(`${relative(out, f)} references external URLs: ${[...new Set(ext)].join(', ')}`);
  if (/(src|href)=["']\//.test(text)) fail(`${relative(out, f)} has a root-absolute path`);
}

rmSync(zip, { force: true });
execFileSync('zip', ['-r', '-X', '-9', '-q', zip, '.'], { cwd: out });
console.log(`✓ ${files.length} files, ${(bytes / 1024).toFixed(0)} KB → ${relative(process.cwd(), zip)} (${(statSync(zip).size / 1024).toFixed(0)} KB)`);
