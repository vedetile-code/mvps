/* Shared conversion layer: checkout links, sticky CTA, and waitlist capture.
 * Config lives in /mvps/checkout-config.js. Include with:
 *   <script src="../checkout-config.js"></script>
 *   <script src="../cta.js" data-slug="nookshift"></script>
 */
(function () {
  var me = document.currentScript;
  var slug = me && me.getAttribute("data-slug");
  var cfg = window.MVPS_CHECKOUT || { products: {} };
  var p = cfg.products && cfg.products[slug];
  if (!p) return;
  var links = p.links || {};

  function mailto(subject, lines) {
    return "mailto:" + p.contact + "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(lines.join("\n"));
  }
  var reserveHref = mailto(p.name + " — reserve " + p.offer, [
    "Please reserve my " + p.offer + " for " + p.name + ".",
    "",
    "Name: ",
    "Anything you should know: ",
    "",
    "(No payment is taken by this email. You'll reply with a secure checkout link.)"
  ]);

  function apply() {
    // 1. Checkout buttons: <a data-checkout="primary" data-buy-label="Buy — $29">
    Array.prototype.forEach.call(document.querySelectorAll("[data-checkout]"), function (el) {
      var url = links[el.getAttribute("data-checkout")];
      if (url) {
        el.setAttribute("href", url);
        el.removeAttribute("data-open-waitlist");
        if (el.getAttribute("data-buy-label")) el.textContent = el.getAttribute("data-buy-label");
      }
    });

    // 2. Sticky CTA bar (landing pages only)
    if (me.hasAttribute("data-bar") && !sessionStorage.getItem("mvps-bar-closed-" + slug)) {
      var bar = document.createElement("div");
      bar.className = "mvps-cta-bar";
      bar.setAttribute("role", "region");
      bar.setAttribute("aria-label", "Offer");
      var buy = links.primary;
      bar.innerHTML =
        '<span class="mvps-cta-text"><strong>' + p.name + "</strong> · " + p.offer +
        (buy ? " · secure card checkout" : " · reserve now, pay when you get the link") + "</span>" +
        '<a class="mvps-cta-btn" href="' + (buy || reserveHref) + '">' + (buy ? "Buy now" : "Reserve my spot") + "</a>" +
        '<button class="mvps-cta-x" type="button" aria-label="Close">×</button>';
      document.body.appendChild(bar);
      document.body.classList.add("mvps-has-bar");
      bar.querySelector(".mvps-cta-x").addEventListener("click", function () {
        bar.remove();
        document.body.classList.remove("mvps-has-bar");
        sessionStorage.setItem("mvps-bar-closed-" + slug, "1");
      });
    }
  }

  // Buy buttons with a live URL must navigate, not open a page's own modal.
  document.addEventListener("click", function (e) {
    var el = e.target && e.target.closest && e.target.closest("[data-checkout]");
    if (el && links[el.getAttribute("data-checkout")]) e.stopImmediatePropagation();
  }, true);

  // 3. Waitlist forms: send to formEndpoint if set, else open a prefilled email.
  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (!form || form.id !== "waitlist-form") return;
    e.preventDefault();
    e.stopImmediatePropagation();
    var data = new FormData(form);
    var email = String(data.get("email") || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { status(form, "Please enter a valid email address."); return; }
    var lines = ["Please add me to the " + p.name + " founding list (" + p.offer + ").", ""];
    data.forEach(function (v, k) { if (String(v).trim()) lines.push(k + ": " + v); });
    lines.push("", "No payment is taken by this message.");
    var fallback = mailto(p.name + " waitlist / pre-order", lines);
    var after = links.primary
      ? ' Want it now? <a href="' + links.primary + '">Buy the ' + p.offer + "</a>."
      : "";
    if (cfg.formEndpoint) {
      data.append("_subject", p.name + " waitlist");
      data.append("product", slug);
      fetch(cfg.formEndpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); form.reset(); status(form, "You're on the list. We'll email " + email + " from " + p.contact + "." + after); })
        .catch(function () { window.location.href = fallback; status(form, "Your email app should open; press Send to join." + after); });
    } else {
      window.location.href = fallback;
      status(form, 'Your email app should open with the message ready; press Send to join. No email app? Write to <a href="mailto:' + p.contact + '">' + p.contact + "</a>." + after);
    }
  }, true);

  function status(form, html) {
    var s = form.querySelector(".mvps-status");
    if (!s) { s = document.createElement("p"); s.className = "mvps-status"; s.setAttribute("role", "status"); form.appendChild(s); }
    s.innerHTML = html;
  }

  var css = document.createElement("style");
  css.textContent =
    ".mvps-cta-bar{position:fixed;left:0;right:0;bottom:0;z-index:9999;display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap;padding:10px 44px 10px 14px;background:#151515;color:#fff;font:15px/1.35 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;box-shadow:0 -4px 18px rgba(0,0,0,.18)}" +
    ".mvps-cta-btn{background:#ffd34d;color:#151515!important;text-decoration:none;font-weight:700;padding:8px 16px;border-radius:999px;white-space:nowrap}" +
    ".mvps-cta-btn:hover{background:#ffe27f}" +
    ".mvps-cta-x{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:0;color:#bbb;font-size:22px;cursor:pointer}" +
    "body.mvps-has-bar{padding-bottom:64px}" +
    ".mvps-status{margin-top:10px;font-size:.95em}";
  document.head.appendChild(css);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply); else apply();
})();
