/* Nookshift studio: sample rooms, style grades, comparison slider */
(function (global) {
  const CONTACT = "timwvedco+nookshift@gmail.com";

  const STYLES = [
    { id: "scandinavian", name: "Scandinavian", kind: "room", blurb: "Pale oak, white walls, north light.", swatch: "linear-gradient(135deg,#f4f1ea,#d9e0d8 55%,#c8b8a0)",
      exposure: 0.12, contrast: -0.08, sat: -0.18, shadows: [0.96, 0.98, 1.04], highs: [1.06, 1.05, 1.02], tint: [236, 232, 222], tintAmt: 0.14, green: 0.04, warmth: -0.04, vignette: 0.12 },
    { id: "japandi", name: "Japandi", kind: "room", blurb: "Quiet clay, linen, low contrast.", swatch: "linear-gradient(135deg,#e7ddd0,#cbbba8 50%,#8e7b68)",
      exposure: 0.04, contrast: -0.12, sat: -0.22, shadows: [0.98, 0.96, 0.93], highs: [1.04, 1.02, 0.98], tint: [230, 220, 205], tintAmt: 0.16, green: 0.02, warmth: 0.05, vignette: 0.18 },
    { id: "midcentury", name: "Mid-century", kind: "room", blurb: "Walnut, ochre, warm lamps.", swatch: "linear-gradient(135deg,#c66a3a,#d9a85a 45%,#5c3a28)",
      exposure: 0.02, contrast: 0.08, sat: 0.12, shadows: [1.04, 0.94, 0.86], highs: [1.12, 1.04, 0.9], tint: [210, 150, 90], tintAmt: 0.1, green: -0.02, warmth: 0.16, vignette: 0.2 },
    { id: "coastal", name: "Coastal", kind: "room", blurb: "Salt air, lifted shadows, sea glass.", swatch: "linear-gradient(135deg,#eaf3f5,#b9d4d8 50%,#7aa0a8)",
      exposure: 0.14, contrast: -0.04, sat: -0.04, shadows: [0.9, 0.98, 1.08], highs: [1.04, 1.06, 1.08], tint: [210, 228, 232], tintAmt: 0.14, green: 0.02, warmth: -0.1, vignette: 0.08 },
    { id: "industrial", name: "Industrial loft", kind: "room", blurb: "Brick, steel, higher contrast.", swatch: "linear-gradient(135deg,#6a625c,#9a8c82 50%,#2f2c2a)",
      exposure: -0.04, contrast: 0.22, sat: -0.2, shadows: [0.9, 0.92, 0.96], highs: [1.08, 1.04, 0.98], tint: [90, 86, 82], tintAmt: 0.1, green: 0, warmth: 0.02, vignette: 0.28 },
    { id: "cottage", name: "English cottage", kind: "room", blurb: "Cream plaster, soft florals.", swatch: "linear-gradient(135deg,#f0e4cc,#d9c3a2 50%,#8c9a70)",
      exposure: 0.08, contrast: -0.1, sat: 0.06, shadows: [1.02, 0.98, 0.9], highs: [1.08, 1.04, 0.96], tint: [236, 220, 190], tintAmt: 0.14, green: 0.08, warmth: 0.1, vignette: 0.16 },
    { id: "farmhouse", name: "Modern farmhouse", kind: "room", blurb: "Warm white, black hardware.", swatch: "linear-gradient(135deg,#f3efe8,#ddd3c4 55%,#2d2a28)",
      exposure: 0.1, contrast: 0.06, sat: -0.12, shadows: [0.96, 0.95, 0.93], highs: [1.08, 1.06, 1.02], tint: [240, 234, 222], tintAmt: 0.1, green: 0, warmth: 0.06, vignette: 0.14 },
    { id: "warmminimal", name: "Warm minimal", kind: "room", blurb: "Beige plane, quiet light.", swatch: "linear-gradient(135deg,#f0e6d6,#dcc8ae 50%,#b08968)",
      exposure: 0.1, contrast: -0.14, sat: -0.16, shadows: [1.0, 0.97, 0.92], highs: [1.08, 1.04, 0.98], tint: [228, 214, 192], tintAmt: 0.18, green: 0, warmth: 0.1, vignette: 0.1 },
    { id: "cottagegarden", name: "Cottage garden", kind: "garden", blurb: "Lush greens, mixed blooms.", swatch: "linear-gradient(135deg,#8fb56a,#d9a0b0 50%,#4e7a3c)",
      exposure: 0.08, contrast: 0.06, sat: 0.22, shadows: [0.92, 1.02, 0.9], highs: [1.06, 1.08, 0.96], tint: [200, 220, 160], tintAmt: 0.08, green: 0.28, warmth: 0.08, vignette: 0.14 },
    { id: "courtyard", name: "Modern courtyard", kind: "garden", blurb: "Crisp pavers, clipped plants.", swatch: "linear-gradient(135deg,#cfc9c0,#8d8a84 50%,#5f7a62)",
      exposure: 0.06, contrast: 0.12, sat: -0.08, shadows: [0.94, 0.96, 1.0], highs: [1.05, 1.05, 1.04], tint: [210, 210, 205], tintAmt: 0.08, green: 0.12, warmth: -0.04, vignette: 0.16 },
    { id: "mediterranean", name: "Mediterranean terrace", kind: "garden", blurb: "Terracotta, bright dry light.", swatch: "linear-gradient(135deg,#e07a4a,#e8c37a 45%,#3d7a6a)",
      exposure: 0.14, contrast: 0.08, sat: 0.16, shadows: [1.08, 0.96, 0.84], highs: [1.12, 1.08, 0.92], tint: [230, 170, 110], tintAmt: 0.12, green: 0.08, warmth: 0.2, vignette: 0.1 },
    { id: "zen", name: "Zen garden", kind: "garden", blurb: "Moss, mist, muted stone.", swatch: "linear-gradient(135deg,#c9cfc6,#8a9a88 50%,#5a6a5c)",
      exposure: 0.02, contrast: -0.16, sat: -0.24, shadows: [0.94, 0.98, 0.96], highs: [1.02, 1.04, 1.02], tint: [210, 216, 208], tintAmt: 0.16, green: 0.1, warmth: -0.08, vignette: 0.22 }
  ];

  function styleById(id) {
    return STYLES.find((s) => s.id === id) || STYLES[0];
  }

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function applyStyleToImageData(imageData, style) {
    const d = imageData.data;
    const w = imageData.width;
    const h = imageData.height;
    const exp = Math.pow(2, style.exposure || 0);
    const contrast = style.contrast || 0;
    const sat = style.sat || 0;
    const warmth = style.warmth || 0;
    const tintAmt = style.tintAmt || 0;
    const tr = style.tint[0], tg = style.tint[1], tb = style.tint[2];
    const sr = style.shadows[0], sg = style.shadows[1], sb = style.shadows[2];
    const hr = style.highs[0], hg = style.highs[1], hb = style.highs[2];
    const greenBoost = style.green || 0;
    const vig = style.vignette || 0;
    const cx = w / 2, cy = h / 2;
    const maxR = Math.sqrt(cx * cx + cy * cy);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        let r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
        r *= exp; g *= exp; b *= exp;
        r = (r - 0.5) * (1 + contrast) + 0.5;
        g = (g - 0.5) * (1 + contrast) + 0.5;
        b = (b - 0.5) * (1 + contrast) + 0.5;
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        r = lum + (r - lum) * (1 + sat);
        g = lum + (g - lum) * (1 + sat);
        b = lum + (b - lum) * (1 + sat);
        const t = clamp(lum, 0, 1);
        r *= sr + (hr - sr) * t;
        g *= sg + (hg - sg) * t;
        b *= sb + (hb - sb) * t;
        r += warmth * 0.08;
        b -= warmth * 0.08;
        r = r * (1 - tintAmt) + (tr / 255) * tintAmt;
        g = g * (1 - tintAmt) + (tg / 255) * tintAmt;
        b = b * (1 - tintAmt) + (tb / 255) * tintAmt;
        const greenness = g - Math.max(r, b);
        if (greenness > 0.02 && greenBoost) {
          g = clamp(g + greenness * greenBoost, 0, 4);
          r = r - greenness * greenBoost * 0.15;
        }
        if (vig) {
          const rr = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) / maxR;
          const v = 1 - vig * Math.pow(rr, 1.6);
          r *= v; g *= v; b *= v;
        }
        // Fine grain so still photos don't look plastic
        const n = ((x * 12.9898 + y * 78.233) % 1) * 2 - 1;
        const grain = n * 0.015;
        d[i] = clamp((r + grain) * 255, 0, 255);
        d[i + 1] = clamp((g + grain) * 255, 0, 255);
        d[i + 2] = clamp((b + grain) * 255, 0, 255);
      }
    }
    return imageData;
  }

  function restyleCanvas(source, style, dest) {
    const w = source.naturalWidth || source.width;
    const h = source.naturalHeight || source.height;
    const outW = Math.min(1400, w || 1200);
    const outH = Math.round(outW * ((h || 900) / (w || 1200)));
    dest.width = outW;
    dest.height = outH;
    const ctx = dest.getContext("2d");
    ctx.drawImage(source, 0, 0, outW, outH);
    const img = ctx.getImageData(0, 0, outW, outH);
    applyStyleToImageData(img, style);
    ctx.putImageData(img, 0, 0);
    return dest;
  }

  function rr(ctx, x, y, w, h, r) {
    const rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
  }

  function fillWall(ctx, w, h, c1, c2) {
    const g = ctx.createLinearGradient(0, 0, 0, h * 0.72);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function drawWindow(ctx, x, y, w, h, sky1, sky2) {
    rr(ctx, x, y, w, h, 6);
    const sky = ctx.createLinearGradient(0, y, 0, y + h);
    sky.addColorStop(0, sky1);
    sky.addColorStop(1, sky2);
    ctx.fillStyle = sky;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.65)";
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w / 2, y + h);
    ctx.moveTo(x, y + h / 2);
    ctx.lineTo(x + w, y + h / 2);
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function plant(ctx, x, y, s, leaf, pot) {
    ctx.fillStyle = pot;
    ctx.beginPath();
    ctx.moveTo(x - 16 * s, y);
    ctx.lineTo(x + 16 * s, y);
    ctx.lineTo(x + 11 * s, y + 22 * s);
    ctx.lineTo(x - 11 * s, y + 22 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = leaf;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const a = -Math.PI / 2 + (i - 2) * 0.35;
      ctx.ellipse(x + Math.cos(a) * 10 * s, y - 18 * s + Math.sin(a) * 6 * s, 8 * s, 18 * s, a, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawLiving(ctx, w, h) {
    fillWall(ctx, w, h, "#efe6d6", "#e3d5bf");
    // floor
    const floor = ctx.createLinearGradient(0, h * 0.68, 0, h);
    floor.addColorStop(0, "#c9a47a");
    floor.addColorStop(1, "#9a734a");
    ctx.fillStyle = floor;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.68);
    ctx.lineTo(w, h * 0.68);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();
    for (let i = 0; i < 9; i++) {
      ctx.strokeStyle = "rgba(80,50,20,0.12)";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.68 + i * 16);
      ctx.lineTo(w, h * 0.7 + i * 18);
      ctx.stroke();
    }
    drawWindow(ctx, w * 0.55, h * 0.1, w * 0.32, h * 0.38, "#9ec7e0", "#efe7d0");
    // rug
    ctx.fillStyle = "#7d4a3a";
    ctx.beginPath();
    ctx.ellipse(w * 0.42, h * 0.86, w * 0.32, h * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c9b08a";
    ctx.beginPath();
    ctx.ellipse(w * 0.42, h * 0.86, w * 0.24, h * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    // sofa
    ctx.fillStyle = "#5d6a62";
    rr(ctx, w * 0.12, h * 0.52, w * 0.5, h * 0.2, 16);
    ctx.fill();
    ctx.fillStyle = "#4d5952";
    rr(ctx, w * 0.12, h * 0.52, w * 0.08, h * 0.2, 14);
    ctx.fill();
    rr(ctx, w * 0.54, h * 0.52, w * 0.08, h * 0.2, 14);
    ctx.fill();
    ctx.fillStyle = "#d9c4a4";
    rr(ctx, w * 0.24, h * 0.55, w * 0.1, h * 0.08, 8);
    ctx.fill();
    rr(ctx, w * 0.38, h * 0.55, w * 0.1, h * 0.08, 8);
    ctx.fill();
    // table
    ctx.fillStyle = "#6b4a2e";
    rr(ctx, w * 0.3, h * 0.74, w * 0.24, h * 0.05, 6);
    ctx.fill();
    ctx.fillRect(w * 0.33, h * 0.79, 8, h * 0.08);
    ctx.fillRect(w * 0.51, h * 0.79, 8, h * 0.08);
    // art
    ctx.fillStyle = "#f7f2ea";
    ctx.fillRect(w * 0.16, h * 0.16, w * 0.2, h * 0.22);
    ctx.fillStyle = "#c25b3c";
    ctx.fillRect(w * 0.18, h * 0.19, w * 0.16, h * 0.16);
    ctx.fillStyle = "#e8d7b5";
    ctx.fillRect(w * 0.22, h * 0.23, w * 0.08, h * 0.08);
    plant(ctx, w * 0.82, h * 0.62, 1.4, "#3f5a45", "#8a5a3c");
    // lamp
    ctx.fillStyle = "#2a241e";
    ctx.fillRect(w * 0.1, h * 0.42, 4, h * 0.26);
    ctx.beginPath();
    ctx.moveTo(w * 0.06, h * 0.42);
    ctx.lineTo(w * 0.16, h * 0.42);
    ctx.lineTo(w * 0.14, h * 0.34);
    ctx.lineTo(w * 0.08, h * 0.34);
    ctx.closePath();
    ctx.fillStyle = "#f0d9a8";
    ctx.fill();
  }

  function drawBedroom(ctx, w, h) {
    fillWall(ctx, w, h, "#e8ece8", "#d5ddd6");
    const floor = ctx.createLinearGradient(0, h * 0.66, 0, h);
    floor.addColorStop(0, "#d8c7b0");
    floor.addColorStop(1, "#b19778");
    ctx.fillStyle = floor;
    ctx.fillRect(0, h * 0.66, w, h * 0.34);
    drawWindow(ctx, w * 0.12, h * 0.12, w * 0.24, h * 0.36, "#bcd3e4", "#f3ead6");
    // curtains
    ctx.fillStyle = "rgba(250,246,238,0.9)";
    ctx.fillRect(w * 0.1, h * 0.1, w * 0.05, h * 0.42);
    ctx.fillRect(w * 0.33, h * 0.1, w * 0.05, h * 0.42);
    // bed
    ctx.fillStyle = "#8b6a4a";
    rr(ctx, w * 0.28, h * 0.5, w * 0.58, h * 0.28, 10);
    ctx.fill();
    ctx.fillStyle = "#efe8dc";
    rr(ctx, w * 0.3, h * 0.48, w * 0.54, h * 0.2, 8);
    ctx.fill();
    ctx.fillStyle = "#f7f4ee";
    rr(ctx, w * 0.32, h * 0.44, w * 0.16, h * 0.1, 10);
    ctx.fill();
    rr(ctx, w * 0.5, h * 0.44, w * 0.16, h * 0.1, 10);
    ctx.fill();
    ctx.fillStyle = "#3f5a45";
    rr(ctx, w * 0.3, h * 0.62, w * 0.54, h * 0.06, 4);
    ctx.fill();
    // nightstand + lamp
    ctx.fillStyle = "#6e5340";
    ctx.fillRect(w * 0.86, h * 0.62, w * 0.08, h * 0.12);
    ctx.fillStyle = "#1c1712";
    ctx.fillRect(w * 0.895, h * 0.46, 3, h * 0.16);
    ctx.beginPath();
    ctx.arc(w * 0.9, h * 0.45, 16, 0, Math.PI * 2);
    ctx.fillStyle = "#f2d9a0";
    ctx.fill();
    plant(ctx, w * 0.2, h * 0.62, 1.1, "#2f6a48", "#c25b3c");
  }

  function drawPatio(ctx, w, h) {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    sky.addColorStop(0, "#8bb7d8");
    sky.addColorStop(1, "#e8d8b8");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    // hedge / fence
    ctx.fillStyle = "#6d5a48";
    ctx.fillRect(0, h * 0.42, w, h * 0.16);
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = i % 2 ? "#5c4a3a" : "#7a6550";
      ctx.fillRect(i * (w / 10) + 4, h * 0.36, w / 12, h * 0.22);
    }
    // greenery behind
    ctx.fillStyle = "#3f5a45";
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.ellipse(i * w / 7 + 20, h * 0.38, 40, 50, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // pavers
    ctx.fillStyle = "#cfc4b4";
    ctx.fillRect(0, h * 0.58, w, h * 0.42);
    ctx.strokeStyle = "rgba(80,70,60,0.25)";
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 7; x++) {
        ctx.strokeRect(x * (w / 6) + (y % 2) * 20, h * 0.58 + y * 36, w / 6 - 8, 28);
      }
    }
    // table
    ctx.fillStyle = "#eadcc4";
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.72, w * 0.2, h * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8a5a3c";
    ctx.fillRect(w * 0.49, h * 0.74, 8, h * 0.12);
    // chairs
    ctx.fillStyle = "#3f5a45";
    rr(ctx, w * 0.28, h * 0.68, 48, 36, 8);
    ctx.fill();
    rr(ctx, w * 0.66, h * 0.68, 48, 36, 8);
    ctx.fill();
    plant(ctx, w * 0.16, h * 0.62, 1.6, "#2f6a48", "#c25b3c");
    plant(ctx, w * 0.86, h * 0.6, 1.8, "#4e7a3c", "#6e5340");
    // blooms
    const blooms = ["#c25b3c", "#e8d7b5", "#d98aa0", "#f0f3e8"];
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = blooms[i % blooms.length];
      ctx.beginPath();
      ctx.arc(30 + i * (w - 60) / 12, h * 0.52 + (i % 3) * 8, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const SAMPLE_DRAWERS = { living: drawLiving, bedroom: drawBedroom, patio: drawPatio };
  const SAMPLES = [
    { id: "living", name: "Living room", drawer: "living" },
    { id: "bedroom", name: "Bedroom", drawer: "bedroom" },
    { id: "patio", name: "Garden patio", drawer: "patio" }
  ];

  function drawSampleToCanvas(canvas, sampleId, width, height) {
    const w = width || 1200;
    const h = height || 900;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    const fn = SAMPLE_DRAWERS[sampleId] || drawLiving;
    fn(ctx, w, h);
    return canvas;
  }

  function sampleImage(sampleId, width, height) {
    const c = document.createElement("canvas");
    drawSampleToCanvas(c, sampleId, width, height);
    const img = new Image();
    img.src = c.toDataURL("image/jpeg", 0.92);
    img.dataset.sample = sampleId;
    return new Promise((resolve) => {
      img.onload = () => resolve(img);
    });
  }

  function bindCompare(root, onMove) {
    const range = root.querySelector("input[type=range]");
    const after = root.querySelector(".after");
    const handle = root.querySelector(".handle");
    function set(v) {
      const n = clamp(Number(v), 0, 100);
      if (after) after.style.clipPath = "inset(0 0 0 " + n + "%)";
      if (handle) handle.style.left = n + "%";
      if (range && Number(range.value) !== n) range.value = String(n);
      if (onMove) onMove(n);
    }
    if (range) range.addEventListener("input", () => set(range.value));
    set(range ? range.value : 50);
    return { set };
  }

  function waitlistMailto(fields) {
    const name = fields.name || "";
    const email = fields.email || "";
    const interest = fields.interest || "rooms and gardens";
    const subject = encodeURIComponent("Nookshift waitlist");
    const body = encodeURIComponent(
      "Please add me to the Nookshift founding waitlist.\n\nName: " +
      name + "\nReply email: " + email + "\nI want this for: " + interest +
      "\n\nI understand checkout will open through Whop, Paddle or Dodo (processors that can pay a Bermuda seller), and that no payment is taken until I complete checkout."
    );
    return "mailto:" + CONTACT + "?subject=" + subject + "&body=" + body;
  }

  function detectMode(health) {
    if (location.hostname.endsWith("github.io")) return "demo";
    if (health && health.mode === "ai") return "ai";
    return "demo";
  }

  global.Nookshift = {
    CONTACT,
    STYLES,
    SAMPLES,
    styleById,
    restyleCanvas,
    drawSampleToCanvas,
    sampleImage,
    bindCompare,
    waitlistMailto,
    detectMode
  };
})(window);
