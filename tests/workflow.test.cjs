"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');

test('Pages holds main execution and gates assembly on all validation jobs',()=>{
  const source=fs.readFileSync(path.join(root,'.github/workflows/pages.yml'),'utf8');
  assert.match(source,/cancel-in-progress: \$\{\{ github\.event_name == 'pull_request' \}\}/);
  assert.match(source,/needs: \[test, yaml, browser\]/);
  assert.match(source,/run: node scripts\/pages-freshness\.cjs/);
  assert.match(source,/if: steps\.freshness\.outputs\.fresh == 'true'/);
  assert.equal((source.match(/github\.ref == 'refs\/heads\/main' && github\.event_name != 'pull_request'/g)||[]).length,2);
});

test('actual freshness decision accepts matching main and rejects stale or unknown refs',()=>{
  const {isFresh}=require('../scripts/pages-freshness.cjs');
  const current='a'.repeat(40), stale='b'.repeat(40);
  assert.equal(isFresh(current+'\trefs/heads/main\n',current),true);
  assert.equal(isFresh(current+'\trefs/heads/main\n',stale),false);
  assert.equal(isFresh(current+'\trefs/heads/main\r\n',current),true);
  for(const output of ['',current+'\trefs/heads/other\n','invalid\trefs/heads/main\n',current+'\trefs/heads/main\n'+stale+'\trefs/heads/main\n'])assert.throws(()=>isFresh(output,current));
  assert.throws(()=>isFresh(current+'\trefs/heads/main\n','unknown'));
});

test('Pages artifact contains only allowed runtime files and exact source identity',()=>{
  const sha='a'.repeat(40);
  execFileSync(process.execPath,[path.join(root,'scripts/stage-site.cjs')],{env:{...process.env,GITHUB_SHA:sha}});
  const out=path.join(root,'_site');
  try {
    assert.deepEqual(fs.readdirSync(out).sort(),['.nojekyll','advisories','app.js','engine.js','index.html','source-commit.txt','styles.css']);
    assert.equal(fs.readFileSync(path.join(out,'source-commit.txt'),'utf8'),sha+'\n');
    for(const file of ['index.html','styles.css','engine.js','app.js','advisories/dread-9999.yaml'])assert.deepEqual(fs.readFileSync(path.join(out,file)),fs.readFileSync(path.join(root,file)));
  } finally {fs.rmSync(out,{recursive:true,force:true});}
  assert.throws(()=>execFileSync(process.execPath,[path.join(root,'scripts/stage-site.cjs')],{env:{...process.env,GITHUB_SHA:'bad'},stdio:'pipe'}));
});
