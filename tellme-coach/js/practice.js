(function () {
  const bank = window.TELLME_BANK;
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => [...el.querySelectorAll(s)];

  const state = {
    mode: null,
    queue: [],
    index: 0,
    phase: "question", // question | followup | result
    answer: "",
    followAnswer: "",
    listening: false,
    recognition: null,
    log: [],
    apiMode: false,
    started: false,
  };

  function current() {
    return state.queue[state.index];
  }

  async function detectApi() {
    try {
      const r = await fetch("/api/health", { cache: "no-store" });
      if (!r.ok) return false;
      const j = await r.json();
      return Boolean(j && j.ai);
    } catch {
      return false;
    }
  }

  function show(id) {
    qsa("[data-screen]").forEach((el) => el.classList.toggle("hidden", el.dataset.screen !== id));
  }

  function setApiBanner(ai) {
    const el = qs("#api-status");
    if (!el) return;
    if (ai) {
      el.innerHTML = "Local <strong>AI scoring</strong> is on. Answers are sent only to the local server that holds your API key. This public demo deploy never ships a key.";
    } else {
      el.innerHTML = "Running in <strong>demo mode</strong>. Scoring uses an on-device rubric built from the official answer points. A local <code>OPENAI_API_KEY</code> is required for AI scoring — it is not present on this site.";
    }
  }

  function buildQueue(mode) {
    const tell = bank.questions.filter((q) => q.type === "tell");
    const show = bank.questions.filter((q) => q.type === "show");
    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
    if (mode === "mock") {
      return [shuffle(tell)[0], shuffle(show)[0]];
    }
    if (mode === "tell") return shuffle(tell);
    if (mode === "show") return shuffle(show);
    return shuffle(bank.questions);
  }

  function renderQuestion() {
    const q = current();
    if (!q) return finish();
    state.phase = "question";
    state.answer = "";
    state.followAnswer = "";
    qs("#q-kicker").textContent = `${q.area} · ${q.task} · ${state.index + 1} of ${state.queue.length}`;
    qs("#q-text").textContent = q.question;
    qs("#answer").value = "";
    qs("#result-block").classList.add("hidden");
    qs("#follow-note").classList.add("hidden");
    qs("#submit-btn").textContent = "Submit answer";
    qs("#submit-btn").disabled = false;
    const warning = q.type === "show"
      ? "Show-me questions are asked while you drive. Practise the explanation only, sitting still. Confirm the controls in the car you will use on test, with your instructor."
      : "On test, this is answered before you start driving. For bonnet questions, you may be asked to open the bonnet and point to the item.";
    qs("#q-note").textContent = warning;
    TellMeSpeech.speak("Question. " + q.question);
  }

  function renderFollowUp(missing) {
    const q = current();
    state.phase = "followup";
    qs("#follow-note").classList.remove("hidden");
    qs("#follow-note").textContent = q.follow_up || "Can you add the official points that were missing from that answer?";
    qs("#answer").value = "";
    qs("#submit-btn").textContent = "Submit follow-up";
    TellMeSpeech.speak(q.follow_up || "Please add the missing points.");
  }

  function paintResult(score, q) {
    state.phase = "result";
    const block = qs("#result-block");
    block.classList.remove("hidden");
    const pill = qs("#grade-pill");
    pill.textContent = score.grade;
    pill.className = "pill " + score.grade.toLowerCase();
    const list = qs("#points");
    list.innerHTML = "";
    score.details.forEach((d) => {
      const li = document.createElement("li");
      li.className = d.hit ? "hit" : "miss";
      li.textContent = d.point + (d.hit ? "" : " — not heard in your answer");
      list.appendChild(li);
    });
    qs("#ref").textContent = q.reference;
    if (q.note) {
      const extra = document.createElement("p");
      extra.className = "fine";
      extra.textContent = q.note;
      qs("#ref").after(extra);
    }
    qs("#submit-btn").disabled = true;
  }

  async function grade(answer, followUp) {
    const q = current();
    let score;
    if (state.apiMode) {
      try {
        score = await TellMeScorer.scoreWithApi(q, answer, { followUp, log: state.log });
      } catch (err) {
        score = TellMeScorer.scoreAnswer(q, answer, { followUp });
        score.fallback = String(err.message || err);
      }
    } else {
      score = TellMeScorer.scoreAnswer(q, answer, { followUp });
    }
    return score;
  }

  async function onSubmit() {
    const q = current();
    const text = qs("#answer").value.trim();
    if (!text) {
      qs("#answer").focus();
      return;
    }
    stopListening();
    if (state.phase === "question") {
      state.answer = text;
      const score = await grade(text, false);
      if (score.grade === "UNSAT" && q.follow_up) {
        state.pendingScore = score;
        renderFollowUp(score.missing_points);
        return;
      }
      record(q, text, score);
      paintResult(score, q);
      return;
    }
    if (state.phase === "followup") {
      state.followAnswer = text;
      const combined = state.answer + " " + text;
      const score = await grade(combined, false);
      const followScore = await grade(text, true);
      // Re-grade the official points on the combined answer; follow-up quality is informational.
      score.follow_up_grade = followScore.grade;
      record(q, combined, score);
      paintResult(score, q);
    }
  }

  function record(q, answer, score) {
    state.log.push({
      id: q.id,
      area: q.area,
      task: q.task,
      type: q.type,
      question: q.question,
      answer,
      grade: score.grade,
      missing_points: score.missing_points,
      reference: q.reference,
      mode: score.mode || (state.apiMode ? "ai" : "demo-rubric"),
    });
  }

  function nextQuestion() {
    TellMeSpeech.stopSpeak();
    state.index += 1;
    if (state.index >= state.queue.length) finish();
    else renderQuestion();
  }

  function finish() {
    show("debrief");
    const sat = state.log.filter((x) => x.grade === "SAT").length;
    const unsat = state.log.filter((x) => x.grade === "UNSAT").length;
    qs("#debrief-summary").textContent =
      `You covered ${sat} of ${state.log.length} questions to the practice standard (${unsat} still need work). This is not a test result and is not a prediction that you will pass or fail.`;
    const byArea = {};
    state.log.forEach((item) => {
      byArea[item.area] = byArea[item.area] || { sat: 0, unsat: 0 };
      byArea[item.area][item.grade === "SAT" ? "sat" : "unsat"] += 1;
    });
    qs("#debrief-areas").innerHTML = Object.entries(byArea)
      .map(([area, v]) => {
        const status = v.unsat ? "NEEDS WORK" : "SAT";
        return `<div class="debrief-item"><strong>${area}</strong> — ${status} (${v.sat} sat, ${v.unsat} unmet)</div>`;
      })
      .join("");
    const misses = state.log.filter((x) => x.grade === "UNSAT");
    qs("#debrief-misses").innerHTML = misses.length
      ? misses
          .map(
            (m) => `<div class="debrief-item"><strong>${m.task}</strong><p>${m.question}</p><p>Missing: ${
              (m.missing_points || []).join("; ") || "required official points"
            }</p><p class="ref">${m.reference}</p></div>`
          )
          .join("")
      : `<div class="debrief-item">No unmet official points in this session. Still verify every answer against the current GOV.UK list and with your instructor.</div>`;
    const refs = [];
    const seen = new Set();
    misses.forEach((m) => {
      if (!seen.has(m.reference)) {
        seen.add(m.reference);
        refs.push(m.reference);
      }
    });
    if (!refs.length) refs.push("Re-read the official GOV.UK list in full before test day.");
    qs("#study-list").innerHTML = refs
      .slice(0, 3)
      .map((r, i) => `<li>${i + 1}. ${r}</li>`)
      .join("");
    TellMeSpeech.speak(
      "Session finished. This is self-study practice only. Check every answer with your instructor and the official GOV.UK list."
    );
  }

  function startListening() {
    if (state.listening) {
      stopListening();
      return;
    }
    const rec = TellMeSpeech.getRecognition();
    const btn = qs("#rec-btn");
    const flag = qs("#rec-flag");
    if (!rec) {
      flag.classList.remove("hidden");
      flag.textContent = "This browser has no speech recognition. Type your answer instead. Chrome or Edge work best.";
      qs("#answer").focus();
      return;
    }
    state.recognition = rec;
    let finalText = qs("#answer").value.trim();
    rec.onresult = (ev) => {
      let interim = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const piece = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) finalText = (finalText + " " + piece).trim();
        else interim += piece;
      }
      qs("#answer").value = (finalText + " " + interim).trim();
    };
    rec.onerror = () => stopListening();
    rec.onend = () => {
      if (state.listening) {
        try { rec.start(); } catch (_) { stopListening(); }
      }
    };
    try {
      rec.start();
      state.listening = true;
      btn.innerHTML = '<span class="rec-dot"></span> Stop listening';
      flag.classList.remove("hidden");
      flag.innerHTML = '<span class="rec-dot"></span> Listening — speak your answer, then press stop.';
    } catch (err) {
      flag.classList.remove("hidden");
      flag.textContent = "Could not start the microphone. Type your answer instead.";
    }
  }

  function stopListening() {
    state.listening = false;
    if (state.recognition) {
      try { state.recognition.onend = null; state.recognition.stop(); } catch (_) {}
      state.recognition = null;
    }
    const btn = qs("#rec-btn");
    const flag = qs("#rec-flag");
    if (btn) btn.textContent = "Answer out loud";
    if (flag) flag.classList.add("hidden");
  }

  function startMode(mode) {
    state.mode = mode;
    state.queue = buildQueue(mode);
    state.index = 0;
    state.log = [];
    state.started = true;
    show("session");
    qs("#session-title").textContent =
      mode === "mock" ? "Free mock — one tell me, one show me" :
      mode === "tell" ? "Tell me bank" :
      mode === "show" ? "Show me bank (verbal practice only)" :
      "Full mixed practice";
    renderQuestion();
  }

  function bind() {
    qs("#ack-btn").addEventListener("click", () => {
      const box = qs("#ack");
      if (!box.checked) {
        qs("#ack-warn").classList.remove("hidden");
        return;
      }
      show("modes");
    });
    qsa("[data-mode]").forEach((btn) => {
      btn.addEventListener("click", () => startMode(btn.dataset.mode));
    });
    qs("#repeat-btn").addEventListener("click", () => {
      const q = current();
      if (!q) return;
      const text = state.phase === "followup" ? (q.follow_up || q.question) : q.question;
      TellMeSpeech.speak(text);
    });
    qs("#rec-btn").addEventListener("click", startListening);
    qs("#submit-btn").addEventListener("click", onSubmit);
    qs("#next-btn").addEventListener("click", nextQuestion);
    qs("#end-btn").addEventListener("click", () => {
      if (state.log.length) finish();
      else show("modes");
    });
    qs("#answer").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSubmit();
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    state.apiMode = await detectApi();
    setApiBanner(state.apiMode);
    bind();
    show("gate");
  });
})();
