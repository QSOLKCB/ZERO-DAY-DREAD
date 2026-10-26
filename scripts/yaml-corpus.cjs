"use strict";
const {generate,toYAML,LANGUAGES,CODES}=require('../engine.js');
const seeds=['2004','',' a:b # comment\nnext\tline ','a\u0085b','a\u007fb','a\u009fb','a\ufffeb','a\uffffb','a\u2028b','a\u2029b','a\ufeffb','😀','x'.repeat(127)+'😀','\uD800','\uDC00','<img src=x onerror=alert(1)>'];
for(const language of ['ALL',...LANGUAGES]) for(const code of ['AUTO',...CODES]) for(const seed of seeds) {
  const record=generate({language,code,seed,round:12});
  console.log(JSON.stringify({record,yaml:toYAML(record)}));
}
