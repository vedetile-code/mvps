(function () {
  const KEY = "tellme-coach-waitlist";

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch { return []; }
  }
  function save(rows) {
    localStorage.setItem(KEY, JSON.stringify(rows));
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("waitlist-form");
    const status = document.getElementById("waitlist-status");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if (!data.name || !data.email) {
        status.textContent = "Please add your name and email.";
        return;
      }
      const row = {
        name: String(data.name).trim(),
        email: String(data.email).trim(),
        testDate: String(data.testDate || "").trim(),
        note: String(data.note || "").trim(),
        offer: data.offer || "waitlist",
        savedAt: new Date().toISOString(),
        stored: "localStorage only — this form does not send a message or take payment",
      };
      const rows = load();
      rows.push(row);
      save(rows);
      form.reset();
      status.innerHTML =
        "Saved on this device only. This is not a paid pre-order and nothing was charged. " +
        "When checkout is live (Whop, Paddle, Dodo or PayPal — not Stripe or Etsy), we will use the address you typed if you later send it to " +
        "<a href=\"mailto:timwvedco+tellmecoach@gmail.com\">timwvedco+tellmecoach@gmail.com</a>. " +
        "You can also email that address now if you want to be on the launch list off this browser.";
    });
  });
})();
