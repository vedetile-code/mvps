(function () {
  const NS = window.Nookshift;
  const sourceImg = document.getElementById("source-img");
  const afterCanvas = document.getElementById("after-canvas");
  const compare = document.getElementById("compare");
  const styleBox = document.getElementById("style-picks");
  const sampleBox = document.getElementById("samples");
  const modeLabel = document.getElementById("mode-label");
  const modeDetail = document.getElementById("mode-detail");
  const generateBtn = document.getElementById("generate");
  const downloadBtn = document.getElementById("download");
  const fileInput = document.getElementById("file");
  const drop = document.getElementById("drop");
  const notes = document.getElementById("notes");
  const toast = document.getElementById("toast");
  const kindFilter = document.getElementById("kind-filter");
  const waitlistForm = document.getElementById("waitlist-form");

  let currentStyle = NS.styleById("scandinavian");
  let currentSource = null;
  let mode = "demo";
  let busy = false;
  const slider = NS.bindCompare(compare);

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 4200);
  }

  function setMode(next) {
    mode = next;
    const demo = mode !== "ai";
    modeLabel.textContent = demo ? "Demo mode" : "Local AI mode";
    modeDetail.textContent = demo
      ? "Color, light and mood shift in your browser. Furniture layout stays the same. No photo leaves this device. Add OPENAI_API_KEY and run server.py on your computer for full AI restyles."
      : "Photos are sent to the OpenAI API from this computer only. Check every result before you buy paint, furniture or plants. AI can invent finishes that are not in the room.";
  }

  function renderStyles() {
    const kind = kindFilter ? kindFilter.value : "all";
    styleBox.innerHTML = "";
    NS.STYLES.filter((s) => kind === "all" || s.kind === kind).forEach((s) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "style-pick" + (s.id === currentStyle.id ? " on" : "");
      b.innerHTML = '<div class="dot" style="background:' + s.swatch + '"></div><strong>' + s.name + "</strong><small>" + s.blurb + "</small>";
      b.addEventListener("click", () => {
        currentStyle = s;
        renderStyles();
      });
      styleBox.appendChild(b);
    });
  }

  function setSource(img) {
    currentSource = img;
    sourceImg.src = img.src;
    sourceImg.hidden = false;
    afterCanvas.getContext("2d").clearRect(0, 0, afterCanvas.width, afterCanvas.height);
    afterCanvas.hidden = true;
    slider.set(0);
    downloadBtn.disabled = true;
  }

  async function loadSample(id) {
    const img = await NS.sampleImage(id, 1200, 900);
    setSource(img);
    [...sampleBox.querySelectorAll("button")].forEach((b) => b.classList.toggle("on", b.dataset.id === id));
  }

  function renderSamples() {
    sampleBox.innerHTML = "";
    NS.SAMPLES.forEach((s) => {
      const b = document.createElement("button");
      b.type = "button";
      b.dataset.id = s.id;
      b.title = s.name;
      const c = document.createElement("canvas");
      NS.drawSampleToCanvas(c, s.id, 240, 160);
      b.appendChild(c);
      b.addEventListener("click", () => loadSample(s.id));
      sampleBox.appendChild(b);
    });
  }

  function readFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      showToast("Please choose a photo (JPG, PNG, or WebP).");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setSource(img);
    img.src = url;
    [...sampleBox.querySelectorAll("button")].forEach((b) => b.classList.remove("on"));
  }

  async function tryHealth() {
    if (location.hostname.endsWith("github.io") || location.hostname.endsWith("pages.dev")) {
      setMode("demo");
      return;
    }
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      if (!res.ok) throw new Error("no api");
      const data = await res.json();
      setMode(NS.detectMode(data));
    } catch (err) {
      setMode("demo");
    }
  }

  function canvasToBlob(canvas) {
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }

  async function generateAI() {
    const blob = await canvasToBlob((() => {
      const c = document.createElement("canvas");
      const w = Math.min(1280, currentSource.naturalWidth || currentSource.width);
      const h = Math.round(w * ((currentSource.naturalHeight || currentSource.height) / (currentSource.naturalWidth || currentSource.width)));
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(currentSource, 0, 0, w, h);
      return c;
    })());
    const fd = new FormData();
    fd.append("image", blob, "room.png");
    fd.append("style", currentStyle.id);
    fd.append("notes", notes.value || "");
    const res = await fetch("/api/restyle", { method: "POST", body: fd });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "The AI request failed." }));
      throw new Error(err.error || "The AI request failed.");
    }
    const data = await res.json();
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read the AI image."));
      img.src = data.image;
    });
  }

  async function generate() {
    if (!currentSource || busy) return;
    busy = true;
    generateBtn.disabled = true;
    generateBtn.textContent = "Restyling…";
    try {
      let result;
      if (mode === "ai") {
        try {
          result = await generateAI();
        } catch (err) {
          showToast((err && err.message) + " Falling back to demo preview.");
          result = null;
        }
      }
      if (!result) {
        await new Promise((r) => setTimeout(r, 700));
        NS.restyleCanvas(currentSource, currentStyle, afterCanvas);
      } else {
        afterCanvas.width = result.naturalWidth;
        afterCanvas.height = result.naturalHeight;
        afterCanvas.getContext("2d").drawImage(result, 0, 0);
      }
      afterCanvas.hidden = false;
      slider.set(52);
      downloadBtn.disabled = false;
    } catch (err) {
      showToast(err.message || "Could not restyle that photo.");
    } finally {
      busy = false;
      generateBtn.disabled = false;
      generateBtn.textContent = "Restyle this photo";
    }
  }

  downloadBtn.addEventListener("click", () => {
    if (downloadBtn.disabled) return;
    const a = document.createElement("a");
    a.href = afterCanvas.toDataURL("image/png");
    a.download = "nookshift-" + currentStyle.id + ".png";
    a.click();
  });
  generateBtn.addEventListener("click", generate);
  fileInput.addEventListener("change", (e) => readFile(e.target.files[0]));
  ["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", (e) => readFile(e.dataTransfer.files[0]));
  drop.addEventListener("click", () => fileInput.click());
  drop.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") fileInput.click(); });
  if (kindFilter) kindFilter.addEventListener("change", renderStyles);

  if (waitlistForm) {
    waitlistForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(waitlistForm).entries());
      window.location.href = NS.waitlistMailto(data);
    });
  }

  renderStyles();
  renderSamples();
  tryHealth().then(async () => {
    const params = new URLSearchParams(location.search);
    const sample = params.get("sample") || "living";
    const style = params.get("style");
    if (style) currentStyle = NS.styleById(style);
    renderStyles();
    await loadSample(sample);
    if (params.get("preview") === "1") {
      await generate();
    }
  });
})();
