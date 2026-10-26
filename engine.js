/* ZERO-DAY-DREAD: deterministic fictional advisories. No network, no dependencies. */
(function (root) {
  "use strict";
  const CATALOG = Object.freeze({
    "PHP": ["Runtime Discovers It Is Running PHP", "An AI auditor discovered a PHP application containing PHP.", "Legacy CMS Archaeology", "The migration committee has been meeting since 2004.", "Replace the codebase with interpretive dance. Document the choreography."],
    "JavaScript": ["Undefined Files Hostile Takeover", "A primitive has requested a performance review of its own type.", "Prototype Insecurity", "The browser console now answers questions nobody asked.", "Put undefined on annual leave."],
    "Python": ["Whitespace Escalates Privileges", "Four spaces were promoted to principal architect without peer review.", "Indentation Drift", "Production has become a nested block of sadness.", "Add a fifth space and hope the situation becomes philosophical."],
    "Rust": ["Borrow Checker Borrows Developer's Weekend", "The compiler rejected a perfectly good emotional support pointer.", "Ownership Dispute", "Memory is safe. Morale remains unverified.", "Acquire written consent from every reference."],
    "C": ["Pointer Points at Something", "A pointer was found directing attention towards an area of memory.", "Unsupervised Addressing", "Engineers are alarmed the program is operating as designed.", "Ask the pointer what it wants. Do not dereference its feelings."],
    "C++": ["Undefined Behaviour Requests Promotion", "An unspecified outcome has joined the architecture committee.", "Template Fog", "Seven distinct versions of the truth compiled successfully.", "Add another template parameter. Nobody will investigate."],
    "Java": ["Enterprise Abstraction Becomes Self-Sustaining", "An AI discovered a FactoryFactory producing meeting invitations.", "Framework Proliferation", "The application requires three committees to print Hello World.", "Provision additional XML and hold a retrospective."],
    "COBOL": ["Last Maintainer Declines Retirement", "A mainframe survived another attempt to understand its business rules.", "Institutional Knowledge", "Critical financial operations continue despite PowerPoint objections.", "Send coffee. Do not touch the batch job."],
    "HTML": ["Aggressive DIV Breaches Containment", "A nested div insists it is the entire document.", "Semantic Misrepresentation", "The page still renders. Management has declared an incident.", "Use a semantic element and tell the div to calm down."],
    "CSS": ["Specificity War Reaches Executive Team", "An !important declaration overruled the design system and the CEO.", "Cascade Escalation", "Every component is now eleven pixels to the left.", "Apply another !important and schedule reconciliation."],
    "Bash": ["Shell Script Develops Opinions", "The deployment script returned a sarcastic exit code.", "Terminal Sentience", "The cron job is demanding paid leave.", "Offer the shell a day off. Do not source its manifesto."],
    "YAML": ["Whitespace Reclassifies Production as a List Item", "A single space promoted the infrastructure configuration into a nested existential crisis.", "Indentation Catastrophe", "The deployment is now a list. The list is also a deployment.", "Add a comment reading intentional. It will not help."],
    "Human Operator": ["Human Operator Still Required", "Researchers have identified a persistent architectural dependency between computers and the humans operating them.", "Biological Interface", "Unpredictable behaviour, undocumented decisions and Friday deployments.", "No patch available. Provide coffee, documentation and a second set of eyes."]
  });
  const DIAGNOSTICS = Object.freeze({
    "PEBKAC": ["Problem Exists Between Keyboard And Chair", "The human-machine interface remains a legacy component."],
    "ID-10-T": ["ID-10-T Error", "A familiar support-code euphemism has achieved enterprise certification."],
    "PICNIC": ["Problem In Chair, Not In Computer", "The incident has been escalated to ergonomic infrastructure."],
    "LAYER-8": ["Layer 8 (Human / Organisational)", "The OSI model has reportedly acquired another layer of management."]
  });
  const LANGUAGES = Object.freeze(Object.keys(CATALOG));
  const CODES = Object.freeze(Object.keys(DIAGNOSTICS));
  function hash(text) {
    let n = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      n ^= text.charCodeAt(i);
      n = Math.imul(n, 16777619);
    }
    return n >>> 0;
  }
  function generate(options) {
    const o = options || {};
    const seed = String(o.seed == null ? "2004" : o.seed).slice(0, 128);
    const round = Number.isSafeInteger(o.round) && o.round >= 0 ? o.round : 0;
    const requestedLanguage = o.language === "ALL" ? "ALL" : (CATALOG[o.language] ? o.language : "PHP");
    const basis = hash(seed + "|" + requestedLanguage + "|" + round);
    const language = requestedLanguage === "ALL" ? LANGUAGES[basis % LANGUAGES.length] : requestedLanguage;
    const requestedCode = CODES.includes(o.code) ? o.code : "AUTO";
    const code = requestedCode === "AUTO" ? CODES[(basis >>> 8) % CODES.length] : requestedCode;
    const data = CATALOG[language], human = language === "Human Operator";
    return Object.freeze({
      id: human ? "DREAD-9999" : "DREAD-" + String(1000 + (basis % 8000)).padStart(4, "0"),
      classification: "FICTIONAL SATIRE — NOT A REAL SECURITY ADVISORY",
      language, code, code_expansion: DIAGNOSTICS[code][0],
      related_codes: human ? CODES.slice() : [code],
      title: data[0], description: data[1], vector: data[2], impact: data[3],
      mitigation: data[4], diagnostic: DIAGNOSTICS[code][1],
      severity: human ? "UNPATCHABLE" : "EXISTENTIAL",
      panic_score: human ? 999 : 80 + (basis % 20),
      consultant_revenue: "$" + (10000 + (basis % 900) * 1000).toLocaleString("en-US") + " (imaginary)",
      seed, round
    });
  }
  function toYAML(advisory) {
    const keys = ["id", "classification", "language", "code", "code_expansion", "related_codes", "title", "description", "vector", "impact", "mitigation", "diagnostic", "severity", "panic_score", "consultant_revenue", "seed", "round"];
    const lines = ["# ZERO-DAY-DREAD — FICTIONAL SATIRE — NEVER USE FOR SECURITY DECISIONS", "---"];
    for (const key of keys) {
      const value = advisory[key];
      if (Array.isArray(value)) {
        lines.push(key + ":");
        for (const item of value) lines.push("  - " + JSON.stringify(item));
      } else {
        lines.push(key + ": " + (typeof value === "number" ? String(value) : JSON.stringify(value)));
      }
    }
    return lines.join("\n") + "\n";
  }
  const api = Object.freeze({ CATALOG, DIAGNOSTICS, LANGUAGES, CODES, generate, toYAML, hash });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.DreadEngine = api;
})(typeof globalThis === "object" ? globalThis : this);
