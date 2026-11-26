/* Shared micro-interaction layer for the five landing pages (vanilla, no deps).
 * - [data-reveal]      fade/rise in when scrolled into view (stagger with style="--d:2")
 * - [data-words]       word-by-word heading reveal (text stays in the DOM, readable by AT)
 * - .nav-toggle        mobile menu button (aria-controls -> panel id)
 * - [data-glow]        pointer-tracked highlight (decorative only; nothing depends on it)
 * - header.is-scrolled hairline/blur once the page scrolls
 * Everything is skipped when the visitor prefers reduced motion; content is visible without JS.
 */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.__motionOK = true;
  if (reduce) doc.classList.remove("motion"); else doc.classList.add("motion");

  function ready(fn) { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn); else fn(); }

  ready(function () {
    // Mobile navigation
    Array.prototype.forEach.call(document.querySelectorAll(".nav-toggle"), function (btn) {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (!panel) return;
      function set(open) {
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        document.body.classList.toggle("nav-open", open);
      }
      btn.addEventListener("click", function () { set(btn.getAttribute("aria-expanded") !== "true"); });
      panel.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { set(false); btn.focus(); }
      });
      window.matchMedia("(min-width: 900px)").addEventListener("change", function (m) { if (m.matches) set(false); });
    });

    // Header state
    var header = document.querySelector("[data-header]");
    if (header) {
      var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    if (reduce) return;

    // Word-by-word headings
    Array.prototype.forEach.call(document.querySelectorAll("[data-words]"), function (el) {
      var i = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              var s = document.createElement("span");
              s.className = "w";
              s.style.setProperty("--i", i++);
              s.textContent = part;
              frag.appendChild(s);
            });
            node.replaceChild(frag, n);
          } else if (n.nodeType === 1) walk(n);
        });
      })(el);
    });

    // Scroll reveals
    var targets = document.querySelectorAll("[data-reveal], [data-words]");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      Array.prototype.forEach.call(targets, function (t) { io.observe(t); });
    } else {
      Array.prototype.forEach.call(targets, function (t) { t.classList.add("in"); });
    }

    // Pointer glow (fine pointers only)
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      document.addEventListener("pointermove", function (e) {
        var el = e.target.closest && e.target.closest("[data-glow]");
        if (!el) return;
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - r.left) + "px");
        el.style.setProperty("--my", (e.clientY - r.top) + "px");
      }, { passive: true });
    }
  });
})();
