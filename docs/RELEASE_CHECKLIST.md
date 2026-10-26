# Human-controlled release checklist

Status: review candidate, not an immutable v0.1.0 release.

- [ ] Required checks passed for the final PR commit (all OS/Node, YAML, browsers).
- [ ] Independent review references the exact final commit; corrections require fresh review.
- [ ] Maintainer approves and merges this PR.
- [ ] Drain legacy Pages runs; do not rerun old workflow revisions.
- [ ] Post-merge Pages workflow succeeds and source-commit.txt matches merged main.
- [ ] Maintainer checks deployed desktop/mobile controls and downloads.
- [ ] Any remaining accessibility/native-browser gaps are accepted or resolved explicitly.
- [ ] Maintainer authorizes version update, immutable tag and release notes.
- [ ] Research package is refreshed with final CI/review/merge/deployment evidence.
- [ ] Investigator approves research metadata, funding and licensing before Zenodo.

No checkbox is satisfied by confidence, a proposed action, or an unrelated green run.
An updated commit requires CI and review for that commit. Publication and integration
are separate decisions; a locally verified archive does not authorize either.
