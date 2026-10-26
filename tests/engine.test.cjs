"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { generate, toYAML, LANGUAGES, CODES } = require("../engine.js");
test("same inputs generate byte-identical evidence", () => {
  const opts = { language: "YAML", code: "PEBKAC", seed: "whitespace", round: 3 };
  assert.deepEqual(generate(opts), generate(opts));
  assert.equal(toYAML(generate(opts)), toYAML(generate(opts)));
});
test("languages and diagnostics produce fictional advisories", () => {
  for (const language of LANGUAGES) for (const code of CODES) {
    const report = generate({ language, code, seed: "audit" });
    assert.equal(report.language, language);
    assert.equal(report.code, code);
    assert.match(report.classification, /FICTIONAL SATIRE/);
    assert.doesNotMatch(toYAML(report), /\bCVE-\d{4}-\d+\b/);
    assert.equal(report.related_codes.includes(code), true);
  }
});
test("roulette is repeatable and changes across rounds", () => {
  const output = Array.from({ length: 12 }, (_, round) => generate({ language: "ALL", seed: "test", round }));
  assert.deepEqual(output, Array.from({ length: 12 }, (_, round) => generate({ language: "ALL", seed: "test", round })));
  assert.ok(new Set(output.map(x => x.id + x.language)).size > 1);
});
test("YAML safely quotes user-supplied values", () => {
  const report = generate({ language: "YAML", seed: 'evil: "\nnewfield: yes', code: "ID-10-T" });
  const yaml = toYAML(report);
  assert.ok(yaml.includes('seed: "evil: \\"\\nnewfield: yes"'));
  assert.ok(!yaml.includes("\nnewfield: yes\n"));
});
test("DREAD-9999 includes all four operator classifications", () => {
  const report = generate({ language: "Human Operator", code: "PEBKAC", seed: "fixture", round: 0 });
  assert.equal(report.id, "DREAD-9999");
  assert.equal(report.severity, "UNPATCHABLE");
  assert.deepEqual(report.related_codes, ["PEBKAC", "ID-10-T", "PICNIC", "LAYER-8"]);
});
test("fixture exists and labels everything fiction", () => {
  const content = fs.readFileSync(path.join(__dirname, "../advisories/dread-9999.yaml"), "utf8");
  assert.match(content, /id: "DREAD-9999"/);
  for (const code of CODES) assert.ok(content.includes('  - "' + code + '"'));
  assert.match(content, /FICTIONAL SATIRE/);
  const generated = toYAML(generate({language: "Human Operator", code: "PEBKAC", seed: "fixture", round: 0}));
  assert.equal(content, generated, "Retained YAML fixture must match the deterministic engine exactly");
});
