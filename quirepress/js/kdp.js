/* Quire — Amazon KDP paperback geometry and compliance checks.
   Specs from KDP Help "Set Trim Size, Bleed, and Margins" and
   "Paperback Submission Guidelines", checked 26 Nov 2026.
   https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6
   https://kdp.amazon.com/en_US/help/topic/G201857950
*/
(function (root) {
  const PT = 72;
  const BLEED_IN = 0.125;

  const TRIM_SIZES = [
    { id: "5x8", w: 5, h: 8, label: "5 × 8 in" },
    { id: "5.06x7.81", w: 5.06, h: 7.81, label: "5.06 × 7.81 in" },
    { id: "5.25x8", w: 5.25, h: 8, label: "5.25 × 8 in" },
    { id: "5.5x8.5", w: 5.5, h: 8.5, label: "5.5 × 8.5 in" },
    { id: "6x9", w: 6, h: 9, label: "6 × 9 in", popular: true },
    { id: "6.14x9.21", w: 6.14, h: 9.21, label: "6.14 × 9.21 in" },
    { id: "6.69x9.61", w: 6.69, h: 9.61, label: "6.69 × 9.61 in" },
    { id: "7x10", w: 7, h: 10, label: "7 × 10 in" },
    { id: "7.44x9.69", w: 7.44, h: 9.69, label: "7.44 × 9.69 in" },
    { id: "7.5x9.25", w: 7.5, h: 9.25, label: "7.5 × 9.25 in" },
    { id: "8x10", w: 8, h: 10, label: "8 × 10 in" },
    { id: "8.25x8.25", w: 8.25, h: 8.25, label: "8.25 × 8.25 in" },
    { id: "8.5x8.5", w: 8.5, h: 8.5, label: "8.5 × 8.5 in" },
    { id: "8.5x11", w: 8.5, h: 11, label: "8.5 × 11 in" }
  ];

  const PAPER = {
    white: { id: "white", label: "Black ink, white paper", perPage: 0.002252 },
    cream: { id: "cream", label: "Black ink, cream paper", perPage: 0.0025 },
    color: { id: "color", label: "Color ink (premium)", perPage: 0.002347 },
    groundwood: { id: "groundwood", label: "Groundwood paper", perPage: 0.00235 }
  };

  const BOOK_TYPES = [
    { id: "lined", label: "Lined journal", bleedDefault: false, paper: "cream" },
    { id: "dot", label: "Dot-grid notebook", bleedDefault: false, paper: "white" },
    { id: "graph", label: "Graph notebook", bleedDefault: false, paper: "white" },
    { id: "daily", label: "Undated daily planner", bleedDefault: false, paper: "white" },
    { id: "weekly", label: "Undated weekly planner", bleedDefault: false, paper: "white" },
    { id: "habit", label: "Habit tracker", bleedDefault: false, paper: "white" },
    { id: "prompt", label: "Prompt / gratitude journal", bleedDefault: false, paper: "cream" },
    { id: "coloring", label: "Coloring book", bleedDefault: true, paper: "color" },
    { id: "recipe", label: "Recipe book", bleedDefault: false, paper: "white" },
    { id: "log", label: "Logbook", bleedDefault: false, paper: "white" }
  ];

  const THEMES = {
    linen: { name: "Linen", paper: "#F4EFE6", ink: "#1C1612", accent: "#1E4A3C", rule: "#C9BDAA", cover: "#E8E0D2" },
    pine: { name: "Pine", paper: "#F3F0E8", ink: "#14241E", accent: "#1E4A3C", rule: "#B7C4B8", cover: "#1E4A3C" },
    ink: { name: "Ink", paper: "#F6F3EC", ink: "#16141C", accent: "#2A3344", rule: "#B8B4AA", cover: "#1A1F2B" },
    terracotta: { name: "Terracotta", paper: "#F7F0E8", ink: "#2A1810", accent: "#A85B32", rule: "#D4C0B0", cover: "#A85B32" },
    midnight: { name: "Midnight", paper: "#F2F3F6", ink: "#12141A", accent: "#2C3A5A", rule: "#C5C8D0", cover: "#12141A" },
    sage: { name: "Sage", paper: "#F3F4EE", ink: "#1A221C", accent: "#5A6B52", rule: "#C5CDBE", cover: "#5A6B52" },
    ocean: { name: "Ocean", paper: "#F1F4F6", ink: "#102028", accent: "#2A5568", rule: "#B8C5CC", cover: "#2A5568" },
    oxblood: { name: "Oxblood", paper: "#F6F1EC", ink: "#1A1212", accent: "#7A2E2E", rule: "#D0C0B8", cover: "#7A2E2E" }
  };

  // Common trademark / platform terms that get KDP listings rejected.
  // Not exhaustive. A hit is a warning to review, not legal advice.
  const WATCH_TERMS = [
    "disney", "pixar", "marvel", "lucasfilm", "star wars", "star trek",
    "harry potter", "hogwarts", "wizarding", "potterhead",
    "pokemon", "pokémon", "nintendo", "pokemon", "mario", "zelda", "kirby",
    "minecraft", "fortnite", "roblox", "among us",
    "barbie", "lego", "hello kitty", "sanrio", "minions", "despicable",
    "batman", "superman", "spider-man", "spiderman", "avengers", "iron man",
    "frozen", "elsa", "mickey", "minnie mouse", "winnie the pooh",
    "peanuts", "snoopy", "sesame street", "dr. seuss", "seuss",
    "taylor swift", "swiftie",
    "nfl", "nba", "mlb", "nhl", "fifa", "ncaa", "super bowl", "olympic", "olympics",
    "coca-cola", "coca cola", "nike", "adidas", "gucci", "chanel", "louis vuitton",
    "kindle", "amazon", "audible", "createSpace", "createspace",
    "harry styles", "wimpy kid", "diary of a wimpy",
    "lord of the rings", "middle-earth", "middle earth", "hobbit",
    "game of thrones", "house of the dragon", "hogwarts legacy",
    "kpop", "bts army", "blackpink",
    "dungeons & dragons", "dungeons and dragons", "wizards of the coast",
    "universal studios", "warner bros", "warner brothers", "dc comics"
  ];

  function gutterInches(pageCount) {
    const n = Number(pageCount) || 0;
    if (n <= 150) return 0.375;
    if (n <= 300) return 0.5;
    if (n <= 500) return 0.625;
    if (n <= 700) return 0.75;
    return 0.875;
  }

  function outsideMarginInches(bleed) {
    return bleed ? 0.375 : 0.25;
  }

  function spineWidthInches(pageCount, paperId) {
    const paper = PAPER[paperId] || PAPER.white;
    return Number(pageCount) * paper.perPage;
  }

  function findTrim(id) {
    return TRIM_SIZES.find((t) => t.id === id) || TRIM_SIZES[4];
  }

  function interiorPageSizeInches(trim, bleed) {
    return {
      w: trim.w + (bleed ? BLEED_IN : 0),
      h: trim.h + (bleed ? BLEED_IN * 2 : 0)
    };
  }

  function coverSizeInches(trim, pageCount, paperId) {
    const spine = spineWidthInches(pageCount, paperId);
    return {
      w: BLEED_IN + trim.w + spine + trim.w + BLEED_IN,
      h: BLEED_IN + trim.h + BLEED_IN,
      spine,
      bleed: BLEED_IN
    };
  }

  /**
   * Layout in PDF points, y-up is handled by the drawing adapters.
   * Here we use a top-down content box (y=0 at top of the page) and
   * convert at draw time. All values in inches first, then to points.
   */
  function pageLayout(trim, pageCount, bleed, pageNum) {
    const isOdd = pageNum % 2 === 1;
    const size = interiorPageSizeInches(trim, bleed);
    const gutter = gutterInches(pageCount);
    const outside = outsideMarginInches(bleed);
    const bleedL = bleed && !isOdd ? BLEED_IN : 0;
    const bleedR = bleed && isOdd ? BLEED_IN : 0;
    const bleedTB = bleed ? BLEED_IN : 0;

    const leftM = (isOdd ? gutter : outside) + bleedL;
    const rightM = (isOdd ? outside : gutter) + bleedR;
    const topM = outside + bleedTB;
    const botM = outside + bleedTB;

    const safe = {
      xIn: leftM,
      yIn: topM,
      wIn: size.w - leftM - rightM,
      hIn: size.h - topM - botM
    };

    return {
      isOdd,
      pageNum,
      bleed: !!bleed,
      sizeIn: size,
      sizePt: { w: size.w * PT, h: size.h * PT },
      gutterIn: gutter,
      outsideIn: outside,
      bleedIn: BLEED_IN,
      trimIn: { w: trim.w, h: trim.h },
      // Trim rectangle in page coordinates (origin top-left, inches)
      trimRectIn: {
        x: bleedL,
        y: bleedTB,
        w: trim.w,
        h: trim.h
      },
      safeIn: safe,
      safePt: {
        x: safe.xIn * PT,
        y: safe.yIn * PT,
        w: safe.wIn * PT,
        h: safe.hIn * PT
      },
      marginsIn: { left: leftM, right: rightM, top: topM, bottom: botM }
    };
  }

  function parseTerms(text) {
    const src = (text || "").toLowerCase();
    const hits = [];
    for (const term of WATCH_TERMS) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i");
      if (re.test(src)) hits.push(term);
    }
    return [...new Set(hits)];
  }

  function validate(config) {
    const issues = [];
    const pages = Number(config.pageCount) || 0;
    const trim = findTrim(config.trimId);
    const bleed = !!config.bleed;
    const title = (config.title || "").trim();
    const subtitle = (config.subtitle || "").trim();
    const author = (config.author || "").trim();
    const allText = [title, subtitle, author, config.themeName, config.description].join(" ");

    if (!title) {
      issues.push({ level: "error", code: "title", text: "Add a title. KDP will not accept a blank title." });
    }
    if (pages < 24) {
      issues.push({ level: "error", code: "min-pages", text: "Paperbacks need at least 24 pages. KDP will reject a shorter interior." });
    }
    if (pages > 828) {
      issues.push({ level: "error", code: "max-pages", text: "828 pages is the usual KDP paperback ceiling. Confirm the exact cap for this trim and ink in KDP." });
    }
    if (pages % 2 === 1) {
      issues.push({ level: "warn", code: "odd-pages", text: "Page count is odd. KDP will add a blank page to make it even." });
    }
    if (pages <= 79 && config.spineText !== false) {
      issues.push({ level: "info", code: "spine-text", text: "KDP only prints spine text on books with more than 79 pages. The cover file will leave the spine blank." });
    }
    if (pages > 79) {
      issues.push({ level: "ok", code: "spine-text-ok", text: "Page count is over 79, so spine text will be printed, with a 0.0625 in clearance on each side." });
    }

    const gutter = gutterInches(pages);
    const outside = outsideMarginInches(bleed);
    issues.push({
      level: "ok",
      code: "margins",
      text: `Inside (gutter) margin set to ${gutter.toFixed(3)} in for ${pages} pages. Outside margins ${outside.toFixed(3)} in${bleed ? " (bleed on)" : " (no bleed)"}.`
    });

    const size = interiorPageSizeInches(trim, bleed);
    issues.push({
      level: "ok",
      code: "page-size",
      text: bleed
        ? `Interior page size ${size.w.toFixed(3)} × ${size.h.toFixed(3)} in (trim ${trim.w} × ${trim.h} in plus 0.125 in outside bleed and 0.125 in top and bottom).`
        : `Interior page size ${trim.w} × ${trim.h} in, equal to the trim, because bleed is off.`
    });

    const spine = spineWidthInches(pages, config.paperId);
    const cover = coverSizeInches(trim, pages, config.paperId);
    issues.push({
      level: "ok",
      code: "cover-size",
      text: `Cover file ${cover.w.toFixed(3)} × ${cover.h.toFixed(3)} in, including 0.125 in bleed on all sides. Spine width ${spine.toFixed(4)} in.`
    });

    issues.push({
      level: "info",
      code: "barcode",
      text: "A 2.00 × 1.20 in clear box is reserved at the bottom-right of the back cover for the KDP barcode. Do not put important text there."
    });

    if (bleed && config.type !== "coloring") {
      issues.push({
        level: "info",
        code: "bleed-choice",
        text: "Bleed is on. Only backgrounds and art should enter the 0.125 in trim zone. Text stays inside the safe area."
      });
    }
    if (config.type === "coloring" && !bleed) {
      issues.push({
        level: "warn",
        code: "coloring-bleed",
        text: "Coloring books usually need bleed so art can reach the trimmed edge. Turn bleed on unless you want a white border."
      });
    }

    const hits = parseTerms(allText);
    if (hits.length) {
      issues.push({
        level: "error",
        code: "trademark",
        text: `These words may be trademarked or blocked on KDP: ${hits.join(", ")}. Remove or rewrite them, and do not rely on “unofficial” to make them acceptable.`
      });
    } else {
      issues.push({
        level: "ok",
        code: "trademark-clear",
        text: "No obvious trademark or platform terms found in the title, subtitle or author line. This is not a legal clearance."
      });
    }

    issues.push({
      level: "info",
      code: "weekly-limit",
      text: "KDP limits new titles to 2 creations and 2 first submissions per format per week, resetting Sunday 00:00 UTC. This tool will not let you exceed that — you still have to pace uploads yourself."
    });

    if (config.aiUsed) {
      issues.push({
        level: "warn",
        code: "ai-disclose",
        text: "You marked AI-generated text or images. On KDP, disclose AI-generated content when you publish. Layout-only and procedural (non-model) art in demo mode is not generative AI, but any model-written prompts or model-drawn art must be disclosed, even if you edit them afterwards."
      });
    } else {
      issues.push({
        level: "info",
        code: "ai-assist",
        text: "Demo interiors use ruled layouts and procedural line art, not a generative image model. If you later paste model-written prompts or model-made art into the book, change the AI setting and disclose on KDP."
      });
    }

    issues.push({
      level: "info",
      code: "not-affiliate",
      text: "Quire is not affiliated with Amazon or Kindle Direct Publishing. Always confirm final measurements in KDP’s own calculator before you publish."
    });

    const errors = issues.filter((i) => i.level === "error").length;
    const warns = issues.filter((i) => i.level === "warn").length;
    return {
      ok: errors === 0,
      errors,
      warns,
      issues,
      gutter,
      outside,
      spine,
      cover,
      size,
      trim,
      hits
    };
  }

  function defaultConfig() {
    return {
      type: "lined",
      trimId: "6x9",
      pageCount: 120,
      paperId: "cream",
      bleed: false,
      title: "Morning Pages",
      subtitle: "A lined journal",
      author: "Your Name",
      themeId: "linen",
      lineStyle: "college",
      singleSidedArt: true,
      includeFrontMatter: true,
      promptTheme: "gratitude",
      description: "",
      aiUsed: false,
      spineText: true
    };
  }

  function lineSpacingInches(style) {
    if (style === "narrow") return 0.25;
    if (style === "wide") return 11 / 32;
    if (style === "dot5") return 5 / 25.4;
    if (style === "graph") return 0.25;
    return 9 / 32; // college
  }

  root.QuireKDP = {
    PT,
    BLEED_IN,
    TRIM_SIZES,
    PAPER,
    BOOK_TYPES,
    THEMES,
    WATCH_TERMS,
    gutterInches,
    outsideMarginInches,
    spineWidthInches,
    findTrim,
    interiorPageSizeInches,
    coverSizeInches,
    pageLayout,
    parseTerms,
    validate,
    defaultConfig,
    lineSpacingInches
  };
})(typeof window !== "undefined" ? window : globalThis);
