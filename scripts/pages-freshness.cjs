"use strict";
const fs=require('node:fs');
const {execFileSync}=require('node:child_process');

function isFresh(refOutput, expected) {
  if(!/^[a-f0-9]{40}$/.test(expected || '')) throw Error('Invalid tested commit identity');
  const match=/^([a-f0-9]{40})\trefs\/heads\/main\r?\n?$/.exec(refOutput);
  if(!match) throw Error('Cannot establish a single current main identity');
  return match[1]===expected;
}

if(require.main===module) {
  const ref=execFileSync('git',['ls-remote','origin','refs/heads/main'],{encoding:'utf8',timeout:30000});
  const fresh=isFresh(ref,process.env.GITHUB_SHA);
  fs.appendFileSync(process.env.GITHUB_OUTPUT,`fresh=${fresh}\n`);
  if(!fresh)console.log('::notice::Skipping superseded Pages artifact');
}
module.exports={isFresh};
