/* Demo prompt banks for journals. Used when no API key is present. */
(function (root) {
  const BANKS = {
    gratitude: [
      "What is one ordinary thing that made today easier?",
      "Who helped you this week, and how will you thank them?",
      "Name three things your body did for you today.",
      "What is a small comfort you often forget to notice?",
      "Which place felt safe this week, and why?",
      "Write down a meal, song, or walk that lifted your mood.",
      "What skill are you quietly getting better at?",
      "Recall a kindness you received that you have not repaid in words.",
      "What is one thing about your home that works well?",
      "Who would you write a short thank-you note to tonight?",
      "What did you learn from a mistake without shaming yourself?",
      "List three sounds you were glad to hear today.",
      "What is a freedom you have this year that you did not have five years ago?",
      "Describe a person who makes hard days lighter.",
      "What is something you used to struggle with that now feels easier?",
      "Which part of your daily routine do you actually enjoy?",
      "Name a book, show, or conversation that stayed with you.",
      "What is a quality you like in yourself when no one is watching?",
      "What weather or season are you grateful for right now?",
      "Write about a tool, habit, or object that saves you time.",
      "Who taught you something practical that you still use?",
      "What is one way you were patient with someone this week?",
      "What made you laugh recently, even briefly?",
      "Which community or group are you glad to belong to?",
      "What is a quiet moment from this week worth keeping?",
      "Name three people you hope are doing well, and why.",
      "What is a challenge you are glad you showed up for?",
      "How did you take care of someone, including yourself?",
      "What is a tradition, even a small one, that you want to keep?",
      "Write a short inventory of enough: what is already sufficient?"
    ],
    morning: [
      "What would make today feel like a success by dinner?",
      "What is the first task that, once done, will make the rest easier?",
      "How do you want to feel at 3 p.m., and what would support that?",
      "What can you leave unfinished without harm?",
      "Who do you want to be kind to today, including yourself?",
      "What is one thing you will do slowly on purpose?",
      "Name the worry that showed up first this morning. What is a smaller next step?",
      "What will you say no to today?",
      "What is the most honest way to spend the next hour?",
      "If today were a chapter title, what would it be?",
      "What energy do you actually have, not the energy you wish you had?",
      "Write a two-sentence plan for the morning and leave the afternoon open.",
      "What conversation, if started today, would reduce a lingering tension?",
      "What would “good enough” look like for the main task on your list?",
      "What do you need to eat, drink, or rest before you work?",
      "Which distraction will you put one barrier in front of?",
      "What is one thing you can finish in twenty minutes?",
      "Who are you writing, calling, or thanking before noon?",
      "What is a boundary you will keep today?",
      "Describe the day you want in six words, then unpack them.",
      "What did yesterday teach you that you can use this morning?",
      "Where will you work, and how will you make that place calmer?",
      "What is one promise to yourself that is small enough to keep?",
      "If you only did three things, which three matter?",
      "What are you avoiding, and what is the first two-minute version of it?",
      "How will you mark the end of the workday in advance?",
      "What would you tell a friend who had your exact morning?",
      "What is the kindest schedule you can keep and still be honest?",
      "Name one thing you are looking forward to, however small.",
      "Write a permission slip for today in one line."
    ],
    reflection: [
      "What did you believe last year that you no longer believe?",
      "When did you last change your mind, and what convinced you?",
      "What pattern keeps repeating, and what is its payoff?",
      "Which relationship needs more honesty, and which needs more rest?",
      "What are you performing, and for whom?",
      "What would you do if you trusted that you were already behind on nothing that matters?",
      "Describe a decision you made too quickly and one you made too slowly.",
      "What are you proud of that you never mention?",
      "Where do you still ask for permission you do not need?",
      "What does a well-lived Tuesday look like for you?",
      "Which story about yourself is out of date?",
      "What are you grieving that other people might not notice?",
      "How do you treat yourself after a small failure?",
      "What would you start if you knew it could be mediocre at first?",
      "Who are you becoming in ordinary hours, not in big announcements?",
      "What do you envy, and what does that envy point toward?",
      "When do you feel most like yourself?",
      "What conversation do you keep postponing?",
      "What did you overcomplicate this month?",
      "What would “enough career” look like, in concrete terms?",
      "How has your definition of success quietly changed?",
      "What are you loyal to that no longer fits?",
      "Write a letter to yourself from five years ago, ten lines only.",
      "What do you want to remember about this season of life?",
      "Where did you show courage in a way that did not look dramatic?",
      "What habit is costing more than it gives back?",
      "What would you do with an unscheduled afternoon?",
      "Which of your rules are actually fears with good branding?",
      "What do you need to tell the truth about, just on this page?",
      "What remains, even when plans fall apart?"
    ],
    creativity: [
      "Describe a color you cannot name, using only comparisons.",
      "List ten ideas for a project, including five that feel slightly foolish.",
      "What would you make if no one saw it?",
      "Steal a structure from a song, recipe, or walk and apply it to a new piece.",
      "Write a scene that takes place in a doorway.",
      "What material, tool, or medium have you been curious about?",
      "Describe your working space as if it were a character.",
      "What rule of your craft will you break on purpose, once, today?",
      "Collect five overheard or remembered phrases and build a paragraph from them.",
      "What is the smallest complete thing you could finish this week?",
      "Sketch with words: a street corner, a kitchen at 6 a.m., a quiet lobby.",
      "Who is an artist you admire, and what specifically do you want to learn from them?",
      "Write about a failed attempt and what it left you with.",
      "If your current project had a weather system, what would it be?",
      "Name the fear that shows up when you sit down to make something.",
      "What would a “study” version of your project look like, not the final?",
      "Combine two unrelated interests and list six possible works.",
      "What constraints would actually help you (time, palette, length, tools)?",
      "Describe the last thing that truly surprised you.",
      "Write a process note: what you will do first, and how you will stop.",
      "What do you want a stranger to feel after thirty seconds with your work?",
      "Which part of the work is research, and which part is delay?",
      "Translate a memory into a list of textures and sounds only.",
      "What would you make for one specific person, not an audience?",
      "If you could apprentice for a week, who would you watch?",
      "Draft a title, then write the piece that deserves a better one.",
      "What can you remove from the current draft or plan?",
      "Describe a tool you love using, in exact steps.",
      "What is the next ugly version you are willing to make?",
      "Close by writing one sentence you could start with tomorrow."
    ]
  };

  const LISTING_TEMPLATES = {
    lined: {
      blurb: "A quietly designed lined journal for daily writing. Generous margins, college-ruled lines, and a clean title page. Undated, so you can start on any day.",
      bullets: [
        "Print-ready paperback interior, laid out to common KDP trim and gutter rules",
        "Lined pages with space for the date and a page number",
        "Front matter: title page and a “this journal belongs to” page",
        "Cream or white paper options; no dated calendar to go stale"
      ],
      keywords: "lined journal, daily journal, writing notebook, undated journal, gratitude diary, morning pages, paperback journal, college ruled notebook"
    },
    dot: {
      blurb: "A dot-grid notebook for lists, sketches, and planning. Five-millimeter dots stay light enough to write over, with a mid-page marker to keep spreads even.",
      bullets: [
        "Dot-grid pages at 5 mm spacing",
        "KDP-aware margins and optional bleed-off layouts",
        "Title page and ownership page included",
        "Suitable for bullet-style planning or general notes"
      ],
      keywords: "dot grid notebook, bullet journal, dotted journal, 5mm dot grid, planner notebook, sketch notebook, paperback notebook"
    },
    graph: {
      blurb: "A graph notebook with a quarter-inch grid for notes, charts, and problem work. Clear margins keep writing off the trim.",
      bullets: [
        "Quarter-inch graph pages",
        "Layout set to KDP inside and outside margin minimums",
        "Title and ownership pages",
        "Useful for students, makers, and technical notes"
      ],
      keywords: "graph notebook, grid notebook, engineering notebook, quad ruled, math notebook, graph paper paperback"
    },
    daily: {
      blurb: "An undated daily planner with hour lines, top priorities, and a notes column. Start any day of the year; no wasted leftover dates.",
      bullets: [
        "One day per page, undated",
        "Schedule block, priorities, and notes",
        "Front matter included",
        "Laid out for paperback upload"
      ],
      keywords: "undated daily planner, daily agenda, one page per day, productivity planner, daily schedule book"
    },
    weekly: {
      blurb: "An undated weekly planner with a two-page spread for the week, habit rows, and a notes panel. Reuse it any year.",
      bullets: [
        "Week-per-spread layout, undated",
        "Space for habits and weekly notes",
        "Paperback interior sized for KDP",
        "No expired calendar dates"
      ],
      keywords: "undated weekly planner, week at a glance, weekly organizer, habit planner, undated diary"
    },
    habit: {
      blurb: "A habit tracker with monthly grids, a notes page, and room for a short review. Track a handful of habits without a dated year on the cover.",
      bullets: [
        "Monthly habit grids and review pages",
        "Undated so it can start any month",
        "Clear typography and generous gutters",
        "Print-ready interior file"
      ],
      keywords: "habit tracker, habit journal, monthly habit log, undated tracker, self improvement journal"
    },
    prompt: {
      blurb: "A prompt journal with one writing prompt per page and lined space to answer. Prompts are written for reflection, not for viral quizzes.",
      bullets: [
        "One prompt and a writing block on each page",
        "Themes such as gratitude, mornings, reflection, or creativity",
        "Front matter included",
        "Interior margins set for paperback binding"
      ],
      keywords: "prompt journal, guided journal, gratitude journal, self reflection journal, writing prompts book"
    },
    coloring: {
      blurb: "A coloring book of original procedural line drawings: mandalas, botanicals, and geometric patterns. Single-sided pages reduce show-through.",
      bullets: [
        "Original procedural line art (not licensed characters)",
        "Single-sided printing option with blank backs",
        "Bleed set so art can reach the trimmed edge",
        "Title page and “this book belongs to” page"
      ],
      keywords: "adult coloring book, mandala coloring, geometric coloring pages, botanical coloring book, single sided coloring"
    },
    recipe: {
      blurb: "A blank recipe book with pages for ingredients, method, servings, and notes. Make a family cookbook or a personal collection.",
      bullets: [
        "Structured recipe templates, not a pre-filled cookbook",
        "Space for ingredients, steps, yield, and notes",
        "Index pages at the front",
        "Paperback interior ready to upload"
      ],
      keywords: "blank recipe book, family recipe journal, empty cookbook, recipe organizer, handwritten recipe book"
    },
    log: {
      blurb: "A simple logbook with dated entries, a subject line, and a body block. Use it for projects, practice, mileage of a hobby, or a workshop record.",
      bullets: [
        "Consistent log entry pages",
        "Header fields for date, subject, and duration or units",
        "Page numbers and clear margins",
        "Print-ready paperback interior"
      ],
      keywords: "logbook, project log, daily log book, record book, undated log journal"
    }
  };

  function hashString(s) {
    let h = 2166136261;
    const str = String(s);
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function promptFor(pageNum, theme, seed) {
    const bank = BANKS[theme] || BANKS.gratitude;
    const rng = mulberry32(hashString(`${seed}|${theme}|${pageNum}`) || 1);
    const idx = Math.floor(rng() * bank.length);
    return bank[idx];
  }

  function listingFor(type, config) {
    const base = LISTING_TEMPLATES[type] || LISTING_TEMPLATES.lined;
    const title = (config && config.title) || "Untitled";
    const subtitle = (config && config.subtitle) || "";
    const author = (config && config.author) || "Your Name";
    return {
      title,
      subtitle,
      author,
      description: `${title}${subtitle ? " — " + subtitle : ""}. ${base.blurb}`,
      bullets: base.bullets.slice(),
      keywords: base.keywords,
      aiDisclosure:
        config && config.aiUsed
          ? "Disclose on KDP: this file includes AI-generated text or images."
          : "Demo mode used ruled layouts and/or procedural line art, not a generative model. If you added model-written text or model-made images, disclose those on KDP."
    };
  }

  root.QuirePrompts = {
    BANKS,
    LISTING_TEMPLATES,
    hashString,
    mulberry32,
    promptFor,
    listingFor
  };
})(typeof window !== "undefined" ? window : globalThis);
