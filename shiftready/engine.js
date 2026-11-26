/* ShiftReady client engine. Demo mode runs entirely in the browser.
   If a local server exposes POST /api/generate (and an API key is set there),
   that path is preferred. No API key is ever requested or stored in the page. */
(function (root) {
  const KNOWN = ["PCCN","CCRN","TCRN","CMSRN","CEN","TNCC","ENPC","NIHSS","PALS","ACLS","BLS","NRP","CNOR","OCN","eNLC","compact","BSN","MSN","ADN","ASN","DNP","LPN","LVN","RN","Epic","Cerner","Meditech","Magnet"];
  const CRED = new RegExp("\\b(" + KNOWN.slice().sort((a,b)=>b.length-a.length).map(escapeRe).join("|") + ")\\b", "ig");

  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function norm(s) { return String(s || "").replace(/\s+/g, " ").trim(); }
  function lower(s) { return norm(s).toLowerCase(); }
  function isSample(resume, posting) {
    const r = lower(resume), p = lower(posting);
    return r.includes("maya ortiz") && p.includes("north harbor medical center") && r.includes("westfield community hospital");
  }
  function positiveMention(term, corpus) {
    const re = new RegExp(".{0,50}\\b" + escapeRe(term) + "\\b.{0,50}", "ig");
    let m;
    while ((m = re.exec(corpus))) {
      const w = m[0].toLowerCase();
      if (/\bno\b|\bnot\b|\bdon't\b|\bdo not\b|do_not_claim|without\b|lack(?:s|ing)?\b/.test(w)) continue;
      return true;
    }
    return false;
  }
  function extractCreds(text) {
    const found = new Map();
    String(text || "").replace(CRED, (m) => { found.set(m.toLowerCase(), m); return m; });
    return found;
  }
  function postingRequirements(posting) {
    const reqs = [];
    let current = "general";
    const seen = new Set();
    for (const raw of String(posting || "").split(/\n/)) {
      const ln = raw.replace(/^[\s•\-]+/, "").trim();
      const low = ln.toLowerCase();
      if (/required qualification/.test(low)) { current = "required"; continue; }
      if (/preferred qualification/.test(low)) { current = "preferred"; continue; }
      if (/^responsibilities|^about the role|^compensation|^job title|^employer|^posted|^schedule|^unit:/.test(low)) { current = "general"; continue; }
      if ((current === "required" || current === "preferred") && ln.length > 8 && !seen.has(low)) {
        seen.add(low);
        reqs.push({ requirement: ln, priority: current });
      }
    }
    return reqs;
  }
  function supportStatus(requirement, corpus) {
    const lowReq = lower(requirement);
    const lowCor = lower(corpus);
    if (/washington|wa /.test(lowReq) && /compact|enlc|multistate/.test(lowCor)) {
      return { status: "supported", evidence: "A compact (eNLC) license is in the inputs." };
    }
    if (/pccn|ccrn/.test(lowReq)) {
      return (positiveMention("PCCN", corpus) || positiveMention("CCRN", corpus))
        ? { status: "supported", evidence: "Specialty certification is claimed in the inputs." }
        : { status: "gap", evidence: "" };
    }
    if (/progressive care|step-down|step down|pcu/.test(lowReq)) {
      if (/floated to .{0,20}progressive care|float(?:ed)? to pcu|pcu for \d+ shifts/.test(lowCor)) {
        return { status: "partial", evidence: "PCU experience is float-only, not a full-time PCU staff line." };
      }
      if (/progressive care|step-down|pcu/.test(lowCor)) return { status: "supported", evidence: "PCU or step-down experience appears in the inputs." };
      return { status: "gap", evidence: "" };
    }
    const hints = [
      [/\bbls\b|basic life support/, /\bbls\b|basic life support/],
      [/\bacls\b/, /\bacls\b/],
      [/\bpals\b/, /\bpals\b/],
      [/2 years|two years|2\+ years/, /3 years|three years|2022|2 years/],
      [/telemetry/, /telemetry/],
      [/charge/, /charge/],
      [/precept/, /precept/],
      [/\bepic\b/, /\bepic\b/],
      [/night shift|nights/, /night/],
      [/vasoactive|titrat/, /vasoactive|titrat/],
    ];
    for (const [need, have] of hints) {
      if (need.test(lowReq) && have.test(lowCor)) {
        return { status: "supported", evidence: "Matching language found in the inputs." };
      }
    }
    return { status: "gap", evidence: "" };
  }
  function mapRequirements(resume, intake, posting) {
    const corpus = resume + "\n" + JSON.stringify(intake || {});
    return postingRequirements(posting).map((req) => {
      const s = supportStatus(req.requirement, corpus);
      return { ...req, status: s.status, evidence: s.evidence };
    });
  }
  function factDiff(claimText, candidateSource, posting) {
    const flags = [];
    const creds = extractCreds(claimText);
    for (const [key, label] of creds.entries()) {
      if (key === "rn" || key === "magnet") continue;
      if (!positiveMention(label, claimText)) continue;
      if (positiveMention(label, candidateSource)) continue;
      flags.push({ type: "credential", value: label, severity: "block", note: label + " is claimed in the draft but is not a claimed credential in the resume or intake." });
    }
    return flags;
  }
  function checklist(mapped, flags, mode) {
    const gaps = mapped.filter((m) => m.status === "gap");
    const partials = mapped.filter((m) => m.status === "partial");
    const items = [
      { id: "no-invented-credentials", label: "No license, certification, or credential appears that is missing from the inputs.", status: flags.some((f) => f.type === "credential") ? "fail" : "pass", detail: flags.filter((f)=>f.type==="credential").map(f=>f.note).join("; ") || "No invented credentials detected by the checker." },
      { id: "no-invented-employers", label: "No employer or facility is added that is missing from the inputs.", status: "review", detail: "Human reviewer: confirm every facility name appears in the resume, intake, or posting." },
      { id: "numbers-traced", label: "Every number, ratio, and date in the draft can be traced to the inputs or is clearly about the employer’s posting.", status: "review", detail: "Human reviewer: check ratios, shift counts, dates, and cert expirations." },
      { id: "gaps-visible", label: "Requirements with no supporting fact are listed as gaps, not written into the resume as experience.", status: "pass", detail: gaps.length + " gap(s), " + partials.length + " partial match(es). " + gaps.map(g=>g.requirement).join("; ") },
      { id: "no-fake-connection", label: "The cover letter does not invent a personal history with the employer.", status: "review", detail: "Human reviewer: search the letter for claimed visits, friends on staff, or 'long admired' language that is not in the intake." },
      { id: "contact-accurate", label: "Name, email, phone, and licensure dates match the intake and resume.", status: "review", detail: "Human reviewer: compare the header line by line." },
      { id: "tone-and-format", label: "Resume uses fragments, not first person. Letter is one page. Files are cleanly named.", status: "review", detail: "Human reviewer: typography, tense, and file names before delivery." },
      { id: "no-promises", label: "No callback, hire, or exam-pass promise appears in the pack or in client-facing notes.", status: "pass", detail: "Default copy avoids outcome guarantees." },
      { id: "human-signoff", label: "Reviewer spent 20–40 minutes, resolved every fail, and signed off.", status: "pending", detail: "This gate is manual. Do not send the pack until it is signed." },
    ];
    const fails = items.filter((i) => i.status === "fail").length;
    if (fails) items.push({ id: "blockers-present", label: "Automated blockers must be fixed before human sign-off.", status: "fail", detail: fails + " blocker(s) found in " + mode + " mode." });
    return items;
  }

  function genericQuestions(posting) {
    const unit = /pcu|progressive|telemetry|icu|ed|med-surg|medical-surgical/i.exec(posting)?.[0] || "the unit in the posting";
    const base = [
      ["clinical", "Walk me through how you assess and prioritize your assignment at the start of a shift on " + unit + ".", "Tests prioritization for the posted unit."],
      ["clinical", "A patient’s condition changes quickly. What do you do first, and when do you escalate?", "Safety and escalation."],
      ["scenario", "You have a full assignment, a new admission is coming, and one patient is trending in the wrong direction. How do you sequence the next steps?", "Competing tasks."],
      ["behavioral", "Tell me about a time you gave a difficult SBAR or escalated a concern.", "Communication."],
      ["leadership", "Describe any charge or senior-nurse decisions you have actually owned.", "Preferred leadership experience, if present."],
      ["leadership", "Tell me about precepting or teaching another nurse, if you have done that.", "Preferred teaching experience."],
      ["clinical", "How do you document under time pressure in the EHR named in your materials?", "EHR fit."],
      ["logistics", "This posting may include nights, weekends, or relocation. What is actually possible for you, and when can you start?", "Schedule and license."],
    ];
    const extras = [
      "How do you recognize early deterioration?",
      "Describe a conflict with a colleague and how it ended.",
      "Tell me about a mistake or near miss and what changed afterward.",
      "How do you teach a patient or family at an inconvenient hour?",
      "What do you check before starting or changing a high-alert medication, if that is in your practice?",
      "How have you handled a float or unfamiliar assignment safely?",
      "What quality or committee work have you contributed to?",
      "How do you talk about a preferred qualification you do not have?",
      "What questions do you have about orientation, ratios, and resources?",
      "Is there anything on your resume you want to clarify?",
    ];
    const out = base.map((b, i) => ({ id: i+1, category: b[0], question: b[1], why_asked: b[2], talking_points: ["Use only facts from the resume and intake.", "Name gaps plainly."] }));
    extras.forEach((q, i) => out.push({ id: out.length+1, category: i % 2 ? "behavioral" : "clinical", question: q, why_asked: "Common RN interview prompt, tailored in human review.", talking_points: ["Stay inside your actual practice."] }));
    while (out.length < 30) {
      out.push({ id: out.length+1, category: "behavioral", question: "Tell me about a shift that did not go as planned and what you did next.", why_asked: "Judgment under pressure.", talking_points: ["No patient identifiers."] });
    }
    return out.slice(0, 30);
  }

  function genericDraft(resume, posting, intake, mapped) {
    const name = intake.full_name || (resume.trim().split("\n")[0] || "Candidate");
    const target = intake.target_role || "the posted role";
    const employer = intake.target_employer || "the employer in the posting";
    const gaps = mapped.filter((m) => m.status === "gap").map((m) => m.requirement);
    const partials = mapped.filter((m) => m.status === "partial");
    const achievements = Array.isArray(intake.achievements) ? intake.achievements : [];
    const summary = name + ". A tailored draft built only from the supplied resume and intake, reordered toward the posting. Gaps are listed rather than filled in.";
    const resumeMd = `# ${name}\n${intake.location || ""}\n${intake.email || ""} · ${intake.phone || ""}\n\n**Professional summary**\n${summary}\n\n**Experience and credentials (from your materials, not expanded)**\n\n${resume.trim()}\n\n**Intake highlights used in tailoring**\n${achievements.length ? achievements.map((a)=>"- "+a).join("\n") : "- See the experience section of the supplied resume."}\n`;
    let letterGap = "";
    if (gaps.length || partials.length) {
      letterGap = "\n\nI want to be accurate about fit. "
        + (partials.length ? "Partial matches: " + partials.map((p)=>p.requirement).join("; ") + ". " : "")
        + (gaps.length ? "I do not have documented experience for: " + gaps.join("; ") + "." : "");
    }
    const letter = `# Cover letter\n\n${name}\n${intake.email || ""} · ${intake.phone || ""}\n\nHiring Manager\n${employer}\n\nDear Hiring Manager,\n\nI am applying for ${target} at ${employer}. The resume in this pack is limited to the facts in the materials I provided.${letterGap}\n\n${intake.relocation || intake.notes || "I am glad to discuss availability, licensure, and start timing."}\n\nThank you for your time.\n\nSincerely,\n${name}\n`;
    const questions = genericQuestions(posting);
    const mock = {
      scoring_notes: "Self-score each question 1–5 on specificity, clinical soundness, structure, and fit to the posting. Use only facts from the resume and intake. This is rehearsal, not a hiring prediction.",
      questions: questions.slice(0, 8).map((q) => ({
        id: q.id,
        question: q.question,
        suggested_answer: "Draft a STAR answer using only facts in the resume and intake. " + (q.talking_points || []).join(" "),
        rubric: [
          { criterion: "specificity", what_good_looks_like: "Names units, dates, and numbers already in the inputs." },
          { criterion: "clinical_soundness", what_good_looks_like: "Stays inside the candidate’s actual practice." },
          { criterion: "structure", what_good_looks_like: "Clear sequence; STAR for behavioral items." },
          { criterion: "fit_to_posting", what_good_looks_like: "Addresses the posting without inventing experience." },
        ],
      })),
    };
    return { resume_markdown: resumeMd, cover_letter_markdown: letter, interview_questions: questions, mock_interview: mock, gaps, draft_source: "demo-generic-browser" };
  }

  function finalize(draft, resume, posting, intake, tier, mode) {
    const mapped = draft.mapped_requirements || mapRequirements(resume, intake, posting);
    const claim = (draft.resume_markdown || "") + "\n" + (draft.cover_letter_markdown || "");
    const flags = factDiff(claim, resume + "\n" + JSON.stringify(intake || {}), posting);
    const review = checklist(mapped, flags, mode);
    const ready = review.every((i) => i.status !== "fail");
    return {
      product: "ShiftReady",
      occupation: "Registered Nurse (hospital staff and travel / relocation RN roles)",
      tier: tier || "interview",
      mode,
      generated_on: new Date().toISOString().slice(0, 10),
      disclaimer: "This pack is a draft for a job application. It is not a guarantee of a callback, interview, or job. A human must complete the review checklist before anything is sent to an employer.",
      resume_markdown: draft.resume_markdown,
      cover_letter_markdown: draft.cover_letter_markdown,
      interview_questions: draft.interview_questions || [],
      mock_interview: draft.mock_interview || {},
      gaps: draft.gaps || mapped.filter((m)=>m.status==="gap").map((m)=>m.requirement),
      mapped_requirements: mapped,
      fact_flags: flags,
      review_checklist: review,
      review_gate: {
        status: ready ? "ready_for_human_review" : "blocked_pending_fixes",
        blocker_count: review.filter((i)=>i.status==="fail").length,
        instruction: "Do not deliver this pack until every fail is cleared and the human-signoff item is marked signed.",
      },
      draft_source: draft.draft_source,
    };
  }

  async function loadDemoPack() {
    const res = await fetch("data/demo-pack.json");
    if (!res.ok) throw new Error("Could not load the sample pack.");
    return res.json();
  }
  async function status() {
    if (location.hostname.endsWith("github.io") || location.hostname.endsWith("pages.dev")) {
      return { mode: "demo", api_key_present: false, local_api: false };
    }
    try {
      const res = await fetch("/api/status");
      if (!res.ok) return { mode: "demo", api_key_present: false, local_api: false };
      const data = await res.json();
      return { ...data, local_api: true };
    } catch {
      return { mode: "demo", api_key_present: false, local_api: false };
    }
  }
  async function generate({ resume, posting, intake, tier, forceDemo }) {
    const st = await status();
    if (st.local_api && !forceDemo) {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, posting, intake, tier, force_demo: !st.api_key_present }),
      });
      if (res.ok) return res.json();
    }
    if (isSample(resume, posting)) {
      const pack = await loadDemoPack();
      pack.mode = "demo";
      pack.tier = tier || pack.tier;
      return pack;
    }
    const mapped = mapRequirements(resume, intake, posting);
    const draft = genericDraft(resume, posting, intake, mapped);
    draft.mapped_requirements = mapped;
    return finalize(draft, resume, posting, intake, tier, "demo");
  }

  root.ShiftReadyEngine = { generate, status, isSample, mapRequirements };
})(window);
