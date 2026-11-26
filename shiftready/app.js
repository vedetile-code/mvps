(function () {
  const $ = (id) => document.getElementById(id);
  const fields = ["fullName","credentials","email","phone","location","tier","targetRole","targetEmployer","resume","posting","achievements","doNotClaim","notes"];

  function setStep(name) {
    document.querySelectorAll("#progress span").forEach((el) => {
      el.classList.toggle("on", el.dataset.step === name || (name === "review" && el.dataset.step !== "intake"));
      if (name === "review" && el.dataset.step === "intake") el.classList.remove("on");
      if (name === "review") el.classList.toggle("on", el.dataset.step === "review" || el.dataset.step === "draft");
    });
  }

  async function loadSample() {
    const [resume, posting, intakeRaw] = await Promise.all([
      fetch("data/maya-resume.md").then((r) => r.text()),
      fetch("data/pcu-posting.md").then((r) => r.text()),
      fetch("data/maya-intake.json").then((r) => r.json()),
    ]);
    $("fullName").value = intakeRaw.full_name || "";
    $("credentials").value = intakeRaw.credentials || "";
    $("email").value = intakeRaw.email || "";
    $("phone").value = intakeRaw.phone || "";
    $("location").value = intakeRaw.location || "";
    $("targetRole").value = intakeRaw.target_role || "";
    $("targetEmployer").value = intakeRaw.target_employer || "";
    $("resume").value = resume;
    $("posting").value = posting;
    $("achievements").value = (intakeRaw.achievements || []).join("\n");
    $("doNotClaim").value = (intakeRaw.do_not_claim || []).join("\n");
    $("notes").value = [intakeRaw.relocation, intakeRaw.shift_preference, intakeRaw.notes].filter(Boolean).join("\n");
    $("tier").value = "interview";
  }

  function gather() {
    const achievements = $("achievements").value.split("\n").map((s) => s.trim()).filter(Boolean);
    const doNot = $("doNotClaim").value.split("\n").map((s) => s.trim()).filter(Boolean);
    return {
      resume: $("resume").value.trim(),
      posting: $("posting").value.trim(),
      tier: $("tier").value,
      intake: {
        full_name: $("fullName").value.trim(),
        credentials: $("credentials").value.trim(),
        email: $("email").value.trim(),
        phone: $("phone").value.trim(),
        location: $("location").value.trim(),
        target_role: $("targetRole").value.trim(),
        target_employer: $("targetEmployer").value.trim(),
        achievements,
        do_not_claim: doNot,
        notes: $("notes").value.trim(),
      },
    };
  }

  function renderMarkdown(text) {
    return String(text || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function renderQuestions(qs) {
    if (!qs || !qs.length) return "<p class='muted'>Not included in this pack tier. Choose the $49 or $99 pack to add questions.</p>";
    return qs.map((q) => {
      const pts = (q.talking_points || []).map((t) => "<li>" + renderMarkdown(t) + "</li>").join("");
      return "<article class='q-item'><h3>" + q.id + ". " + renderMarkdown(q.question) + "</h3><p class='muted'>" + renderMarkdown(q.category || "") + (q.why_asked ? " — " + renderMarkdown(q.why_asked) : "") + "</p><ul>" + pts + "</ul></article>";
    }).join("");
  }

  function renderMock(mock, tier) {
    if (tier === "pilot" || tier === "application") {
      return "<p class='muted'>The scored mock interview is included in the $99 Interview pack.</p>";
    }
    if (!mock || !mock.questions) return "<p class='muted'>No mock interview in this draft.</p>";
    let html = "<p>" + renderMarkdown(mock.scoring_notes || "") + "</p>";
    if (mock.sample_session) {
      const s = mock.sample_session;
      html += "<div class='card'><h3>" + renderMarkdown(s.label || "Sample session") + "</h3><p><strong>Overall " + renderMarkdown(s.overall || "") + "</strong></p><p>" + renderMarkdown(s.summary || "") + "</p>";
      (s.answers || []).forEach((a) => {
        const scores = a.scores ? Object.entries(a.scores).map(([k,v]) => k + " " + v + "/5").join(", ") : "";
        html += "<article class='q-item'><h3>" + renderMarkdown(a.question) + "</h3><p>" + renderMarkdown(a.answer) + "</p><p class='muted'>" + renderMarkdown(scores) + (a.total != null ? " · total " + a.total + "/" + a.out_of : "") + "</p><p>" + renderMarkdown(a.feedback || "") + "</p></article>";
      });
      html += "</div>";
    }
    html += "<h2>Practice questions and suggested answers</h2>";
    (mock.questions || []).forEach((q) => {
      const rubric = (q.rubric || []).map((r) => "<li><strong>" + renderMarkdown(r.criterion) + ":</strong> " + renderMarkdown(r.what_good_looks_like) + "</li>").join("");
      html += "<article class='q-item'><h3>" + q.id + ". " + renderMarkdown(q.question) + "</h3><p>" + renderMarkdown(q.suggested_answer || "") + "</p><ul>" + rubric + "</ul></article>";
    });
    return html;
  }

  function renderReview(pack) {
    const gate = pack.review_gate || {};
    let html = "<p>Mode: " + renderMarkdown(pack.mode) + " · Draft source: " + renderMarkdown(pack.draft_source || "") + " · Gate: <strong>" + renderMarkdown(gate.status) + "</strong> · Blockers: " + gate.blocker_count + "</p>";
    html += "<p>" + renderMarkdown(gate.instruction || "") + "</p>";
    html += "<h2>Requirement map</h2>";
    (pack.mapped_requirements || []).forEach((m) => {
      html += "<div class='map-item'><strong class='status-" + m.status + "'>" + m.status.toUpperCase() + "</strong> <span class='muted'>(" + renderMarkdown(m.priority || "") + ")</span> " + renderMarkdown(m.requirement);
      if (m.evidence) html += "<div class='muted'>" + renderMarkdown(m.evidence) + "</div>";
      html += "</div>";
    });
    html += "<h2>Checklist</h2>";
    (pack.review_checklist || []).forEach((item) => {
      html += "<div class='check-item " + item.status + "'><strong class='status-" + item.status + "'>" + item.status.toUpperCase() + "</strong> — " + renderMarkdown(item.label) + "<div class='muted'>" + renderMarkdown(item.detail || "") + "</div></div>";
    });
    if (pack.fact_flags && pack.fact_flags.length) {
      html += "<h2>Automated fact flags</h2>";
      pack.fact_flags.forEach((f) => {
        html += "<div class='flag-item'><strong>" + renderMarkdown(f.severity) + " · " + renderMarkdown(f.type) + "</strong> " + renderMarkdown(f.value) + "<div class='muted'>" + renderMarkdown(f.note) + "</div></div>";
      });
    }
    html += "<div class='signoff card'><h3>Human sign-off</h3><p class='muted'>This stays on your machine. It is not submitted anywhere.</p>";
    html += "<label>Reviewer name<input id='revName'></label>";
    html += "<label>Minutes spent (target 20–40)<input id='revMins' type='number' min='1'></label>";
    html += "<label>Decision<select id='revDecision'><option value=''>Choose…</option><option>approve</option><option>revise</option><option>hold</option></select></label>";
    html += "<div class='actions'><button class='btn' type='button' id='signBtn'>Record sign-off locally</button><span class='muted' id='signNote'></span></div></div>";
    html += "<p class='muted'>" + renderMarkdown(pack.disclaimer || "") + "</p>";
    return html;
  }

  function showPack(pack) {
    window.__shiftreadyPack = pack;
    $("intakePanel").classList.add("hidden");
    $("resultPanel").classList.remove("hidden");
    setStep("review");
    const blocked = pack.review_gate && pack.review_gate.status === "blocked_pending_fixes";
    const banner = $("gateBanner");
    banner.className = "banner" + (blocked ? " block" : "");
    banner.innerHTML = blocked
      ? "Review gate: blocked. Fix the failed checklist items before delivery."
      : "Review gate: ready for human review. Do not send this pack until sign-off is recorded and every fail is cleared.";
    $("outResume").textContent = pack.resume_markdown || "";
    $("outLetter").textContent = pack.cover_letter_markdown || "";
    $("outQuestions").innerHTML = renderQuestions(pack.tier === "pilot" ? [] : pack.interview_questions);
    $("outMock").innerHTML = renderMock(pack.mock_interview, pack.tier);
    const li = pack.linkedin;
    $("outLinkedin").innerHTML = (pack.tier === "interview" && li)
      ? "<div class='card'><h3>Headline</h3><p>" + renderMarkdown(li.headline || "") + "</p><h3>About</h3><p>" + renderMarkdown(li.about || "") + "</p><p class='muted'>Drafts only. This tool does not log into or post to LinkedIn.</p></div>"
      : "<p class='muted'>LinkedIn headline and About drafts are included in the $99 Interview pack.</p>";
    $("outReview").innerHTML = renderReview(pack);
    const tab = new URLSearchParams(location.search).get("tab");
    if (tab) {
      const btn = document.querySelector('#tabs button[data-tab="'+tab+'"]');
      if (btn) btn.click();
    }
    const signBtn = $("signBtn");
    if (signBtn) {
      signBtn.addEventListener("click", () => {
        const name = $("revName").value.trim();
        const mins = $("revMins").value;
        const decision = $("revDecision").value;
        if (!name || !mins || !decision) {
          $("signNote").textContent = "Name, minutes, and a decision are required.";
          return;
        }
        if (blocked && decision === "approve") {
          $("signNote").textContent = "Approval is not allowed while automated blockers are open.";
          return;
        }
        $("signNote").textContent = "Recorded locally at " + new Date().toLocaleString() + " — " + name + ", " + mins + " minutes, " + decision + ".";
      });
    }
  }

  async function run() {
    const data = gather();
    if (!data.resume || !data.posting) {
      $("runHint").textContent = "A resume and a job posting are required.";
      return;
    }
    $("runBtn").disabled = true;
    $("runHint").textContent = "Drafting…";
    setStep("draft");
    try {
      const pack = await ShiftReadyEngine.generate(data);
      showPack(pack);
    } catch (err) {
      $("runHint").textContent = "Could not generate the pack. " + (err && err.message ? err.message : "");
      setStep("intake");
    } finally {
      $("runBtn").disabled = false;
    }
  }

  $("loadSample").addEventListener("click", () => loadSample().catch((e) => { $("runHint").textContent = e.message; }));
  $("clearForm").addEventListener("click", () => { fields.forEach((id) => { const el = $(id); if (el && el.tagName === "SELECT") el.value = "interview"; else if (el) el.value = ""; }); });
  $("runBtn").addEventListener("click", run);
  $("backBtn").addEventListener("click", () => {
    $("resultPanel").classList.add("hidden");
    $("intakePanel").classList.remove("hidden");
    setStep("intake");
  });
  $("printBtn").addEventListener("click", () => window.print());
  $("downloadBtn").addEventListener("click", () => {
    const pack = window.__shiftreadyPack;
    if (!pack) return;
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "shiftready-pack.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });
  document.getElementById("tabs").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-tab]");
    if (!btn) return;
    document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("on", b === btn));
    document.querySelectorAll(".pane").forEach((p) => p.classList.toggle("on", p.id === "pane-" + btn.dataset.tab));
  });

  ShiftReadyEngine.status().then((st) => {
    const pill = $("modePill");
    if (st.api_key_present) {
      pill.textContent = "Local live mode";
      pill.classList.add("live");
      $("runHint").textContent = "A local server with an API key is available. Drafts will use the model, then the same fact-check.";
    } else if (st.local_api) {
      pill.textContent = "Local demo mode";
      $("runHint").textContent = "Local server is running without OPENAI_API_KEY. Demo drafting only.";
    } else {
      pill.textContent = "Static demo mode";
      $("runHint").textContent = "No API key is used on this page. Load the sample for the finished pack, or paste other inputs for a browser-side draft.";
    }
  });

  if (/[?&]sample=1/.test(location.search) || /[?&]demo=1/.test(location.search)) {
    loadSample().then(run);
  }
})();
