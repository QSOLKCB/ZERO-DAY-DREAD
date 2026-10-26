# Getting started

ZERO-DAY-DREAD is a zero-dependency, static satire simulator.

## Local operation

Open **index.html** in a modern browser. No build, accounts or network needed.

Choose a language (including **YAML** and **Human Operator**), select a diagnostic (PEBKAC, ID-10-T, PICNIC or LAYER-8), optionally enter a seed, and generate fictional advisories. Download or copy the resulting YAML 1.2-compatible record.

For reproducibility, the engine operates on language + diagnostic + seed + round index. The browser never sends requests or executes exploit payloads.

## Automated tests

Run:

    node --test tests/*.test.cjs
    node --check engine.js
    node --check app.js

Node.js is only needed for tests, not for the website.

## GitHub Pages

Select **GitHub Actions** as the Pages build source. The workflow in **.github/workflows/pages.yml** tests pushes and pull requests, and only publishes after a successful test job on the default branch or a manual run. A pull request does not deploy to production. Main-branch runs cancel superseded pipelines, and a deploy-time main-HEAD check skips stale artifacts. The retained YAML fixture has LF checkout rules; parity tests also normalize CRLF.

## Advisory contract

Generated record IDs use project-local **DREAD-<fingerprint>-<diagnostic>** syntax. The Human Operator family uses **DREAD-9999-<fingerprint>-<diagnostic>**; the full ID binds the language, normalized seed, round, and code. Fingerprints are deterministic but not cryptographic uniqueness guarantees. The static example **advisories/dread-9999.yaml** captures **Human Operator Still Required**, including PEBKAC / ID-10-T / PICNIC / LAYER-8.

Outputs are fiction. They are neither actual findings nor security guidance.
