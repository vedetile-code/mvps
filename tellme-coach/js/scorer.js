(function (global) {
  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/1\.6\s*mm/g, "1.6")
      .replace(/one point six/g, "1.6")
      .replace(/[^a-z0-9.'\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function groupHit(text, group) {
    const t = normalize(text);
    return group.some((kw) => t.includes(normalize(kw)));
  }

  function scoreAnswer(question, answer, { followUp = false } = {}) {
    const points = followUp && question.follow_up_points ? question.follow_up_points : question.model_answer_points;
    const groups = followUp && question.follow_up_keywords ? question.follow_up_keywords : question.keywords;
    const details = groups.map((group, i) => {
      const hit = groupHit(answer, group);
      return {
        point: points[Math.min(i, points.length - 1)] || group.join(" / "),
        hit,
      };
    });
    // Deduplicate point text if keyword groups outnumber unique points
    const seen = new Set();
    const compact = [];
    for (const d of details) {
      if (seen.has(d.point) && d.hit === compact.find((x) => x.point === d.point)?.hit) continue;
      if (seen.has(d.point)) {
        const prev = compact.find((x) => x.point === d.point);
        if (prev) prev.hit = prev.hit || d.hit;
        continue;
      }
      seen.add(d.point);
      compact.push({ ...d });
    }
    const needed = compact.length;
    const got = compact.filter((d) => d.hit).length;
    // Official tell-me items: SAT only if every official point is present.
    // Show-me items have practice points, not official model answers — SAT if at least 2 of 3 land.
    const passMark = question.type === "show" ? Math.min(2, needed) : needed;
    const grade = got >= passMark && needed > 0 ? "SAT" : "UNSAT";
    return {
      grade,
      got,
      needed,
      details: compact,
      missing_points: compact.filter((d) => !d.hit).map((d) => d.point),
      reference: question.reference,
      mode: "demo-rubric",
    };
  }

  async function scoreWithApi(question, answer, sessionLog) {
    const res = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer, sessionLog }),
    });
    if (!res.ok) throw new Error("API scoring unavailable");
    return res.json();
  }

  global.TellMeScorer = { normalize, scoreAnswer, scoreWithApi };
})(window);
