(function () {
  const K = window.QuireKDP;
  const G = window.QuireGen;
  const AI = window.QuireAI;
  const CONTACT = "timwvedco+quirepress@gmail.com";

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const state = Object.assign(K.defaultConfig(), loadDraft());
  let previewPage = 1;
  let demo = true;
  let busy = false;
  let lastReport = null;

  function loadDraft() {
    try { return JSON.parse(sessionStorage.getItem("quire-draft") || "{}"); }
    catch { return {}; }
  }
  function saveDraft() {
    sessionStorage.setItem("quire-draft", JSON.stringify(state));
  }

  function fillSelect(el, items, getValue, getLabel, current) {
    el.innerHTML = "";
    items.forEach((item) => {
      const opt = document.createElement("option");
      opt.value = getValue(item);
      opt.textContent = getLabel(item);
      if (opt.value === current) opt.selected = true;
      el.appendChild(opt);
    });
  }

  function bindControls() {
    fillSelect($("#type"), K.BOOK_TYPES, (t) => t.id, (t) => t.label, state.type);
    fillSelect($("#trim"), K.TRIM_SIZES, (t) => t.id, (t) => t.label + (t.popular ? " — common" : ""), state.trimId);
    fillSelect($("#paper"), Object.values(K.PAPER), (t) => t.id, (t) => t.label, state.paperId);
    fillSelect($("#theme"), Object.entries(K.THEMES).map(([id, t]) => ({ id, ...t })), (t) => t.id, (t) => t.name, state.themeId);

    const map = {
      type: "type",
      trim: "trimId",
      paper: "paperId",
      theme: "themeId",
      pages: "pageCount",
      title: "title",
      subtitle: "subtitle",
      author: "author",
      "line-style": "lineStyle",
      "prompt-theme": "promptTheme"
    };

    Object.keys(map).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.value = state[map[id]];
      el.addEventListener("input", () => {
        const key = map[id];
        state[key] = el.type === "number" ? Number(el.value) : el.value;
        if (key === "type") onTypeChange(true);
        refresh();
      });
    });

    $("#bleed").checked = !!state.bleed;
    $("#bleed").addEventListener("change", () => { state.bleed = $("#bleed").checked; refresh(); });
    $("#front-matter").checked = state.includeFrontMatter !== false;
    $("#front-matter").addEventListener("change", () => { state.includeFrontMatter = $("#front-matter").checked; refresh(); });
    $("#single-sided").checked = state.singleSidedArt !== false;
    $("#single-sided").addEventListener("change", () => { state.singleSidedArt = $("#single-sided").checked; refresh(); });
    $("#ai-used").checked = !!state.aiUsed;
    $("#ai-used").addEventListener("change", () => { state.aiUsed = $("#ai-used").checked; refresh(); });

    $("#pages").addEventListener("change", () => {
      let n = Number($("#pages").value) || 24;
      if (n < 2) n = 2;
      if (n > 828) n = 828;
      state.pageCount = n;
      $("#pages").value = n;
      if (previewPage > n) previewPage = n % 2 === 0 ? n - 1 : Math.max(1, n - 1);
      refresh();
    });
  }

  function onTypeChange(applyDefaults) {
    const meta = K.BOOK_TYPES.find((t) => t.id === state.type);
    if (applyDefaults && meta) {
      state.bleed = meta.bleedDefault;
      state.paperId = meta.paper;
      $("#bleed").checked = state.bleed;
      $("#paper").value = state.paperId;
    }
    const lined = state.type === "lined" || state.type === "prompt";
    $("#line-style-wrap").hidden = !(state.type === "lined" || state.type === "prompt");
    $("#prompt-theme-wrap").hidden = state.type !== "prompt";
    $("#single-sided-wrap").hidden = state.type !== "coloring";
  }

  function refresh() {
    saveDraft();
    lastReport = K.validate(state);
    renderReport(lastReport);
    renderMeta(lastReport);
    const maxEven = state.pageCount - (state.pageCount % 2);
    if (previewPage < 1) previewPage = 1;
    if (previewPage > Math.max(1, maxEven || state.pageCount)) previewPage = Math.max(2, maxEven);
    $("#spread-label").textContent = spreadLabel();
    const canvas = $("#preview");
    G.paintSpread(canvas, state, previewPage <= 1 ? 1 : previewPage, { legend: true });
    onTypeChange(false);
  }

  function spreadLabel() {
    if (previewPage <= 1) return "Opening · page 1";
    const n = previewPage % 2 === 0 ? previewPage : previewPage - 1;
    const right = n + 1;
    if (right > state.pageCount) return "Page " + n;
    return "Pages " + n + "–" + right;
  }

  function renderMeta(report) {
    const trim = report.trim;
    const bits = [
      ["Interior page", `${report.size.w.toFixed(3)} × ${report.size.h.toFixed(3)} in`],
      ["Gutter", `${report.gutter.toFixed(3)} in`],
      ["Outside margin", `${report.outside.toFixed(3)} in`],
      ["Spine", `${report.spine.toFixed(4)} in`],
      ["Cover wrap", `${report.cover.w.toFixed(3)} × ${report.cover.h.toFixed(3)} in`]
    ];
    $("#spec-pills").innerHTML = bits.map(([k, v]) => `<span class="pill"><i>${k}</i> ${v}</span>`).join("");
  }

  function renderReport(report) {
    const box = $("#checklist");
    box.innerHTML = report.issues.map((i) => {
      return `<li class="check ${i.level}"><span class="mark" aria-hidden="true"></span><span>${escapeHtml(i.text)}</span></li>`;
    }).join("");
    const badge = $("#status-badge");
    badge.className = "badge " + (report.ok ? (report.warns ? "warn" : "ok") : "err");
    badge.textContent = report.ok
      ? (report.warns ? `${report.warns} warning${report.warns > 1 ? "s" : ""}` : "Ready to export")
      : `${report.errors} issue${report.errors > 1 ? "s" : ""} to fix`;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  async function withBusy(label, fn) {
    if (busy) return;
    busy = true;
    const bar = $("#busy");
    bar.hidden = false;
    bar.textContent = label;
    $$("[data-action]").forEach((b) => { b.disabled = true; });
    try {
      await fn();
    } catch (err) {
      alert(err && err.message ? err.message : String(err));
    } finally {
      busy = false;
      bar.hidden = true;
      $$("[data-action]").forEach((b) => { b.disabled = false; });
    }
  }

  async function exportInterior() {
    const report = K.validate(state);
    if (!report.ok) {
      if (!confirm("There are issues to fix. Export the interior anyway?")) return;
    }
    await withBusy("Building interior PDF…", async () => {
      const result = await G.buildInteriorPdf(state, { paid: false });
      G.downloadBytes(result.bytes, result.filename, "application/pdf");
      window.__quireLastInterior = result;
    });
  }

  async function exportCover() {
    const report = K.validate(state);
    if (!report.ok) {
      if (!confirm("There are issues to fix. Export the cover anyway?")) return;
    }
    await withBusy("Building cover PDF…", async () => {
      const result = await G.buildCoverPdf(state);
      G.downloadBytes(result.bytes, result.filename, "application/pdf");
      window.__quireLastCover = result;
    });
  }

  function exportListing() {
    const pack = G.listingPack(state, lastReport || K.validate(state));
    G.downloadText(pack.text, pack.filename);
  }

  async function maybeEnhance() {
    if (demo) {
      alert("Demo mode is on. Unique model-written prompts and listing copy need a local server with OPENAI_API_KEY in the environment. The demo already uses a built-in prompt bank and listing templates. See the README.");
      return;
    }
    await withBusy("Asking the model for prompts and listing copy…", async () => {
      const data = await AI.enhance("bundle", state);
      if (data.prompts) window.__quirePrompts = data.prompts;
      if (data.listing) {
        if (data.listing.description) state.description = data.listing.description;
        if (data.listing.subtitle && !state.subtitle) state.subtitle = data.listing.subtitle;
      }
      state.aiUsed = true;
      $("#ai-used").checked = true;
      refresh();
      alert("AI copy is ready. It will be used in the listing pack. Prompt journals will use returned prompts when you export if they were provided. Disclose AI-generated text on KDP.");
    });
  }

  async function detectMode() {
    const s = await AI.status();
    demo = !s || s.demo !== false;
    const banner = $("#mode-banner");
    if (demo) {
      banner.hidden = false;
      banner.innerHTML = `<strong>Demo mode.</strong> Layouts and procedural art run in the browser — no API key required. Optional model-written prompts need a local <code>OPENAI_API_KEY</code> (see the README). Waitlist: <a href="mailto:${CONTACT}">${CONTACT}</a>.`;
    } else {
      banner.hidden = false;
      banner.classList.add("live");
      banner.innerHTML = `<strong>AI mode.</strong> The local server can write unique prompts and listing copy. Disclose any model-written text or model-made art on KDP. Keys stay in the server environment and are not written into files.`;
    }
    $("#ai-btn").hidden = false;
  }

  function bindActions() {
    $("#prev-spread").addEventListener("click", () => {
      if (previewPage <= 1) { previewPage = 1; refresh(); return; }
      const start = previewPage % 2 === 0 ? previewPage : previewPage - 1;
      previewPage = start <= 2 ? 1 : start - 2;
      refresh();
    });
    $("#next-spread").addEventListener("click", () => {
      if (previewPage <= 1) { previewPage = 2; refresh(); return; }
      const start = previewPage % 2 === 0 ? previewPage : previewPage - 1;
      const next = start + 2;
      const lastLeft = state.pageCount - (state.pageCount % 2 === 1 ? 1 : 0);
      previewPage = Math.min(next, Math.max(2, lastLeft));
      refresh();
    });
    $("[data-action=interior]").addEventListener("click", exportInterior);
    $("[data-action=cover]").addEventListener("click", exportCover);
    $("[data-action=listing]").addEventListener("click", exportListing);
    $("#ai-btn").addEventListener("click", maybeEnhance);
    window.addEventListener("resize", () => {
      G.paintSpread($("#preview"), state, previewPage <= 1 ? 1 : previewPage, { legend: true });
    });
  }

  function bindContact() {
    $$("[data-contact]").forEach((el) => {
      if (el.tagName === "A") {
        el.href = "mailto:" + CONTACT + "?subject=" + encodeURIComponent("Quire studio");
        el.textContent = CONTACT;
      } else el.textContent = CONTACT;
    });
  }

  bindControls();
  onTypeChange(false);
  bindActions();
  bindContact();
  detectMode().then(refresh);
  refresh();
})();
