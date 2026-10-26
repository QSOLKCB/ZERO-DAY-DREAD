# Engineering contracts and limits

ZERO-DAY-DREAD remains fictional satire. No exploit execution, scanner, telemetry,
backend, API key or remote inference exists in the application.

## Deterministic evidence

The generation profile retains the v2 identity algorithm from PR #1. A seed is
stringified, truncated to 128 UTF-16 code units, then unpaired surrogates become
U+FFFD. This is intentionally not NFC normalization; whitespace and composed versus
decomposed characters can produce different records. Invalid or missing languages
resolve to PHP; ALL is a distinct requested mode. Invalid diagnostic choices act
as AUTO. Nonnegative safe-integer rounds are preserved; other engine inputs use 0.
The UI rejects invalid rounds and stops at Number.MAX_SAFE_INTEGER instead of wrapping.
The displayed sequence is round + 1; the exported round is zero-based.

Identity binds requested language, resolved language, normalized seed, round and
resolved code using length-delimited text. AUTO and an explicit equivalent code
may share identity when they produce identical evidence. The two FNV-derived halves
are non-cryptographic. No global collision freedom or 64 independent bits of entropy
is claimed. A 56,000-record corpus checks distinct evidence for collisions; it is
not an exhaustive proof. Use the entire YAML plus an external SHA-256 for research
integrity, not the short DREAD label as a cryptographic receipt.

All record and catalog arrays are frozen. Browser output uses textContent. YAML
uses fixed fields/order, JSON-compatible quoted scalars, explicit escaping of
C1/DEL, NEL, separators, BOM and BMP noncharacters, LF and a trailing newline.
The escaping correction changes bytes only for affected unusual scalar values;
record semantics and v2 IDs are unchanged. Existing valid PHP and DREAD-9999
fixtures stay byte-identical. This is a serialization correction, not a new ID profile.

Development-only `scripts/check-yaml.py` compares all fields after parsing 1,120
records with ruamel.yaml 0.18.16 in YAML 1.2 mode. Parser behavior is empirical;
see YAML 1.2.2 sections 5.1 and 7.3.1 for the language contract. The parser is never
loaded by the website. `tests/fixtures/corpus.sha256` binds the UTF-8 JSONL corpus.

## Deployment ordering

Main workflows retain their workflow concurrency lock throughout testing, assembly,
freshness check and deploy-pages completion. Only PR runs cancel predecessors.
Pending runs can still be superseded. Main equality is checked inside the lock;
an unknown/malformed main identity fails closed. Assembly includes only five
runtime files plus `.nojekyll` and the tested SHA in `source-commit.txt`. Pages
uses the artifact from the same workflow run, after all tests pass.

The conditional guarantee is: assuming the same concurrency group, monotonically
advancing main, no external deployers, and deploy-pages completion tracking the
external deployment, an older run cannot publish after a newer completed run.
Main may advance between check and deployment, so the site may temporarily lag.
This is NOT an atomic compare-and-publish operation with main. Manual cancellation,
runner loss, deployment timeouts, external service behavior and legacy workflow
reruns fall outside the model. Inspect Pages deployment state before retrying an
uncertain run; do not infer that cancellation undid an external effect.

Before first integration, drain older workflows and do not rerun old workflow
revisions. No live deployment race was induced in this mission. The old-policy
counterexample and new-policy state exploration are abstract model evidence only.

References: [GitHub concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency),
[YAML 1.2.2](https://yaml.org/spec/1.2.2/).

## Verification classes

Node regressions exercise the actual engine/staging code. Browser tests use real
browser engines offline at 320/375/768/1280px, including replay, download, clipboard
failure/success, keyboard activation, round validation and output escaping. This
is not a WCAG audit, screen-reader certification or native Safari/Edge certification.
The governance/deployment tests are finite executable specifications. No Lean proof,
native IBAE seals, formal runtime enforcement or universal correctness is claimed.
