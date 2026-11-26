/* Optional AI helpers. Talks to the local /api server when an API key is set.
   On GitHub Pages, or whenever the server is absent, everything stays in demo mode.
   Never send or store keys in the browser for the public demo. */
(function (root) {
  const CONTACT = "timwvedco+quirepress@gmail.com";

  async function status() {
    if (location.hostname.endsWith("github.io") || location.hostname.endsWith("pages.dev")) {
      return { demo: true, reason: "no-server" };
    }
    try {
      const r = await fetch("/api/status", { headers: { Accept: "application/json" } });
      if (!r.ok) return { demo: true, reason: "no-server" };
      return await r.json();
    } catch (err) {
      return { demo: true, reason: "no-server" };
    }
  }

  async function enhance(kind, config) {
    const r = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ kind, config })
    });
    if (!r.ok) {
      const text = await r.text();
      throw new Error(text || "AI request failed");
    }
    return r.json();
  }

  root.QuireAI = { status, enhance, CONTACT };
})(typeof window !== "undefined" ? window : globalThis);
