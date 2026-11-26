/* Quire — interior / cover PDF generation and spread preview. */
(function (root) {
  const K = () => root.QuireKDP;
  const P = () => root.QuirePrompts;

  function hexRgb(hex) {
    const h = (hex || "#000000").replace("#", "");
    const n = parseInt(h.length === 3 ? h[0]+h[0]+h[1]+h[1]+h[2]+h[2] : h, 16);
    return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
  }

  function pdfColor(hex) {
    const c = hexRgb(hex);
    return root.PDFLib.rgb(c.r, c.g, c.b);
  }

  function slug(s) {
    return String(s || "book")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "book";
  }

  function themeOf(config) {
    return K().THEMES[config.themeId] || K().THEMES.linen;
  }

  function trimOf(config) {
    return K().findTrim(config.trimId);
  }

  /* ---------- drawing adapters (top-down point coordinates) ---------- */

  function pdfAdapter(page, pageH) {
    const { rgb, degrees } = root.PDFLib;
    const flip = (y) => pageH - y;
    return {
      kind: "pdf",
      width: page.getWidth(),
      height: pageH,
      fillRect(x, y, w, h, color, opacity) {
        page.drawRectangle({
          x, y: flip(y) - h, width: w, height: h,
          color: pdfColor(color),
          opacity: opacity == null ? 1 : opacity
        });
      },
      strokeRect(x, y, w, h, color, width) {
        page.drawRectangle({
          x, y: flip(y) - h, width: w, height: h,
          borderColor: pdfColor(color),
          borderWidth: width || 0.8
        });
      },
      line(x1, y1, x2, y2, color, width, dash) {
        page.drawLine({
          start: { x: x1, y: flip(y1) },
          end: { x: x2, y: flip(y2) },
          thickness: width || 0.7,
          color: pdfColor(color),
          dashArray: dash || undefined
        });
      },
      circle(cx, cy, r, color, width, fill) {
        const opts = { x: cx, y: flip(cy), size: r };
        if (fill) opts.color = pdfColor(fill);
        if (color) {
          opts.borderColor = pdfColor(color);
          opts.borderWidth = width || 0.8;
        }
        page.drawCircle(opts);
      },
      polyline(pts, color, width, close) {
        if (!pts || pts.length < 2) return;
        for (let i = 1; i < pts.length; i++) {
          page.drawLine({
            start: { x: pts[i - 1].x, y: flip(pts[i - 1].y) },
            end: { x: pts[i].x, y: flip(pts[i].y) },
            thickness: width || 0.8,
            color: pdfColor(color)
          });
        }
        if (close) {
          const a = pts[pts.length - 1], b = pts[0];
          page.drawLine({
            start: { x: a.x, y: flip(a.y) },
            end: { x: b.x, y: flip(b.y) },
            thickness: width || 0.8,
            color: pdfColor(color)
          });
        }
      },
      text(str, x, y, opts) {
        const size = (opts && opts.size) || 11;
        const font = (opts && opts.font) || this._font;
        const color = pdfColor((opts && opts.color) || "#111111");
        const rotate = opts && opts.rotate;
        // y is the top of the em box in top-down space
        const baseline = flip(y) - size * 0.8;
        const params = { x, y: baseline, size, font, color };
        if (rotate) params.rotate = degrees(rotate);
        page.drawText(String(str), params);
      },
      textWidth(str, size, font) {
        return (font || this._font).widthOfTextAtSize(String(str), size);
      },
      _font: null,
      _fontBold: null
    };
  }

  function canvasAdapter(ctx, pageH, scale) {
    const s = scale || 1;
    return {
      kind: "canvas",
      width: ctx.canvas.width,
      height: pageH,
      fillRect(x, y, w, h, color, opacity) {
        ctx.save();
        ctx.globalAlpha = opacity == null ? 1 : opacity;
        ctx.fillStyle = color;
        ctx.fillRect(x * s, y * s, w * s, h * s);
        ctx.restore();
      },
      strokeRect(x, y, w, h, color, width) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = (width || 0.8) * s;
        ctx.strokeRect(x * s, y * s, w * s, h * s);
        ctx.restore();
      },
      line(x1, y1, x2, y2, color, width, dash) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = (width || 0.7) * s;
        if (dash) ctx.setLineDash(dash.map((d) => d * s));
        ctx.beginPath();
        ctx.moveTo(x1 * s, y1 * s);
        ctx.lineTo(x2 * s, y2 * s);
        ctx.stroke();
        ctx.restore();
      },
      circle(cx, cy, r, color, width, fill) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx * s, cy * s, r * s, 0, Math.PI * 2);
        if (fill) {
          ctx.fillStyle = fill;
          ctx.fill();
        }
        if (color) {
          ctx.strokeStyle = color;
          ctx.lineWidth = (width || 0.8) * s;
          ctx.stroke();
        }
        ctx.restore();
      },
      polyline(pts, color, width, close) {
        if (!pts || pts.length < 2) return;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = (width || 0.8) * s;
        ctx.beginPath();
        ctx.moveTo(pts[0].x * s, pts[0].y * s);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x * s, pts[i].y * s);
        if (close) ctx.closePath();
        ctx.stroke();
        ctx.restore();
      },
      text(str, x, y, opts) {
        const size = (opts && opts.size) || 11;
        ctx.save();
        ctx.fillStyle = (opts && opts.color) || "#111";
        ctx.font = `${(opts && opts.bold) ? "600 " : ""}${size * s}px "Source Serif 4", "Times New Roman", serif`;
        ctx.textBaseline = "top";
        if (opts && opts.rotate) {
          ctx.translate(x * s, y * s);
          ctx.rotate((opts.rotate * Math.PI) / 180);
          ctx.fillText(String(str), 0, 0);
        } else {
          ctx.fillText(String(str), x * s, y * s);
        }
        ctx.restore();
      },
      textWidth(str, size) {
        ctx.save();
        ctx.font = `${size}px "Source Serif 4", "Times New Roman", serif`;
        const w = ctx.measureText(String(str)).width;
        ctx.restore();
        return w;
      }
    };
  }

  /* ---------- shared page chrome ---------- */

  function drawPageNumber(g, layout, config, fontSize) {
    const theme = themeOf(config);
    const size = fontSize || 9;
    const label = String(layout.pageNum);
    const y = (layout.trimRectIn.y + layout.trimRectIn.h - layout.marginsIn.bottom + 0.12) * K().PT;
    // Place the number on the outside of the page
    let x;
    const safe = layout.safePt;
    if (layout.isOdd) {
      const w = g.textWidth ? g.textWidth(label, size, g._font) : size * label.length * 0.5;
      x = safe.x + safe.w - w;
    } else {
      x = safe.x;
    }
    // Footer sits just below the safe area, still inside the trim + outside margin
    const footerY = (layout.sizeIn.h - layout.marginsIn.bottom + 0.08) * K().PT;
    g.text(label, x, footerY - size, { size, color: theme.ink, font: g._font });
  }

  function drawRunningTitle(g, layout, config, size) {
    const theme = themeOf(config);
    const title = (config.title || "").trim();
    if (!title) return;
    const s = size || 8;
    const y = layout.safePt.y - s - 4;
    if (y < layout.trimRectIn.y * K().PT + 4) return;
    const maxW = layout.safePt.w;
    let t = title;
    while (g.textWidth && g.textWidth(t, s, g._font) > maxW && t.length > 4) t = t.slice(0, -2);
    if (t.length < title.length) t = t.slice(0, -1) + "…";
    const w = g.textWidth ? g.textWidth(t, s, g._font) : t.length * s * 0.45;
    const x = layout.isOdd ? layout.safePt.x + layout.safePt.w - w : layout.safePt.x;
    g.text(t, x, Math.max(y, 6), { size: s, color: theme.ink, font: g._font });
  }

  function headerBlock(g, layout, config) {
    drawRunningTitle(g, layout, config, 8);
    drawPageNumber(g, layout, config, 9);
  }

  /* ---------- interiors ---------- */

  function drawTitlePage(g, layout, config) {
    const theme = themeOf(config);
    const { x, y, w, h } = {
      x: layout.safePt.x,
      y: layout.safePt.y,
      w: layout.safePt.w,
      h: layout.safePt.h
    };
    const midX = x + w / 2;
    const title = config.title || "Untitled";
    const sub = config.subtitle || "";
    const author = config.author || "";
    const tSize = Math.min(28, w / Math.max(8, title.length) * 1.8 + 14);
    const tw = g.textWidth ? g.textWidth(title, tSize, g._fontBold || g._font) : title.length * tSize * 0.5;
    g.text(title, midX - tw / 2, y + h * 0.32, { size: tSize, color: theme.ink, font: g._fontBold || g._font, bold: true });
    g.line(midX - Math.min(90, w * 0.25), y + h * 0.32 + tSize + 14, midX + Math.min(90, w * 0.25), y + h * 0.32 + tSize + 14, theme.accent, 0.8);
    if (sub) {
      const sw = g.textWidth ? g.textWidth(sub, 12, g._font) : sub.length * 6;
      g.text(sub, midX - sw / 2, y + h * 0.32 + tSize + 26, { size: 12, color: theme.ink, font: g._font });
    }
    if (author) {
      const aw = g.textWidth ? g.textWidth(author, 13, g._font) : author.length * 7;
      g.text(author, midX - aw / 2, y + h * 0.72, { size: 13, color: theme.ink, font: g._font });
    }
  }

  function drawBelongsPage(g, layout, config) {
    const theme = themeOf(config);
    const x = layout.safePt.x;
    const y = layout.safePt.y;
    const w = layout.safePt.w;
    const h = layout.safePt.h;
    g.text("This book belongs to", x, y + h * 0.28, { size: 12, color: theme.ink, font: g._font });
    g.line(x, y + h * 0.28 + 28, x + w, y + h * 0.28 + 28, theme.rule, 0.8);
    g.line(x, y + h * 0.28 + 56, x + w, y + h * 0.28 + 56, theme.rule, 0.8);
    const notes = [
      "Interior formatted with Quire. Confirm final measurements in Amazon KDP before publishing.",
      "Quire is not affiliated with Amazon or Kindle Direct Publishing.",
      config.aiUsed
        ? "This file includes AI-generated text or images. Disclose that when you publish on KDP."
        : "Demo layouts use ruled pages and/or procedural line art, not a generative model."
    ];
    let ny = y + h * 0.58;
    notes.forEach((line) => {
      wrapText(line, w, 9, g).forEach((row) => {
        g.text(row, x, ny, { size: 9, color: theme.ink, font: g._font });
        ny += 13;
      });
      ny += 8;
    });
    drawPageNumber(g, layout, config, 9);
  }

  function wrapText(text, maxW, size, g) {
    const words = String(text).split(/\s+/);
    const lines = [];
    let cur = "";
    const width = (s) => (g.textWidth ? g.textWidth(s, size, g._font) : s.length * size * 0.5);
    words.forEach((word) => {
      const next = cur ? cur + " " + word : word;
      if (width(next) > maxW && cur) {
        lines.push(cur);
        cur = word;
      } else cur = next;
    });
    if (cur) lines.push(cur);
    return lines;
  }

  function drawLined(g, layout, config, prompt) {
    const theme = themeOf(config);
    headerBlock(g, layout, config);
    const x = layout.safePt.x;
    let y = layout.safePt.y + 6;
    const w = layout.safePt.w;
    const bottom = layout.safePt.y + layout.safePt.h - 8;
    const spacing = K().lineSpacingInches(config.lineStyle || "college") * K().PT;

    if (config.type === "prompt" || prompt) {
      const text = prompt || P().promptFor(layout.pageNum, config.promptTheme || "gratitude", config.title || "quire");
      const lines = wrapText(text, w, 12, g);
      lines.forEach((row) => {
        g.text(row, x, y, { size: 12, color: theme.ink, font: g._fontItalic || g._font });
        y += 16;
      });
      y += 8;
    } else {
      // Date line
      g.text("Date", x, y, { size: 9, color: theme.ink, font: g._font });
      const dw = g.textWidth ? g.textWidth("Date", 9, g._font) : 24;
      g.line(x + dw + 8, y + 10, x + w, y + 10, theme.rule, 0.6);
      y += 22;
    }

    const lineColor = theme.rule;
    for (let ly = y + spacing; ly <= bottom; ly += spacing) {
      g.line(x, ly, x + w, ly, lineColor, 0.55);
    }
  }

  function drawDotsOrGraph(g, layout, config, kind) {
    const theme = themeOf(config);
    headerBlock(g, layout, config);
    const x = layout.safePt.x;
    const y = layout.safePt.y + 4;
    const w = layout.safePt.w;
    const h = layout.safePt.h - 10;
    const step = (kind === "graph" ? 0.25 : 5 / 25.4) * K().PT;
    const color = theme.rule;
    if (kind === "graph") {
      for (let gx = x; gx <= x + w + 0.01; gx += step) g.line(gx, y, gx, y + h, color, 0.35);
      for (let gy = y; gy <= y + h + 0.01; gy += step) g.line(x, gy, x + w, gy, color, 0.35);
    } else {
      const r = 0.55;
      for (let gy = y; gy <= y + h; gy += step) {
        for (let gx = x; gx <= x + w; gx += step) {
          g.circle(gx, gy, r, null, 0, color);
        }
      }
    }
  }

  function drawDaily(g, layout, config) {
    const theme = themeOf(config);
    headerBlock(g, layout, config);
    const x = layout.safePt.x;
    let y = layout.safePt.y;
    const w = layout.safePt.w;
    const h = layout.safePt.h;
    g.text("Date", x, y, { size: 10, color: theme.ink, font: g._font });
    g.line(x + 32, y + 11, x + w * 0.55, y + 11, theme.rule, 0.7);
    g.text("Day", x + w * 0.58, y, { size: 10, color: theme.ink, font: g._font });
    g.line(x + w * 0.58 + 26, y + 11, x + w, y + 11, theme.rule, 0.7);
    y += 22;
    g.line(x, y, x + w, y, theme.accent, 0.8);
    y += 10;

    const colW = w * 0.62;
    const sideX = x + colW + 10;
    const sideW = w - colW - 10;
    g.text("Schedule", x, y, { size: 9, color: theme.accent, font: g._fontBold || g._font, bold: true });
    g.text("Priorities", sideX, y, { size: 9, color: theme.accent, font: g._fontBold || g._font, bold: true });
    y += 16;

    const hours = ["6", "7", "8", "9", "10", "11", "12", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const rowH = Math.min(22, (h - 90) / hours.length);
    hours.forEach((hr, i) => {
      const ly = y + i * rowH;
      g.text(hr, x, ly, { size: 8, color: theme.ink, font: g._font });
      g.line(x + 18, ly + 10, x + colW, ly + 10, theme.rule, 0.5);
    });

    const boxTop = y;
    const pH = rowH * 6;
    for (let i = 0; i < 5; i++) {
      g.strokeRect(sideX, boxTop + i * (18), 10, 10, theme.rule, 0.7);
      g.line(sideX + 16, boxTop + i * 18 + 10, sideX + sideW, boxTop + i * 18 + 10, theme.rule, 0.5);
    }
    const notesY = boxTop + 5 * 18 + 16;
    g.text("Notes", sideX, notesY, { size: 9, color: theme.accent, font: g._fontBold || g._font, bold: true });
    const nBottom = layout.safePt.y + h - 6;
    for (let ly = notesY + 22; ly < nBottom; ly += 16) {
      g.line(sideX, ly, sideX + sideW, ly, theme.rule, 0.5);
    }
  }

  function drawWeekly(g, layout, config) {
    const theme = themeOf(config);
    headerBlock(g, layout, config);
    const x = layout.safePt.x;
    let y = layout.safePt.y;
    const w = layout.safePt.w;
    const h = layout.safePt.h;
    y += 6;
    g.text("Week of", x, y, { size: 10, color: theme.ink, font: g._font });
    g.line(x + 48, y + 11, x + w * 0.7, y + 11, theme.rule, 0.7);
    y += 24;

    const leftDays = ["Monday", "Tuesday", "Wednesday", "Thursday"];
    const rightDays = ["Friday", "Saturday", "Sunday"];
    const days = layout.isOdd ? rightDays : leftDays;
    const extra = layout.isOdd;

    const dayCount = days.length + (extra ? 1 : 0);
    const blockH = (h - 28) / dayCount;

    days.forEach((day, i) => {
      const by = y + i * blockH;
      g.text(day, x, by, { size: 10, color: theme.accent, font: g._fontBold || g._font, bold: true });
      g.line(x, by + 14, x + w, by + 14, theme.accent, 0.6);
      for (let ly = by + 30; ly < by + blockH - 8; ly += 14) {
        g.line(x, ly, x + w, ly, theme.rule, 0.45);
      }
    });
    if (extra) {
      const by = y + days.length * blockH;
      g.text("Notes & habits", x, by, { size: 10, color: theme.accent, font: g._fontBold || g._font, bold: true });
      g.line(x, by + 14, x + w, by + 14, theme.accent, 0.6);
      for (let ly = by + 30; ly < by + blockH - 8; ly += 14) {
        g.line(x, ly, x + w, ly, theme.rule, 0.45);
      }
    }
  }

  function drawHabit(g, layout, config) {
    const theme = themeOf(config);
    headerBlock(g, layout, config);
    const x = layout.safePt.x;
    let y = layout.safePt.y;
    const w = layout.safePt.w;
    const h = layout.safePt.h;
    // Alternate grid and review pages
    const contentIndex = contentPageIndex(config, layout.pageNum);
    const isReview = contentIndex % 2 === 1;

    if (!isReview) {
      g.text("Month", x, y, { size: 11, color: theme.ink, font: g._font });
      g.line(x + 42, y + 12, x + w * 0.6, y + 12, theme.rule, 0.7);
      y += 24;
      const habitLabelW = Math.min(90, w * 0.28);
      const days = 31;
      const cell = Math.min(16, (w - habitLabelW) / days);
      const rows = Math.min(10, Math.floor((h - 50) / 22));
      g.text("Habit", x, y, { size: 8, color: theme.accent, font: g._font });
      for (let d = 1; d <= days; d++) {
        const dx = x + habitLabelW + (d - 1) * cell;
        g.text(String(d), dx + 1, y, { size: 6, color: theme.ink, font: g._font });
      }
      y += 14;
      for (let r = 0; r < rows; r++) {
        const ry = y + r * 20;
        g.line(x, ry + 14, x + habitLabelW - 4, ry + 14, theme.rule, 0.5);
        for (let d = 0; d < days; d++) {
          g.strokeRect(x + habitLabelW + d * cell, ry, cell - 2, 14, theme.rule, 0.45);
        }
      }
    } else {
      g.text("Monthly review", x, y, { size: 13, color: theme.ink, font: g._fontBold || g._font, bold: true });
      y += 22;
      const prompts = [
        "What went well?",
        "What got in the way?",
        "Which habit will you keep, change, or drop?",
        "Notes"
      ];
      const block = (h - 30) / prompts.length;
      prompts.forEach((p, i) => {
        const by = y + i * block;
        g.text(p, x, by, { size: 10, color: theme.accent, font: g._font });
        for (let ly = by + 22; ly < by + block - 8; ly += 16) g.line(x, ly, x + w, ly, theme.rule, 0.5);
      });
    }
  }

  function drawRecipe(g, layout, config) {
    const theme = themeOf(config);
    headerBlock(g, layout, config);
    const x = layout.safePt.x;
    let y = layout.safePt.y;
    const w = layout.safePt.w;
    const h = layout.safePt.h;
    const idx = contentPageIndex(config, layout.pageNum);
    if (idx < 2) {
      g.text(idx === 0 ? "Recipe index" : "Recipe index, continued", x, y, { size: 14, color: theme.ink, font: g._fontBold || g._font, bold: true });
      y += 22;
      g.text("Recipe", x, y, { size: 8, color: theme.accent, font: g._font });
      g.text("Page", x + w - 30, y, { size: 8, color: theme.accent, font: g._font });
      y += 14;
      for (let ly = y; ly < layout.safePt.y + h - 6; ly += 20) {
        g.line(x, ly, x + w - 40, ly, theme.rule, 0.5);
        g.line(x + w - 32, ly, x + w, ly, theme.rule, 0.5);
      }
      return;
    }
    g.text("Recipe", x, y, { size: 10, color: theme.accent, font: g._font });
    g.line(x + 48, y + 12, x + w, y + 12, theme.rule, 0.7);
    y += 24;
    const meta = ["Servings", "Time", "Source"];
    meta.forEach((m, i) => {
      const mx = x + (w / 3) * i;
      g.text(m, mx, y, { size: 8, color: theme.ink, font: g._font });
      g.line(mx + 42, y + 10, mx + w / 3 - 8, y + 10, theme.rule, 0.5);
    });
    y += 26;
    const col = w * 0.38;
    g.text("Ingredients", x, y, { size: 10, color: theme.accent, font: g._fontBold || g._font, bold: true });
    g.text("Method", x + col + 12, y, { size: 10, color: theme.accent, font: g._fontBold || g._font, bold: true });
    y += 16;
    const bottom = layout.safePt.y + h - 36;
    for (let ly = y; ly < bottom; ly += 16) {
      g.line(x, ly, x + col, ly, theme.rule, 0.45);
      g.line(x + col + 12, ly, x + w, ly, theme.rule, 0.45);
    }
    g.text("Notes", x, bottom + 4, { size: 9, color: theme.accent, font: g._font });
    g.line(x, bottom + 22, x + w, bottom + 22, theme.rule, 0.45);
  }

  function drawLog(g, layout, config) {
    const theme = themeOf(config);
    headerBlock(g, layout, config);
    const x = layout.safePt.x;
    let y = layout.safePt.y;
    const w = layout.safePt.w;
    const h = layout.safePt.h;
    const entryH = Math.max(110, h / 3);
    const count = Math.max(1, Math.floor(h / entryH));
    for (let i = 0; i < count; i++) {
      const ey = y + i * entryH;
      g.text("Date", x, ey, { size: 9, color: theme.ink, font: g._font });
      g.line(x + 30, ey + 10, x + w * 0.4, ey + 10, theme.rule, 0.6);
      g.text("Subject", x + w * 0.43, ey, { size: 9, color: theme.ink, font: g._font });
      g.line(x + w * 0.43 + 48, ey + 10, x + w, ey + 10, theme.rule, 0.6);
      g.text("Time / units", x, ey + 20, { size: 9, color: theme.ink, font: g._font });
      g.line(x + 68, ey + 30, x + w * 0.5, ey + 30, theme.rule, 0.6);
      for (let ly = ey + 52; ly < ey + entryH - 12; ly += 16) {
        g.line(x, ly, x + w, ly, theme.rule, 0.45);
      }
    }
  }

  /* ---------- coloring art ---------- */

  function drawColoringPage(g, layout, config) {
    const theme = themeOf(config);
    const artIndex = coloringArtIndex(config, layout.pageNum);
    const blankBack = config.singleSidedArt !== false && !layout.isOdd && hasFrontMatter(config)
      ? true
      : config.singleSidedArt !== false && layout.pageNum % 2 === 0 && !hasFrontMatter(config);

    // After front matter, even pages are backs
    if (config.singleSidedArt !== false && isColoringBack(config, layout.pageNum)) {
      const x = layout.safePt.x;
      const y = layout.safePt.y + layout.safePt.h * 0.45;
      const msg = "This side left blank to reduce show-through.";
      const w = g.textWidth ? g.textWidth(msg, 9, g._font) : 200;
      g.text(msg, x + (layout.safePt.w - w) / 2, y, { size: 9, color: theme.rule, font: g._font });
      drawPageNumber(g, layout, config, 9);
      return;
    }

    // Art can go into the bleed but keep primary structure in the safe-ish area
    const pad = 6;
    const box = {
      x: layout.trimRectIn.x * K().PT + pad,
      y: layout.trimRectIn.y * K().PT + pad,
      w: layout.trimRectIn.w * K().PT - pad * 2,
      h: layout.trimRectIn.h * K().PT - pad * 2
    };
    // Prefer the safe area for the main motif so nothing important is trimmed
    const safe = {
      x: layout.safePt.x,
      y: layout.safePt.y + 6,
      w: layout.safePt.w,
      h: layout.safePt.h - 16
    };
    const seed = P().hashString(`${config.title}|${config.themeId}|${artIndex}|${config.type}`);
    const rng = P().mulberry32(seed);
    const style = Math.floor(rng() * 3);
    if (style === 0) drawMandala(g, safe, rng, theme);
    else if (style === 1) drawBotanical(g, safe, rng, theme);
    else drawGeometric(g, safe, rng, theme);
    drawPageNumber(g, layout, config, 8);
  }

  function hasFrontMatter(config) {
    return config.includeFrontMatter !== false;
  }

  function contentPageIndex(config, pageNum) {
    return hasFrontMatter(config) ? pageNum - 2 : pageNum;
  }

  function isColoringBack(config, pageNum) {
    if (config.singleSidedArt === false) return false;
    const idx = contentPageIndex(config, pageNum);
    if (idx < 1) return false;
    // content index 1,3,5... art; 2,4,6... backs (1-based content after front matter)
    // After 2 front-matter pages, page 3 is first art (odd overall, contentIndex 1)
    return idx % 2 === 0;
  }

  function coloringArtIndex(config, pageNum) {
    const idx = contentPageIndex(config, pageNum);
    return Math.max(1, Math.ceil(idx / (config.singleSidedArt === false ? 1 : 2)));
  }

  function drawMandala(g, box, rng, theme) {
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    const rMax = Math.min(box.w, box.h) * 0.46;
    const folds = [6, 8, 10, 12, 16][Math.floor(rng() * 5)];
    const rings = 4 + Math.floor(rng() * 3);
    const ink = "#111111";
    g.circle(cx, cy, rMax, ink, 1.1);
    g.circle(cx, cy, rMax * 0.08, ink, 0.8);
    for (let ring = 1; ring <= rings; ring++) {
      const r = (rMax / (rings + 1)) * ring;
      g.circle(cx, cy, r, ink, 0.6);
      const petals = folds * (rng() > 0.5 ? 1 : 2);
      for (let i = 0; i < petals; i++) {
        const a0 = (i / petals) * Math.PI * 2 + (ring % 2 ? Math.PI / petals : 0);
        const a1 = a0 + (Math.PI * 2) / petals;
        const mid = (a0 + a1) / 2;
        const rInner = r * (0.55 + rng() * 0.2);
        const rOuter = Math.min(rMax * 0.98, r + rMax / (rings + 2) * (0.7 + rng() * 0.6));
        const pts = [
          { x: cx + Math.cos(a0) * rInner, y: cy + Math.sin(a0) * rInner },
          { x: cx + Math.cos(mid) * rOuter, y: cy + Math.sin(mid) * rOuter },
          { x: cx + Math.cos(a1) * rInner, y: cy + Math.sin(a1) * rInner }
        ];
        g.polyline(pts, ink, 0.7, false);
        if (rng() > 0.4) {
          g.circle(cx + Math.cos(mid) * r, cy + Math.sin(mid) * r, 3 + rng() * 5, ink, 0.6);
        }
      }
    }
    // radial lines
    if (rng() > 0.3) {
      for (let i = 0; i < folds; i++) {
        const a = (i / folds) * Math.PI * 2;
        g.line(cx + Math.cos(a) * rMax * 0.1, cy + Math.sin(a) * rMax * 0.1, cx + Math.cos(a) * rMax, cy + Math.sin(a) * rMax, ink, 0.5);
      }
    }
  }

  function drawBotanical(g, box, rng, theme) {
    const ink = "#111111";
    const stems = 3 + Math.floor(rng() * 4);
    for (let s = 0; s < stems; s++) {
      const x0 = box.x + box.w * (0.15 + rng() * 0.7);
      const y0 = box.y + box.h * 0.92;
      const x1 = box.x + box.w * (0.1 + rng() * 0.8);
      const y1 = box.y + box.h * (0.12 + rng() * 0.25);
      const steps = 18;
      const pts = [];
      const bow = (rng() - 0.5) * box.w * 0.25;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = x0 + (x1 - x0) * t + Math.sin(t * Math.PI) * bow;
        const y = y0 + (y1 - y0) * t;
        pts.push({ x, y });
      }
      g.polyline(pts, ink, 1.0, false);
      const leaves = 6 + Math.floor(rng() * 6);
      for (let i = 3; i < steps - 1; i += Math.max(1, Math.floor(steps / leaves))) {
        const p = pts[i];
        const p2 = pts[i - 1];
        const ang = Math.atan2(p.y - p2.y, p.x - p2.x);
        const side = i % 2 === 0 ? 1 : -1;
        const len = 14 + rng() * 28;
        const a = ang + side * (0.7 + rng() * 0.6);
        const tip = { x: p.x + Math.cos(a) * len, y: p.y + Math.sin(a) * len };
        const mid1 = {
          x: p.x + Math.cos(a) * len * 0.5 + Math.cos(a + 1.2) * (5 + rng() * 8),
          y: p.y + Math.sin(a) * len * 0.5 + Math.sin(a + 1.2) * (5 + rng() * 8)
        };
        const mid2 = {
          x: p.x + Math.cos(a) * len * 0.5 + Math.cos(a - 1.2) * (5 + rng() * 8),
          y: p.y + Math.sin(a) * len * 0.5 + Math.sin(a - 1.2) * (5 + rng() * 8)
        };
        g.polyline([p, mid1, tip, mid2, p], ink, 0.7, true);
        g.line(p.x, p.y, tip.x, tip.y, ink, 0.45);
      }
      if (rng() > 0.4) {
        const tip = pts[pts.length - 1];
        const petals = 5 + Math.floor(rng() * 5);
        const pr = 8 + rng() * 14;
        for (let i = 0; i < petals; i++) {
          const a = (i / petals) * Math.PI * 2;
          g.circle(tip.x + Math.cos(a) * pr * 0.6, tip.y + Math.sin(a) * pr * 0.6, pr * 0.45, ink, 0.7);
        }
        g.circle(tip.x, tip.y, pr * 0.25, ink, 0.8);
      }
    }
    g.strokeRect(box.x + 4, box.y + 4, box.w - 8, box.h - 8, ink, 0.6);
  }

  function drawGeometric(g, box, rng, theme) {
    const ink = "#111111";
    g.strokeRect(box.x + 2, box.y + 2, box.w - 4, box.h - 4, ink, 0.9);
    const kind = Math.floor(rng() * 3);
    if (kind === 0) {
      // star lattice
      const cols = 3 + Math.floor(rng() * 3);
      const rows = 4 + Math.floor(rng() * 3);
      const gw = box.w / (cols + 1);
      const gh = box.h / (rows + 1);
      const points = 5 + Math.floor(rng() * 4);
      const r = Math.min(gw, gh) * 0.38;
      for (let row = 1; row <= rows; row++) {
        for (let col = 1; col <= cols; col++) {
          const cx = box.x + gw * col;
          const cy = box.y + gh * row;
          const pts = [];
          for (let i = 0; i < points * 2; i++) {
            const a = -Math.PI / 2 + (i * Math.PI) / points;
            const rr = i % 2 === 0 ? r : r * 0.45;
            pts.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr });
          }
          g.polyline(pts, ink, 0.7, true);
        }
      }
    } else if (kind === 1) {
      // concentric polygons plus corner fans
      const cx = box.x + box.w / 2;
      const cy = box.y + box.h / 2;
      const sides = [5, 6, 8, 12][Math.floor(rng() * 4)];
      const maxR = Math.min(box.w, box.h) * 0.42;
      for (let k = 1; k <= 6; k++) {
        const r = (maxR / 6) * k;
        const pts = [];
        const rot = (k % 2) * (Math.PI / sides);
        for (let i = 0; i < sides; i++) {
          const a = rot + (i / sides) * Math.PI * 2;
          pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
        }
        g.polyline(pts, ink, 0.7, true);
      }
    } else {
      // overlapping circles ( overlapping rings )
      const n = 8 + Math.floor(rng() * 8);
      for (let i = 0; i < n; i++) {
        const cx = box.x + box.w * (0.15 + rng() * 0.7);
        const cy = box.y + box.h * (0.15 + rng() * 0.7);
        const r = Math.min(box.w, box.h) * (0.08 + rng() * 0.22);
        g.circle(cx, cy, r, ink, 0.7);
      }
    }
  }

  function drawFrontOrContent(g, layout, config, extraPrompts) {
    if (hasFrontMatter(config) && layout.pageNum === 1) return drawTitlePage(g, layout, config);
    if (hasFrontMatter(config) && layout.pageNum === 2) return drawBelongsPage(g, layout, config);
    const type = config.type;
    if (type === "coloring") return drawColoringPage(g, layout, config);
    if (type === "dot") return drawDotsOrGraph(g, layout, config, "dot");
    if (type === "graph") return drawDotsOrGraph(g, layout, config, "graph");
    if (type === "daily") return drawDaily(g, layout, config);
    if (type === "weekly") return drawWeekly(g, layout, config);
    if (type === "habit") return drawHabit(g, layout, config);
    if (type === "recipe") return drawRecipe(g, layout, config);
    if (type === "log") return drawLog(g, layout, config);
    const prompt = type === "prompt"
      ? (extraPrompts && extraPrompts[layout.pageNum]) || P().promptFor(layout.pageNum, config.promptTheme || "gratitude", config.title || "quire")
      : null;
    return drawLined(g, layout, config, prompt);
  }

  /* ---------- PDF build ---------- */

  async function buildInteriorPdf(config, options) {
    const { PDFDocument, StandardFonts } = root.PDFLib;
    const trim = trimOf(config);
    const pages = Number(config.pageCount) || 24;
    const bleed = !!config.bleed;
    const doc = await PDFDocument.create();
    doc.setTitle(config.title || "Interior");
    doc.setAuthor(config.author || "");
    doc.setCreator("Quire — KDP interior studio (demo)");
    doc.setProducer("Quirepress");
    const font = await doc.embedFont(StandardFonts.TimesRoman);
    const fontBold = await doc.embedFont(StandardFonts.TimesRomanBold);
    const fontItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);
    const extraPrompts = (options && options.prompts) || null;

    for (let n = 1; n <= pages; n++) {
      const layout = K().pageLayout(trim, pages, bleed, n);
      const page = doc.addPage([layout.sizePt.w, layout.sizePt.h]);
      const g = pdfAdapter(page, layout.sizePt.h);
      g._font = font;
      g._fontBold = fontBold;
      g._fontItalic = fontItalic;
      drawFrontOrContent(g, layout, config, extraPrompts);
    }

    if (!(options && options.paid)) {
      const last = doc.getPages()[pages - 1];
      const layout = K().pageLayout(trim, pages, bleed, pages);
      last.drawText("Created with the Quire demo. Confirm specs in KDP before publishing.", {
        x: layout.safePt.x,
        y: 18,
        size: 7,
        font,
        color: pdfColor("#666666")
      });
    }

    const bytes = await doc.save();
    return { bytes, filename: `${slug(config.title)}-interior-${trim.id}-${pages}p.pdf` };
  }

  async function buildCoverPdf(config) {
    const { PDFDocument, StandardFonts, degrees, rgb } = root.PDFLib;
    const trim = trimOf(config);
    const pages = Number(config.pageCount) || 24;
    const cover = K().coverSizeInches(trim, pages, config.paperId);
    const theme = themeOf(config);
    const doc = await PDFDocument.create();
    doc.setTitle((config.title || "Cover") + " — cover wrap");
    doc.setAuthor(config.author || "");
    doc.setCreator("Quire — KDP cover studio (demo)");
    const font = await doc.embedFont(StandardFonts.TimesRoman);
    const fontBold = await doc.embedFont(StandardFonts.TimesRomanBold);
    const fontItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);
    const w = cover.w * K().PT;
    const h = cover.h * K().PT;
    const page = doc.addPage([w, h]);
    const bleed = K().BLEED_IN * K().PT;
    const spineW = cover.spine * K().PT;
    const trimW = trim.w * K().PT;
    const trimH = trim.h * K().PT;

    const inkIsLight = contrastInk(theme.cover);
    const ink = inkIsLight ? "#F6F1EA" : "#161310";
    const mute = inkIsLight ? "#E4D9CC" : "#3A322C";

    page.drawRectangle({ x: 0, y: 0, width: w, height: h, color: pdfColor(theme.cover) });

    // Subtle geometric decoration on front and back, kept out of barcode and spine folds
    const backX = bleed;
    const spineX = bleed + trimW;
    const frontX = spineX + spineW;
    const trimY = bleed;

    // Decorative rules on front
    const inset = 0.35 * K().PT; // 0.25" safe + a little
    const fx = frontX + inset;
    const fy = trimY + inset;
    const fw = trimW - inset * 2;
    const fh = trimH - inset * 2;
    page.drawRectangle({
      x: fx, y: fy, width: fw, height: fh,
      borderColor: pdfColor(ink),
      borderWidth: 0.8
    });
    page.drawRectangle({
      x: fx + 8, y: fy + 8, width: fw - 16, height: fh - 16,
      borderColor: pdfColor(ink),
      borderWidth: 0.5
    });

    const title = config.title || "Untitled";
    const subtitle = config.subtitle || "";
    const author = config.author || "";

    function widthOf(str, size, f) {
      return f.widthOfTextAtSize(str, size);
    }
    function fitSize(str, f, maxW, start) {
      let size = start;
      while (size > 12 && widthOf(str, size, f) > maxW) size -= 1;
      return size;
    }

    const tSize = fitSize(title, fontBold, fw - 24, 36);
    const tw = widthOf(title, tSize, fontBold);
    page.drawText(title, {
      x: fx + (fw - tw) / 2,
      y: fy + fh * 0.58,
      size: tSize,
      font: fontBold,
      color: pdfColor(ink)
    });
    if (subtitle) {
      const sSize = fitSize(subtitle, fontItalic, fw - 36, 14);
      const sw = widthOf(subtitle, sSize, fontItalic);
      page.drawText(subtitle, {
        x: fx + (fw - sw) / 2,
        y: fy + fh * 0.58 - tSize - 10,
        size: sSize,
        font: fontItalic,
        color: pdfColor(ink)
      });
    }
    if (author) {
      const aSize = 13;
      const aw = widthOf(author, aSize, font);
      page.drawText(author, {
        x: fx + (fw - aw) / 2,
        y: fy + fh * 0.18,
        size: aSize,
        font,
        color: pdfColor(ink)
      });
    }

    // Back cover blurb
    const listing = P().listingFor(config.type, config);
    const bx = backX + inset;
    const by = trimY + inset;
    const bw = trimW - inset * 2;
    const bh = trimH - inset * 2;
    page.drawRectangle({
      x: bx, y: by, width: bw, height: bh,
      borderColor: pdfColor(ink),
      borderWidth: 0.6
    });
    // Barcode reserve: 2.00 x 1.20 in at bottom-right of back (near the spine)
    const barW = 2 * K().PT;
    const barH = 1.2 * K().PT;
    const barPad = 0.25 * K().PT;
    const barX = spineX - barPad - barW;
    const barY = trimY + barPad;
    page.drawRectangle({
      x: barX, y: barY, width: barW, height: barH,
      color: root.PDFLib.rgb(1, 1, 1),
      borderColor: pdfColor(mute),
      borderWidth: 0.4
    });
    const barLabel = "KDP barcode";
    const blw = widthOf(barLabel, 7, font);
    page.drawText(barLabel, {
      x: barX + (barW - blw) / 2,
      y: barY + barH / 2 - 3,
      size: 7,
      font,
      color: pdfColor("#888888")
    });

    const blurbSize = 10;
    const blurb = listing.description;
    const words = blurb.split(/\s+/);
    const lines = [];
    let cur = "";
    words.forEach((word) => {
      const next = cur ? cur + " " + word : word;
      if (widthOf(next, blurbSize, font) > bw - 24 && cur) {
        lines.push(cur);
        cur = word;
      } else cur = next;
    });
    if (cur) lines.push(cur);
    let ty = by + bh - 36;
    const maxBlurbY = barY + barH + 16;
    lines.forEach((line) => {
      if (ty < maxBlurbY) return;
      page.drawText(line, { x: bx + 12, y: ty, size: blurbSize, font, color: pdfColor(ink) });
      ty -= 14;
    });

    // Spine
    if (pages > 79 && spineW > 0.0625 * 2 * K().PT + 4) {
      const clear = 0.0625 * K().PT;
      const spineText = [title, author].filter(Boolean).join("   ·   ");
      const sSize = Math.min(11, Math.max(7, spineW - clear * 2 - 2));
      const sw = widthOf(spineText, sSize, font);
      const maxSpine = trimH - clear * 2;
      let label = spineText;
      if (sw > maxSpine) {
        while (widthOf(label + "…", sSize, font) > maxSpine && label.length > 4) label = label.slice(0, -1);
        label += "…";
      }
      const textW = widthOf(label, sSize, font);
      page.drawText(label, {
        x: spineX + spineW / 2 - sSize * 0.35,
        y: bleed + (trimH - textW) / 2,
        size: sSize,
        font,
        color: pdfColor(ink),
        rotate: degrees(90)
      });
    }

    const bytes = await doc.save();
    return { bytes, filename: `${slug(config.title)}-cover-${trim.id}-${pages}p.pdf` };
  }

  function contrastInk(hex) {
    const c = hexRgb(hex);
    const L = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
    return L < 0.45;
  }

  function listingPack(config, report) {
    const listing = P().listingFor(config.type, config);
    const trim = trimOf(config);
    const pages = Number(config.pageCount) || 0;
    const bleed = !!config.bleed;
    const size = K().interiorPageSizeInches(trim, bleed);
    const cover = K().coverSizeInches(trim, pages, config.paperId);
    const paper = K().PAPER[config.paperId] || K().PAPER.white;
    const typeMeta = K().BOOK_TYPES.find((t) => t.id === config.type);
    const lines = [];
    lines.push(`QUIRE LISTING AND SPEC PACK`);
    lines.push(`Generated in demo mode. Confirm every number in Amazon KDP before you publish.`);
    lines.push(`Quire is not affiliated with Amazon or Kindle Direct Publishing.`);
    lines.push("");
    lines.push(`TITLE`);
    lines.push(listing.title);
    lines.push("");
    lines.push(`SUBTITLE`);
    lines.push(listing.subtitle || "(none)");
    lines.push("");
    lines.push(`AUTHOR`);
    lines.push(listing.author);
    lines.push("");
    lines.push(`DESCRIPTION`);
    lines.push(listing.description);
    lines.push("");
    lines.push(`BULLET POINTS`);
    listing.bullets.forEach((b, i) => lines.push(`${i + 1}. ${b}`));
    lines.push("");
    lines.push(`BACKEND KEYWORDS (seven-keyword style, comma separated)`);
    lines.push(listing.keywords);
    lines.push("");
    lines.push(`AI DISCLOSURE NOTES`);
    lines.push(listing.aiDisclosure);
    lines.push("KDP requires disclosure of AI-generated text, images, or translations.");
    lines.push("You do not need to disclose mere AI-assisted editing of text you wrote yourself.");
    lines.push("Source: https://kdp.amazon.com/en_US/help/topic/G200672390");
    lines.push("");
    lines.push(`WEEKLY TITLE LIMIT`);
    lines.push("KDP allows up to 2 new title creations and 2 first submissions per format per week,");
    lines.push("resetting Sunday 00:00 UTC. Source: https://kdp.amazon.com/en_US/help/topic/G202172740");
    lines.push("");
    lines.push(`INTERIOR FILE`);
    lines.push(`Type: ${typeMeta ? typeMeta.label : config.type}`);
    lines.push(`Trim: ${trim.w} × ${trim.h} in`);
    lines.push(`Bleed: ${bleed ? "yes (page size " + size.w.toFixed(3) + " × " + size.h.toFixed(3) + " in)" : "no (page size equals trim)"}`);
    lines.push(`Page count: ${pages}`);
    lines.push(`Inside (gutter) margin: ${K().gutterInches(pages).toFixed(3)} in`);
    lines.push(`Outside margin: ${K().outsideMarginInches(bleed).toFixed(3)} in`);
    lines.push(`Paper / ink: ${paper.label} (spine factor ${paper.perPage} in/page)`);
    lines.push(`Single pages, not spreads. No crop marks in the interior file.`);
    lines.push("");
    lines.push(`COVER FILE`);
    lines.push(`Full wrap: ${cover.w.toFixed(3)} × ${cover.h.toFixed(3)} in`);
    lines.push(`Spine width: ${cover.spine.toFixed(4)} in`);
    lines.push(`Spine text: ${pages > 79 ? "included, with 0.0625 in clearance" : "omitted (79 pages or fewer)"}`);
    lines.push(`Barcode reserve: 2.00 × 1.20 in, bottom-right of the back cover`);
    lines.push("");
    lines.push(`COMPLIANCE CHECK`);
    (report ? report.issues : K().validate(config).issues).forEach((i) => {
      lines.push(`[${i.level.toUpperCase()}] ${i.text}`);
    });
    lines.push("");
    lines.push(`CONTACT`);
    lines.push("Waitlist and questions: timwvedco+quirepress@gmail.com");
    lines.push("");
    return {
      text: lines.join("\n"),
      filename: `${slug(config.title)}-kdp-listing-and-specs.txt`
    };
  }

  function downloadBytes(bytes, filename, mime) {
    const blob = new Blob([bytes], { type: mime || "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return blob;
  }

  function downloadText(text, filename) {
    return downloadBytes(new TextEncoder().encode(text), filename, "text/plain");
  }

  /* ---------- canvas spread preview ---------- */

  function paintSpread(canvas, config, leftPageNum, flags) {
    const ctx = canvas.getContext("2d");
    const trim = trimOf(config);
    const pages = Number(config.pageCount) || 24;
    const bleed = !!config.bleed;
    let leftNum, rightNum;
    if (leftPageNum <= 1) {
      leftNum = 0; // opening blank (page 1 is a right-hand page)
      rightNum = 1;
    } else {
      leftNum = leftPageNum % 2 === 0 ? leftPageNum : leftPageNum - 1;
      if (leftNum < 2) leftNum = 2;
      if (leftNum > pages) leftNum = pages - (pages % 2 === 1 ? 1 : 0);
      rightNum = leftNum + 1;
    }
    const showLeft = leftNum >= 1;
    const showRight = rightNum <= pages;
    const L = showLeft ? K().pageLayout(trim, pages, bleed, leftNum) : K().pageLayout(trim, pages, bleed, 2);
    const R = showRight ? K().pageLayout(trim, pages, bleed, rightNum) : L;
    const theme = themeOf(config);

    const gap = 16;
    const pad = 36;
    const cssW = canvas.clientWidth || 800;
    const cssH = canvas.clientHeight || 520;
    const dpr = Math.min(2, (typeof window !== "undefined" && window.devicePixelRatio) || 1);
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const totalW = L.sizePt.w + (showRight ? R.sizePt.w : 0) + gap;
    const totalH = Math.max(L.sizePt.h, R.sizePt.h);
    const scale = Math.min((cssW - pad * 2) / totalW, (cssH - pad * 2) / totalH);
    const originX = (cssW - totalW * scale) / 2;
    const originY = (cssH - totalH * scale) / 2;

    ctx.fillStyle = "#E8E2D8";
    ctx.fillRect(0, 0, cssW, cssH);

    function paintOne(layout, ox) {
      ctx.save();
      ctx.translate(ox, originY);
      // Shadow
      ctx.fillStyle = "rgba(28,22,18,0.10)";
      ctx.fillRect(4, 6, layout.sizePt.w * scale, layout.sizePt.h * scale);
      // Paper
      ctx.fillStyle = theme.paper;
      ctx.fillRect(0, 0, layout.sizePt.w * scale, layout.sizePt.h * scale);
      ctx.strokeStyle = "#B8AFA0";
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, layout.sizePt.w * scale - 1, layout.sizePt.h * scale - 1);

      // Bleed tint
      if (layout.bleed) {
        ctx.fillStyle = "rgba(168, 91, 50, 0.10)";
        // top, bottom, outside
        const b = layout.bleedIn * K().PT * scale;
        ctx.fillRect(0, 0, layout.sizePt.w * scale, b);
        ctx.fillRect(0, layout.sizePt.h * scale - b, layout.sizePt.w * scale, b);
        if (layout.isOdd) ctx.fillRect(layout.sizePt.w * scale - b, 0, b, layout.sizePt.h * scale);
        else ctx.fillRect(0, 0, b, layout.sizePt.h * scale);
      }

      // Trim
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = "rgba(28,22,18,0.35)";
      ctx.strokeRect(
        layout.trimRectIn.x * K().PT * scale,
        layout.trimRectIn.y * K().PT * scale,
        layout.trimRectIn.w * K().PT * scale,
        layout.trimRectIn.h * K().PT * scale
      );
      ctx.setLineDash([]);

      // Safe area
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = "rgba(30,74,60,0.45)";
      ctx.strokeRect(
        layout.safePt.x * scale,
        layout.safePt.y * scale,
        layout.safePt.w * scale,
        layout.safePt.h * scale
      );
      ctx.setLineDash([]);

      const g = canvasAdapter(ctx, layout.sizePt.h, scale);
      // Trick: canvasAdapter already multiplies by scale, but we translated without scaling.
      // The adapter draws in scaled pixels from 0,0 which is the page origin. Good.
      drawFrontOrContent(g, layout, config, null);
      ctx.restore();

      // Caption
      ctx.fillStyle = "#5C534A";
      ctx.font = '11px "IBM Plex Mono", ui-monospace, monospace';
      ctx.fillText(
        `p. ${layout.pageNum}  ${layout.isOdd ? "recto (gutter left)" : "verso (gutter right)"}`,
        ox,
        originY + layout.sizePt.h * scale + 16
      );
    }

    if (showLeft) paintOne(L, originX);
    else {
      // Opening verso: empty sheet so page 1 sits on the right
      ctx.save();
      ctx.translate(originX, originY);
      ctx.fillStyle = "rgba(28,22,18,0.06)";
      ctx.fillRect(0, 0, L.sizePt.w * scale, L.sizePt.h * scale);
      ctx.fillStyle = "#5C534A";
      ctx.font = '11px "IBM Plex Mono", ui-monospace, monospace';
      ctx.fillText("front of book", 8, L.sizePt.h * scale / 2);
      ctx.restore();
    }
    if (showRight) paintOne(R, originX + L.sizePt.w * scale + gap);

    if (flags && flags.legend) {
      ctx.font = '11px "IBM Plex Mono", ui-monospace, monospace';
      ctx.fillStyle = "#A85B32";
      ctx.fillRect(pad, 10, 10, 10);
      ctx.fillStyle = "#5C534A";
      ctx.fillText("bleed", pad + 16, 19);
      ctx.strokeStyle = "rgba(30,74,60,0.8)";
      ctx.strokeRect(pad + 70, 10, 10, 10);
      ctx.fillText("safe area", pad + 86, 19);
    }
  }

  root.QuireGen = {
    buildInteriorPdf,
    buildCoverPdf,
    listingPack,
    downloadBytes,
    downloadText,
    paintSpread,
    slug,
    themeOf,
    contentPageIndex
  };
})(typeof window !== "undefined" ? window : globalThis);
