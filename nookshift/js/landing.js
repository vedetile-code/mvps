(function () {
  const NS = window.Nookshift;
  const styleGrid = document.getElementById("style-grid");
  const compare = document.getElementById("hero-compare");
  const before = document.getElementById("hero-before");
  const after = document.getElementById("hero-after");
  const waitlistForm = document.getElementById("waitlist-form");
  const heroStyle = document.getElementById("hero-style-name");

  if (styleGrid) {
    NS.STYLES.forEach((s) => {
      const el = document.createElement("div");
      el.className = "style-tile";
      el.innerHTML = '<div class="swatch" style="background:' + s.swatch + '"></div><strong>' + s.name + "</strong><span>" + s.kind + " · " + s.blurb + "</span>";
      styleGrid.appendChild(el);
    });
  }

  async function setupHero() {
    if (!before || !after) return;
    const img = await NS.sampleImage("living", 1400, 1050);
    before.width = 1400; before.height = 1050;
    before.getContext("2d").drawImage(img, 0, 0);
    const style = NS.styleById("coastal");
    NS.restyleCanvas(img, style, after);
    if (heroStyle) heroStyle.textContent = style.name;
    NS.bindCompare(compare);
  }

  if (waitlistForm) {
    waitlistForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(waitlistForm).entries());
      window.location.href = NS.waitlistMailto(data);
    });
  }

  setupHero();
})();
