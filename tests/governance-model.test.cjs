"use strict";
// Executable abstract specifications, NOT enforcement of GitHub or IBAE runtime.
const test=require('node:test');
const assert=require('node:assert/strict');

test('bounded serialized deployment model never overwrites a newer publication',()=>{
  // Three monotonically advancing commits. Arbitrary run scheduling. A freshness
  // check and external publish both retain the same lock until completion.
  const pending=[{main:0,published:-1,lock:-1,phase:[0,0,0]}];
  const seen=new Set();
  while(pending.length) {
    const s=pending.pop(),key=JSON.stringify(s);
    if(seen.has(key))continue; seen.add(key);
    if(s.main<2)pending.push({...s,main:s.main+1});
    for(let r=0;r<=s.main;r++) {
      if(s.lock===-1 && s.phase[r]===0) {
        const phase=s.phase.slice();phase[r]=r===s.main?1:2;
        pending.push({...s,phase,lock:phase[r]===1?r:-1});
      }
      if(s.lock===r && s.phase[r]===1) {
        assert.ok(r>=s.published,'publication regressed');
        const phase=s.phase.slice();phase[r]=2;
        pending.push({...s,published:r,lock:-1,phase});
      }
    }
  }
  assert.ok(seen.size>10);
});

test('a freshness check alone admits a stale-publication counterexample',()=>{
  let main=0,published=-1;
  const oldChecked=(main===0);
  main=1;
  const newChecked=(main===1);
  if(newChecked)published=1;
  if(oldChecked)published=0;
  assert.equal(published,0); // Expected counterexample, not a live service reproduction.
});

test('abstract exact-commit integration requires review, CI and human authority',()=>{
  const admits=(head,review,ci,human)=>head===review&&head===ci&&human===true;
  for(const head of ['a','b'])for(const review of [null,'a','b'])for(const ci of [null,'a','b'])for(const human of [false,true]) {
    const accepted=admits(head,review,ci,human);
    if(accepted) {assert.equal(review,head);assert.equal(ci,head);assert.equal(human,true);}
    if(review!==head||ci!==head||!human)assert.equal(accepted,false);
  }
  assert.equal(admits('a','a','a',true),true);
  assert.equal(admits('b','a','a',true),false,'correction invalidates earlier gates');
});
