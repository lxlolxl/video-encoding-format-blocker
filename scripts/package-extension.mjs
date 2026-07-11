import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const extensionDir = path.join(root, 'extension');
const manifest = JSON.parse(fs.readFileSync(path.join(extensionDir, 'manifest.json'), 'utf8'));
const distDir = path.join(root, 'dist');
const out = path.join(distDir, `video-encoding-format-blocker-${manifest.version}.zip`);

fs.mkdirSync(distDir, { recursive: true });
if (fs.existsSync(out)) fs.rmSync(out);
const result = spawnSync('zip', ['-r', out, '.'], { cwd: extensionDir, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status || 1);
console.log(`Created ${out}`);
