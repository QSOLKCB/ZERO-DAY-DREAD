# Getting started

ZERO-DAY-DREAD is a zero-dependency, static satire simulator.

## Local operation

Open **index.html** in a modern browser. No build, accounts or network needed.

Choose a language (including **YAML** and **Human Operator**), select a diagnostic (PEBKAC, ID-10-T, PICNIC or LAYER-8), optionally enter a seed, and generate fictional advisories. Download or copy the resulting YAML 1.2-compatible record.

To replay an export, choose its `requested_language`, `code` and `seed`, then enter
its zero-based `round` and leave that field (Tab works). The record updates immediately;
the disaster button advances to the next round. Changing language, diagnostic or seed
resets the round to 0. Export buttons always copy/download the currently displayed record.
Invalid rounds leave that last valid record intact; maximum safe-integer rounds do not wrap.

For reproducibility, the engine operates on requested language mode + resolved language + diagnostic + normalized seed + round index. The browser never sends requests or executes exploit payloads.

## Automated tests

Run:

    node --test tests/*.test.cjs
    node --check engine.js
    node --check app.js

Node.js is only needed for tests, not for the website.

Optional development checks (also run in CI): install `ruamel.yaml==0.18.16` in a
Python virtual environment, then run `python scripts/check-yaml.py`. Install
`playwright@1.64.1` in a separate temporary npm directory, install its browser binaries,
and set `NODE_PATH` to that directory's `node_modules` before running
`node scripts/browser-check.cjs`. `BROWSER` may be chromium, firefox or webkit.
These test dependencies are never staged into Pages.

## GitHub Pages

Select **GitHub Actions** as the Pages build source. The workflow in **.github/workflows/pages.yml** tests pushes and pull requests, and only publishes from main after all engine, YAML and browser jobs pass. A pull request or non-main manual run does not deploy. Main runs retain their concurrency lock through deployment completion; only PR runs cancel active predecessors. A deploy-time main-HEAD check skips stale artifacts. See [the exact guarantee and failure limits](CONTRACTS.md). Both retained YAML fixtures use LF checkout rules.

## Advisory contract

Generated record IDs use project-local **DREAD-<fingerprint>-<diagnostic>** syntax. The Human Operator family uses **DREAD-9999-<fingerprint>-<diagnostic>**; the full ID binds the requested language mode, resolved language, normalized seed, round, and code. YAML evidence exports explicitly retain `requested_language` as distinct from `language`. Fingerprints are deterministic but not cryptographic uniqueness guarantees. The static example **advisories/dread-9999.yaml** captures **Human Operator Still Required**, including PEBKAC / ID-10-T / PICNIC / LAYER-8.

Outputs are fiction. They are neither actual findings nor security guidance.
