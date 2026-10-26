"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { generate, toYAML } = require('../engine.js');

test('YAML emits escaped controls and noncharacters without changing seed identity', () => {
  for (const point of [0x7f, 0x80, 0x85, 0x9f, 0x2028, 0x2029, 0xfeff, 0xfffe, 0xffff]) {
    const seed = 'a' + String.fromCharCode(point) + 'b';
    const record = generate({seed});
    const yaml = toYAML(record);
    assert.equal(record.seed, seed);
    assert.ok(!yaml.includes(String.fromCharCode(point)), 'raw U+' + point.toString(16));
    const scalar = yaml.split('\n').find(line => line.startsWith('seed: ')).slice(6);
    assert.equal(JSON.parse(scalar), seed);
  }
});

test('original maintainer PHP export is retained byte for byte', () => {
  const bytes = fs.readFileSync(path.join(__dirname, 'fixtures/maintainer-php.yaml'));
  assert.equal(require('node:crypto').createHash('sha256').update(bytes).digest('hex'),
    '943cbc8d15f71d74559bc5ece649276e2d1cda87a0c16d3ed7f96a1bcbe86292');
  assert.equal(bytes.toString('utf8'), toYAML(generate({language:'PHP',code:'PEBKAC',seed:'2004',round:12})));
});

test('seed normalization is idempotent and safe-integer rounds remain exact', () => {
  for (const seed of ['', ' 2004 ', '\uD800', '\uDC00', 'x'.repeat(127)+'😀', 0, null]) {
    const a = generate({seed, round:Number.MAX_SAFE_INTEGER});
    assert.deepEqual(generate({seed:a.seed,round:a.round}),a);
    assert.equal(a.round,Number.MAX_SAFE_INTEGER);
  }
  for (const round of [-1,0.5,Infinity,NaN,Number.MAX_SAFE_INTEGER+1,'12']) {
    assert.equal(generate({round}).round,0);
  }
});
