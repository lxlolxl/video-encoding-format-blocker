import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const extensionDir = path.join(root, 'extension');
const manifestPath = path.join(extensionDir, 'manifest.json');

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(manifestPath)) fail('extension/manifest.json not found');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (manifest.manifest_version !== 3) fail('manifest_version must be 3');
if (!manifest.name) fail('manifest.name missing');
if (!manifest.version) fail('manifest.version missing');

const jsFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    if (entry.isFile() && entry.name.endsWith('.js')) jsFiles.push(full);
  }
}
walk(extensionDir);
for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'pipe', encoding: 'utf8' });
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    fail(`JavaScript syntax check failed: ${path.relative(root, file)}`);
  }
}
console.log(`OK: checked ${jsFiles.length} JavaScript files and manifest.json`);
