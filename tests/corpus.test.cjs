"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const e=require('../engine.js');

test('bounded identity corpus has no collisions between distinct records',()=>{
  const seen=new Map(); let count=0;
  for(const language of ['ALL',...e.LANGUAGES]) for(const code of e.CODES) for(let round=0;round<1000;round++) {
    const a=e.generate({language,code,seed:'bounded-corpus-'+round,round});
    const bytes=e.toYAML(a);
    if(seen.has(a.id)) assert.equal(seen.get(a.id),bytes,'distinct records collide: '+a.id);
    seen.set(a.id,bytes);count++;
  }
  assert.equal(count,56000);
});

test('cross-platform corpus matches a retained SHA-256 fixture',()=>{
  const {execFileSync}=require('node:child_process');
  const bytes=execFileSync(process.execPath,[path.join(__dirname,'../scripts/yaml-corpus.cjs')],{maxBuffer:8*1024*1024});
  const expected=fs.readFileSync(path.join(__dirname,'fixtures/corpus.sha256'),'utf8').trim();
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),expected);
});
