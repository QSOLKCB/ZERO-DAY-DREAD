/* Browser-only UI; safe textContent output. Zero external requests. */
(function () {
  "use strict";
  const engine = globalThis.DreadEngine;
  const byId = (id) => document.getElementById(id);
  const lang = byId("language"), code = byId("diagnostic"), seed = byId("seed");
  const roundInput = byId("round");
  let round = 0, advisory = null;
  function option(value, label) {
    const o = document.createElement("option"); o.value = value; o.textContent = label; return o;
  }
  lang.replaceChildren(option("ALL", "RCE ROULETTE — RANDOM LANGUAGE"));
  for (const name of engine.LANGUAGES) lang.append(option(name, name));
  code.replaceChildren(option("AUTO", "AUTO — LET THE ALGORITHM PANIC"));
  for (const key of engine.CODES) code.append(option(key, key + " — " + engine.DIAGNOSTICS[key][0]));
  lang.value = "ALL";
  function show() {
    advisory = engine.generate({ language: lang.value, code: code.value, seed: seed.value, round });
    const fields = {
      "advisory-id": advisory.id, "advisory-title": advisory.title,
      "advisory-description": advisory.description, "advisory-impact": advisory.impact,
      "advisory-mitigation": advisory.mitigation, "advisory-diagnostic": advisory.diagnostic,
      "advisory-classification": advisory.code + " — " + advisory.code_expansion,
      "advisory-vector": advisory.vector, "advisory-language": advisory.language,
      "advisory-severity": advisory.severity, "panic-score": advisory.panic_score + "/100 (scale broken)",
      "consultant-revenue": advisory.consultant_revenue,
      "related-codes": advisory.related_codes.join(" / ")
    };
    for (const [field, value] of Object.entries(fields)) byId(field).textContent = value;
    byId("panic-meter").style.width = Math.min(100, advisory.panic_score) + "%";
    roundInput.value = String(advisory.round);
    roundInput.setCustomValidity("");
    byId("round-counter").textContent = String(BigInt(advisory.round) + 1n).padStart(3, "0");
    byId("yaml-preview").textContent = engine.toYAML(advisory);
    byId("notification").textContent = "Simulated advisory " + advisory.id + " generated. All findings are fictional.";
  }
  function readRound() {
    const value = Number(roundInput.value);
    if (roundInput.value.trim() === "" || !Number.isSafeInteger(value) || value < 0) {
      roundInput.setCustomValidity("Enter a whole round from 0 to 9007199254740991.");
      roundInput.reportValidity();
      byId("notification").textContent = "Round invalid. The last valid advisory is unchanged.";
      return false;
    }
    roundInput.setCustomValidity("");
    round = value;
    return true;
  }
  roundInput.addEventListener("input", function () { roundInput.setCustomValidity(""); });
  roundInput.addEventListener("change", function () { if (readRound()) show(); });
  byId("run").addEventListener("click", function () {
    if (!readRound()) return;
    if (round === Number.MAX_SAFE_INTEGER) {
      byId("notification").textContent = "Maximum round reached. Choose a smaller round to continue.";
      return;
    }
    round += 1; show();
  });
  lang.addEventListener("change", function () { round = 0; show(); });
  code.addEventListener("change", function () { round = 0; show(); });
  seed.addEventListener("change", function () { round = 0; show(); });
  byId("download").addEventListener("click", function () {
    const blob = new Blob([engine.toYAML(advisory)], { type: "application/yaml;charset=utf-8" });
    const url = URL.createObjectURL(blob), anchor = document.createElement("a");
    anchor.href = url; anchor.download = advisory.id.toLowerCase() + ".yaml";
    document.body.append(anchor); anchor.click(); anchor.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    byId("notification").textContent = "Fictional YAML advisory downloaded.";
  });
  byId("copy").addEventListener("click", async function () {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw Error("Clipboard unavailable");
      await navigator.clipboard.writeText(engine.toYAML(advisory));
      byId("notification").textContent = "Fictional YAML advisory copied.";
    } catch (_) {
      byId("notification").textContent = "Clipboard unavailable here; select the YAML below to copy it.";
    }
  });
  show();
})();
