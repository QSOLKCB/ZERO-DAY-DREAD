"use strict";
// Explicit allowlist: research artifacts and source history never enter Pages.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, '_site');
const sha = process.env.GITHUB_SHA;
if (!/^[a-f0-9]{40}$/.test(sha || '')) throw Error('GITHUB_SHA must identify the tested commit');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'advisories'), { recursive: true });
for (const file of ['index.html','styles.css','engine.js','app.js','advisories/dread-9999.yaml']) {
  fs.copyFileSync(path.join(root, file), path.join(out, file));
}
fs.writeFileSync(path.join(out, '.nojekyll'), '');
fs.writeFileSync(path.join(out, 'source-commit.txt'), sha + '\n');
console.log('Staged static site for ' + sha);
