"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { generate, toYAML, LANGUAGES, CODES, CATALOG, DIAGNOSTICS } = require("../engine.js");
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
  assert.match(report.id, /^DREAD-9999-[0-9A-F]{16}-PEBKAC$/);
  assert.equal(report.requested_language, "Human Operator");
  assert.equal(report.severity, "UNPATCHABLE");
  assert.deepEqual(report.related_codes, ["PEBKAC", "ID-10-T", "PICNIC", "LAYER-8"]);
});
test("fixture exists and labels everything fiction", () => {
  const content = fs.readFileSync(path.join(__dirname, "../advisories/dread-9999.yaml"), "utf8");
  assert.match(content, /id: "DREAD-9999-[0-9A-F]{16}-PEBKAC"/);
  for (const code of CODES) assert.ok(content.includes('  - "' + code + '"'));
  assert.match(content, /FICTIONAL SATIRE/);
  const generated = toYAML(generate({language: "Human Operator", code: "PEBKAC", seed: "fixture", round: 0}));
  // Ignore host checkout newlines; compare the logical LF-normalized evidence.
  assert.equal(content.replace(/\r\n/g, "\n"), generated, "Retained fixture must match generated YAML");
  assert.equal(content.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n").replace(/\r\n/g, "\n"), generated, "CRLF checkout must preserve fixture parity");
});

test("inherited object property names are not valid catalog languages", () => {
  for (const language of ["constructor", "toString", "__proto__", "hasOwnProperty"]) {
    const report = generate({ language, code: "PEBKAC" });
    assert.equal(report.language, "PHP");
    assert.equal(typeof report.title, "string");
    assert.equal(typeof report.description, "string");
  }
});
test("nested engine definitions and generated arrays cannot be mutated", () => {
  const opts = { language: "PHP", code: "PEBKAC", seed: "immutable" };
  const baseline = toYAML(generate(opts));
  assert.ok(Object.isFrozen(CATALOG.PHP));
  assert.ok(Object.isFrozen(DIAGNOSTICS.PEBKAC));
  assert.throws(() => { CATALOG.PHP[0] = "modified"; }, TypeError);
  assert.throws(() => { DIAGNOSTICS.PEBKAC[0] = "modified"; }, TypeError);
  const report = generate({language: "Human Operator", seed: "fixture", code: "PEBKAC"});
  const savedYAML = toYAML(report);
  assert.ok(Object.isFrozen(report.related_codes));
  assert.throws(() => report.related_codes.push("rogue"), TypeError);
  assert.equal(toYAML(report), savedYAML);
  assert.equal(toYAML(generate(opts)), baseline);
});
test("invalid UTF-16 seed scalars are normalized before hashing and YAML export", () => {
  for (const seed of ["\uD800", "\uDC00", "a\uD800b", "a\uDC00b", "x".repeat(127) + "😀"]) {
    const advisory = generate({language: "YAML", code: "PEBKAC", seed});
    const output = toYAML(advisory);
    assert.doesNotMatch(output, /\\u[dD][89abAB][0-9a-fA-F]{2}|\\u[dD][c-fC-F][0-9a-fA-F]{2}/);
    const seedLine = output.split("\n").find(line => line.startsWith("seed: "));
    assert.equal(JSON.parse(seedLine.slice(6)), advisory.seed);
    assert.equal(toYAML(advisory), output);
  }
  assert.equal(generate({seed: "x".repeat(127) + "😀"}).seed, "x".repeat(127) + "\uFFFD");
});
test("different diagnostics change record IDs and download filenames", () => {
  for (const language of ["PHP", "Human Operator", "YAML"]) {
    const ids = CODES.map(code => generate({language, seed: "same", round: 3, code}).id);
    assert.equal(new Set(ids).size, CODES.length);
    assert.deepEqual(ids, CODES.map(code => generate({language, seed: "same", round: 3, code}).id));
  }
});
test("CRLF checkout normalizes to the canonical YAML text", () => {
  const expected = toYAML(generate({language: "Human Operator", code: "PEBKAC", seed: "fixture", round: 0}));
  const windowsCheckout = expected.replace(/\n/g, "\r\n");
  assert.notEqual(windowsCheckout, expected);
  assert.equal(windowsCheckout.replace(/\r\n/g, "\n"), expected);
});

test("Codex reproduction: ALL and direct language choices never reuse distinct evidence IDs", () => {
  const fromRoulette = generate({language: "ALL", code: "PEBKAC", seed: "x", round: 0});
  const explicit = generate({language: fromRoulette.language, code: fromRoulette.code, seed: fromRoulette.seed, round: fromRoulette.round});
  assert.equal(fromRoulette.requested_language, "ALL");
  assert.equal(explicit.requested_language, explicit.language);
  assert.equal(fromRoulette.language, explicit.language);
  assert.notEqual(fromRoulette.id, explicit.id);
  assert.notEqual(toYAML(fromRoulette), toYAML(explicit));
  assert.ok(toYAML(fromRoulette).includes('requested_language: "ALL"'));
  assert.ok(toYAML(explicit).includes('requested_language: "' + explicit.language + '"'));
  assert.deepEqual(fromRoulette, generate({language: "ALL", code: "PEBKAC", seed: "x", round: 0}));
});
test("requested-language provenance makes distinct roulette versus direct filenames unique", () => {
  for (const round of [0, 1, 2, 3, 4, 16, 100]) {
    for (const code of CODES) {
      const roulette = generate({language: "ALL", code, seed: "stable", round});
      const direct = generate({language: roulette.language, code, seed: "stable", round});
      assert.notEqual(roulette.id, direct.id);
      assert.notEqual(roulette.requested_language, direct.requested_language);
      assert.equal(roulette.id, generate({language: "ALL", code, seed: "stable", round}).id);
    }
  }
});
