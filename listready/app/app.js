(function () {
  var CONTACT = "timwvedco+listready@gmail.com";

  var PLATFORMS = [
    { id: "ebay", label: "eBay", titleLimit: 80, descLimit: null, titleNote: "Official 80-character title cap." },
    { id: "poshmark", label: "Poshmark", titleLimit: 80, descLimit: 1500, titleNote: "Official 80-character title cap. Description cap 1,500 is commonly reported — confirm on the form." },
    { id: "mercari", label: "Mercari", titleLimit: 80, descLimit: 1000, titleNote: "80 / 1,000 are Mercari form caps, not a published help-center rule." },
    { id: "depop", label: "Depop", titleLimit: null, descLimit: 1000, titleNote: "No separate title field. The first line of the description is the title. Up to 5 hashtags. ~1,000-character description is commonly reported — confirm on the form." },
    { id: "vinted", label: "Vinted", titleLimit: 100, descLimit: 2000, titleNote: "Vinted Pro API: title 5–100 characters, description 5–2,000. Lead with brand, colour, and type. No bots, no bulk relist." }
  ];

  var state = {
    mode: "demo", // demo | notes-only | ai
    aiAvailable: false,
    photos: [], // { src, file? }
    sampleId: null,
    draft: null,
    activePlatform: "ebay",
    selected: { ebay: true, poshmark: true, mercari: true, depop: true, vinted: true }
  };

  var $ = function (id) { return document.getElementById(id); };

  function note(msg, tone) {
    var el = $("ai-status");
    el.textContent = msg;
    el.style.color = tone === "warn" ? "var(--stamp)" : "var(--ink-soft)";
  }

  function setBanner() {
    var el = $("mode-banner");
    if (state.aiAvailable) {
      el.innerHTML = "<strong>Local AI mode.</strong> Photos can be analyzed with the key in your environment. Drafts still never post, relist, or log into marketplaces.";
    } else {
      el.innerHTML = "<strong>Demo mode.</strong> Sample items work without an API key. Photo analysis needs OPENAI_API_KEY on a local server. This tool never posts, relists, or logs into marketplaces.";
    }
  }

  async function checkAi() {
    try {
      var r = await fetch("/api/health", { headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error("no health");
      var data = await r.json();
      state.aiAvailable = !!data.ai;
    } catch (e) {
      state.aiAvailable = false;
    }
    setBanner();
    if (state.aiAvailable) {
      note("Local AI key detected. Your photos can be analyzed. Nothing is posted to a marketplace.");
    } else {
      note("No API key on this host. Sample items use prepared drafts. Your own photos will get a notes-only draft until you run the local server with OPENAI_API_KEY.");
    }
  }

  function renderPlatformChecks() {
    $("platform-checks").innerHTML = PLATFORMS.map(function (p) {
      return '<label><input type="checkbox" data-platform="' + p.id + '"' +
        (state.selected[p.id] ? " checked" : "") + "> " + p.label + "</label>";
    }).join("");
  }

  function renderSamples() {
    var items = window.DEMO_ITEMS || [];
    $("samples").innerHTML = items.map(function (item) {
      return (
        '<button type="button" class="sample' + (state.sampleId === item.id ? " active" : "") + '" data-sample="' + item.id + '">' +
        '<img src="' + item.photos[0] + '" alt="">' +
        "<div><b>" + item.name + "</b><span>" + item.blurb + "</span></div></button>"
      );
    }).join("");
  }

  function fillNotes(notes) {
    $("brand").value = notes.brand || "";
    $("category").value = notes.category || "";
    $("size").value = notes.size || "";
    $("color").value = notes.color || "";
    $("condition").value = notes.condition || "";
    $("measurements").value = notes.measurements || "";
    $("flaws").value = notes.flaws || "";
    $("cost").value = notes.cost || "";
    $("retail").value = notes.retail || "";
    $("notes").value = notes.notes || "";
  }

  function readNotes() {
    return {
      brand: $("brand").value.trim(),
      category: $("category").value.trim(),
      size: $("size").value.trim(),
      color: $("color").value.trim(),
      condition: $("condition").value.trim(),
      measurements: $("measurements").value.trim(),
      flaws: $("flaws").value.trim(),
      cost: $("cost").value.trim(),
      retail: $("retail").value.trim(),
      notes: $("notes").value.trim()
    };
  }

  function loadSample(id) {
    var item = (window.DEMO_ITEMS || []).find(function (x) { return x.id === id; });
    if (!item) return;
    state.sampleId = id;
    state.photos = item.photos.map(function (src) { return { src: src, demo: true }; });
    fillNotes(item.notes);
    renderSamples();
    renderThumbs();
  }

  function renderThumbs() {
    $("thumbs").innerHTML = state.photos.map(function (p, i) {
      return '<div class="thumb"><img src="' + p.src + '" alt="Item photo ' + (i + 1) + '"><button type="button" class="remove" data-remove="' + i + '">×</button></div>';
    }).join("");
  }

  function addFiles(fileList) {
    var files = Array.prototype.slice.call(fileList || []);
    files.forEach(function (file) {
      if (!file.type || file.type.indexOf("image/") !== 0) return;
      if (state.photos.length >= 8) return;
      var reader = new FileReader();
      reader.onload = function () {
        state.sampleId = null;
        state.photos.push({ src: reader.result, file: file, demo: false });
        renderSamples();
        renderThumbs();
      };
      reader.readAsDataURL(file);
    });
  }

  function selectedPlatforms() {
    return PLATFORMS.filter(function (p) { return state.selected[p.id]; });
  }

  function charCount(text, limit) {
    var n = (text || "").length;
    if (!limit) return { n: n, cls: "ok", label: n + " characters" };
    var cls = n > limit ? "over" : "ok";
    return { n: n, cls: cls, label: n + " / " + limit };
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function clip(text, limit) {
    if (!limit || text.length <= limit) return text;
    return text.slice(0, limit).replace(/\s+\S*$/, "").trim();
  }

  function sentence() {
    var parts = [];
    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i]) parts.push(arguments[i]);
    }
    return parts.join(" ");
  }

  function notesOnlyDraft(notes, platforms) {
    var brand = notes.brand || "Unbranded (confirm)";
    var item = notes.category || "item";
    var size = notes.size ? " " + notes.size : "";
    var color = notes.color ? notes.color + " " : "";
    var cond = notes.condition || "Condition not specified — add it before you list";
    var meas = notes.measurements || "No measurements supplied. Add them before listing sized clothing or bags.";
    var flaws = notes.flaws || "No flaws were described. Inspect the photos and add wear before you list.";

    var shared = {
      brand: brand,
      category: notes.category || "",
      size: notes.size || "",
      color: notes.color || "",
      department: "",
      style: "",
      material: "",
      condition: cond,
      measurements: meas,
      flaws: flaws
    };

    var ebayTitle = clip((notes.brand ? notes.brand + " " : "") + color + item + size + " " + (notes.condition || "pre-owned"), 80);
    var vintedTitle = clip(((notes.brand ? notes.brand + " " : "") + (notes.color ? notes.color + " " : "") + item + size).trim() || "Item for sale", 100);

    var body = [
      sentence(brand, color + item + size).trim() + ".",
      "Condition: " + cond + ".",
      "Measurements: " + meas,
      "Flaws and wear: " + flaws,
      notes.notes ? "Seller notes: " + notes.notes : "",
      "This draft was built from your typed notes only. Photos were not analyzed (no API key on this host). Review every line before you paste. This tool does not post for you."
    ].filter(Boolean).join("\n\n");

    var out = {
      source: "notes-only",
      warning: "Notes-only draft. Photos were not analyzed because no API key is configured. Review carefully and fill any gaps before you list.",
      shared: shared,
      price: {
        low: null,
        mid: null,
        high: null,
        currency: "USD",
        rationale: "No automatic price is offered in notes-only mode without enough comparable context. Use the checklist below and recent sold listings on each site. Your cost (" + (notes.cost || "not given") + ") is not a market price."
      },
      platforms: {}
    };

    platforms.forEach(function (p) {
      if (p.id === "ebay") {
        out.platforms.ebay = {
          title: ebayTitle.trim(),
          subtitle: clip(cond, 55),
          description: body,
          specifics: {
            Brand: brand,
            Size: notes.size || "",
            Color: notes.color || "",
            Condition: cond
          }
        };
      } else if (p.id === "poshmark") {
        out.platforms.poshmark = {
          title: clip((notes.brand ? notes.brand + " " : "") + color + item + size, 80).trim(),
          description: body,
          styleTags: [],
          originalPriceHint: notes.retail ? "Seller noted original retail: " + notes.retail + " — confirm before entering it." : "Leave original price blank unless you know it."
        };
      } else if (p.id === "mercari") {
        out.platforms.mercari = {
          title: clip((notes.brand ? notes.brand + " " : "") + color + item + size, 80).trim(),
          description: clip(body, 1000)
        };
      } else if (p.id === "depop") {
        var first = clip(((notes.brand ? notes.brand + " " : "") + color + item + size).trim(), 80);
        out.platforms.depop = {
          firstLine: first,
          description: first + "\n\n" + body,
          hashtags: (notes.brand ? [notes.brand.replace(/[^a-z0-9]/gi, "").toLowerCase()] : []).filter(Boolean)
        };
      } else if (p.id === "vinted") {
        out.platforms.vinted = {
          title: vintedTitle,
          description: body
        };
      }
    });
    return out;
  }

  function compsChecklist(platforms) {
    var steps = [
      "Search the brand, item type, size, and key style words on each site you will list on.",
      "Filter to sold or completed listings (eBay: Sold + Completed; on other sites use that platform’s sold or completed view if it has one).",
      "Open 8–10 recent solds that match the same size and a similar condition. Ignore lots, bundles, and items much better or worse than yours.",
      "Note the sold price, shipping, and fees. Your take-home is not the sticker price.",
      "Adjust for disclosed flaws. A starting range from this tool is an estimate, not sold-comp data. We do not scrape marketplaces.",
      "You paste and price the listing yourself. Do not use bots, auto-posting, or bulk delete-and-relist — Vinted’s terms prohibit those."
    ];
    if (platforms.some(function (p) { return p.id === "vinted"; })) {
      steps.push("On Vinted, keep the title factual (brand, colour, type). Do not use this or any other external tool to post, bump, or relist.");
    }
    return steps;
  }

  function fieldBlock(id, label, value, limit, noteText, multiline) {
    var c = charCount(value, limit);
    var tag = multiline ? "textarea" : 'input type="text"';
    var close = multiline ? "</textarea>" : "";
    var inner = multiline ? escapeHtml(value) : "";
    var valueAttr = multiline ? "" : ' value="' + escapeHtml(value) + '"';
    return (
      '<div class="field" data-field="' + id + '">' +
        '<div class="meta"><span>' + escapeHtml(label) + (noteText ? " · " + escapeHtml(noteText) : "") + '</span>' +
        '<span class="' + c.cls + '" data-count>' + c.label + "</span></div>" +
        '<div class="copy-row">' +
          "<" + tag + ' data-limit="' + (limit || "") + '" id="' + id + '"' + valueAttr + ">" + inner + close +
          '<button type="button" class="btn btn-ghost" data-copy="' + id + '">Copy</button>' +
        "</div></div>"
    );
  }

  function renderResults() {
    var draft = state.draft;
    var empty = $("empty");
    var results = $("results");
    var working = $("working");
    working.hidden = true;
    if (!draft) {
      empty.hidden = false;
      results.hidden = true;
      return;
    }
    empty.hidden = true;
    results.hidden = false;

    var plats = selectedPlatforms().filter(function (p) { return draft.platforms[p.id]; });
    if (!plats.length) plats = PLATFORMS.filter(function (p) { return draft.platforms[p.id]; });
    if (!draft.platforms[state.activePlatform] && plats[0]) state.activePlatform = plats[0].id;
    var active = plats.find(function (p) { return p.id === state.activePlatform; }) || plats[0];
    var block = draft.platforms[active.id];

    var warning = draft.warning
      ? '<div class="callout" style="margin-bottom:16px;"><strong>Review before you paste</strong>' + escapeHtml(draft.warning) + "</div>"
      : "";

    var tabs = plats.map(function (p) {
      return '<button type="button" class="tab' + (p.id === active.id ? " active" : "") + '" data-tab="' + p.id + '">' + p.label + "</button>";
    }).join("");

    var fields = "";
    if (active.id === "depop") {
      fields += fieldBlock("f-first", "First line (used as the title)", block.firstLine || "", 80, active.titleNote, false);
      fields += fieldBlock("f-desc", "Full description (include the first line at the top)", block.description || "", active.descLimit, "", true);
      fields += fieldBlock("f-tags", "Hashtags (up to 5)", (block.hashtags || []).map(function (t) { return "#" + t.replace(/^#/, ""); }).join(" "), null, "", false);
    } else {
      fields += fieldBlock("f-title", "Title", block.title || "", active.titleLimit, active.titleNote, false);
      if (block.subtitle != null) {
        fields += fieldBlock("f-sub", "Subtitle (optional, eBay charges for this)", block.subtitle || "", 55, "Official 55-character subtitle cap.", false);
      }
      fields += fieldBlock("f-desc", "Description", block.description || "", active.descLimit, "", true);
      if (block.styleTags) {
        fields += fieldBlock("f-tags", "Style tags (up to 3)", (block.styleTags || []).join(", "), null, "", false);
      }
      if (block.originalPriceHint) {
        fields += '<p class="fine">' + escapeHtml(block.originalPriceHint) + "</p>";
      }
    }

    var specificsRows = "";
    var specs = Object.assign({}, draft.shared, block.specifics || {});
    var order = ["brand", "category", "department", "style", "size", "color", "material", "condition", "measurements", "flaws"];
    var labels = {
      brand: "Brand", category: "Category", department: "Department", style: "Style",
      size: "Size", color: "Color", material: "Material", condition: "Condition",
      measurements: "Measurements", flaws: "Flaws and wear"
    };
    var seen = {};
    function addSpec(key, label, value) {
      var k = key.toLowerCase();
      if (seen[k] || value == null || String(value).trim() === "") return;
      seen[k] = true;
      specificsRows += "<tr><th>" + escapeHtml(label) + '</th><td><input type="text" value="' + escapeHtml(String(value)) + '"></td></tr>';
    }
    order.forEach(function (k) { addSpec(k, labels[k], specs[k]); });
    if (block.specifics) {
      Object.keys(block.specifics).forEach(function (k) { addSpec(k, k, block.specifics[k]); });
    }

    var price = draft.price || {};
    var money = function (n) { return n == null ? "—" : "$" + n; };
    var checklist = compsChecklist(plats).map(function (s) {
      return "<li><input type=\"checkbox\"> <span>" + escapeHtml(s) + "</span></li>";
    }).join("");

    results.innerHTML =
      warning +
      '<div class="results-head"><div><p class="kicker">' +
      (draft.source === "demo" ? "Prepared sample draft" : draft.source === "ai" ? "AI draft — review every field" : "Notes-only draft") +
      "</p><h2>Copy-ready listing</h2><p class=\"fine\">Edit anything that is wrong. Copy a field, then paste it into the marketplace yourself.</p></div>" +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
      '<button type="button" class="btn btn-ghost" id="copy-all">Copy this platform</button>' +
      '<button type="button" class="btn btn-ghost" id="download-txt">Download all drafts</button>' +
      "</div></div>" +
      '<div class="tabs">' + tabs + "</div>" +
      '<div class="panel" style="margin-bottom:16px;">' + fields + "</div>" +
      '<div class="grid-2">' +
        '<div class="panel"><h3>Item specifics</h3>' +
          '<table class="specifics"><tbody>' + specificsRows + "</tbody></table></div>" +
        '<div class="panel"><h3>Suggested price range</h3>' +
          '<div class="price-box">' +
            "<div><span class=\"fine\">Low</span><b>" + money(price.low) + "</b></div>" +
            "<div><span class=\"fine\">Mid</span><b>" + money(price.mid) + "</b></div>" +
            "<div><span class=\"fine\">High</span><b>" + money(price.high) + "</b></div>" +
          "</div>" +
          "<p>" + escapeHtml(price.rationale || "") + "</p>" +
          "<h3>Manual sold-comps checklist</h3>" +
          "<p class=\"fine\">Do this by hand on each site. ListReady does not look up sold prices for you.</p>" +
          '<ul class="checklist">' + checklist + "</ul></div>" +
      "</div>";

    bindResultEvents();
  }

  function bindResultEvents() {
    $("results").querySelectorAll("[data-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        persistActiveEdits();
        state.activePlatform = btn.getAttribute("data-tab");
        renderResults();
      });
    });
    $("results").querySelectorAll("[data-copy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-copy");
        var el = document.getElementById(id);
        if (!el) return;
        copyText(el.value).then(function () {
          btn.textContent = "Copied";
          setTimeout(function () { btn.textContent = "Copy"; }, 1200);
        });
      });
    });
    $("results").querySelectorAll("input[data-limit], textarea[data-limit]").forEach(function (el) {
      el.addEventListener("input", function () {
        var limit = parseInt(el.getAttribute("data-limit"), 10) || null;
        var c = charCount(el.value, limit);
        var span = el.closest(".field").querySelector("[data-count]");
        if (span) { span.className = c.cls; span.textContent = c.label; }
      });
    });
    var copyAll = document.getElementById("copy-all");
    if (copyAll) copyAll.addEventListener("click", function () {
      persistActiveEdits();
      copyText(platformPlainText(state.activePlatform)).then(function () {
        copyAll.textContent = "Copied";
        setTimeout(function () { copyAll.textContent = "Copy this platform"; }, 1200);
      });
    });
    var dl = document.getElementById("download-txt");
    if (dl) dl.addEventListener("click", downloadAll);
  }

  function persistActiveEdits() {
    if (!state.draft) return;
    var block = state.draft.platforms[state.activePlatform];
    if (!block) return;
    var title = document.getElementById("f-title");
    var first = document.getElementById("f-first");
    var desc = document.getElementById("f-desc");
    var sub = document.getElementById("f-sub");
    var tags = document.getElementById("f-tags");
    if (title) block.title = title.value;
    if (first) block.firstLine = first.value;
    if (desc) block.description = desc.value;
    if (sub) block.subtitle = sub.value;
    if (tags && state.activePlatform === "depop") {
      block.hashtags = tags.value.split(/\s+/).map(function (t) { return t.replace(/^#/, ""); }).filter(Boolean);
    }
    if (tags && state.activePlatform === "poshmark") {
      block.styleTags = tags.value.split(/[,]+/).map(function (t) { return t.trim(); }).filter(Boolean);
    }
  }

  function platformPlainText(id) {
    var p = PLATFORMS.find(function (x) { return x.id === id; });
    var b = state.draft.platforms[id];
    if (!p || !b) return "";
    var lines = ["=== " + p.label + " ===", ""];
    if (id === "depop") {
      lines.push("First line (title): " + (b.firstLine || ""));
      lines.push("", "Description:", b.description || "");
      lines.push("", "Hashtags: " + (b.hashtags || []).map(function (t) { return "#" + t; }).join(" "));
    } else {
      lines.push("Title: " + (b.title || ""));
      if (b.subtitle) lines.push("Subtitle: " + b.subtitle);
      lines.push("", "Description:", b.description || "");
      if (b.styleTags) lines.push("", "Style tags: " + b.styleTags.join(", "));
    }
    return lines.join("\n");
  }

  function downloadAll() {
    persistActiveEdits();
    var parts = ["ListReady drafts — review every field before you paste.", "This file is not posted to any marketplace.", ""];
    var price = state.draft.price || {};
    parts.push("Suggested range: " + (price.low != null ? "$" + price.low + "–$" + price.high : "see checklist") + " — confirm with sold comps yourself.", "");
    selectedPlatforms().forEach(function (p) {
      if (state.draft.platforms[p.id]) parts.push(platformPlainText(p.id), "");
    });
    parts.push("Manual comps checklist:");
    compsChecklist(selectedPlatforms()).forEach(function (s, i) { parts.push((i + 1) + ". " + s); });
    var blob = new Blob([parts.join("\n")], { type: "text/plain" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "listready-drafts.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve) {
      var ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      resolve();
    });
  }

  async function generate() {
    var notes = readNotes();
    var plats = selectedPlatforms();
    if (!plats.length) {
      note("Choose at least one marketplace.", "warn");
      return;
    }
    $("empty").hidden = true;
    $("results").hidden = true;
    $("working").hidden = false;

    // Prepared sample if still on that sample and notes weren't required to change
    if (state.sampleId) {
      var item = (window.DEMO_ITEMS || []).find(function (x) { return x.id === state.sampleId; });
      if (item && item.draft) {
        state.mode = "demo";
        state.draft = JSON.parse(JSON.stringify(item.draft));
        state.draft.source = "demo";
        state.draft.warning = "This is a prepared sample draft for a demo item (illustrated photos, not a live listing). Treat it as an example, then try your own photos and notes.";
        renderResults();
        note("Loaded the prepared draft for this sample item. No API key was used.");
        return;
      }
    }

    if (state.aiAvailable && state.photos.length) {
      try {
        var payload = {
          notes: notes,
          platforms: plats.map(function (p) { return p.id; }),
          photos: state.photos.slice(0, 8).map(function (p) { return p.src; })
        };
        var r = await fetch("/api/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        var data = await r.json();
        if (!r.ok) throw new Error(data.error || "Draft request failed");
        state.mode = "ai";
        state.draft = data.draft;
        state.draft.source = "ai";
        state.draft.warning = data.draft.warning || "AI can misread photos or invent details. Delete anything you cannot see in the photos or your notes before you paste.";
        renderResults();
        note("AI draft ready. Review every field. Nothing was posted.");
        return;
      } catch (err) {
        note("AI draft failed (" + err.message + "). Falling back to a notes-only draft.", "warn");
      }
    }

    state.mode = "notes-only";
    state.draft = notesOnlyDraft(notes, plats);
    renderResults();
    if (!state.photos.length) {
      note("Notes-only draft (no photos). Add photos and, for vision analysis, run the local server with OPENAI_API_KEY.");
    } else if (!state.aiAvailable) {
      note("Notes-only draft. Photos were not analyzed — no API key on this host. Sample items still use prepared drafts.");
    }
  }

  function bind() {
    renderPlatformChecks();
    renderSamples();

    $("samples").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-sample]");
      if (!btn) return;
      loadSample(btn.getAttribute("data-sample"));
    });

    $("platform-checks").addEventListener("change", function (e) {
      var box = e.target.closest("[data-platform]");
      if (!box) return;
      state.selected[box.getAttribute("data-platform")] = box.checked;
    });

    $("file-input").addEventListener("change", function (e) { addFiles(e.target.files); e.target.value = ""; });
    var dz = $("dropzone");
    dz.addEventListener("click", function (e) {
      if (e.target.id === "file-input") return;
      $("file-input").click();
    });
    dz.addEventListener("dragover", function (e) { e.preventDefault(); dz.classList.add("drag"); });
    dz.addEventListener("dragleave", function () { dz.classList.remove("drag"); });
    dz.addEventListener("drop", function (e) {
      e.preventDefault();
      dz.classList.remove("drag");
      addFiles(e.dataTransfer.files);
    });

    $("thumbs").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-remove]");
      if (!btn) return;
      state.photos.splice(parseInt(btn.getAttribute("data-remove"), 10), 1);
      state.sampleId = null;
      renderSamples();
      renderThumbs();
    });

    $("generate").addEventListener("click", generate);
  }

  bind();
  checkAi();
})();
