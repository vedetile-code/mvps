(function () {
  var form = document.getElementById("waitlist-form");
  var done = document.getElementById("waitlist-done");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = (document.getElementById("name").value || "").trim();
    var email = (document.getElementById("email").value || "").trim();
    var platforms = (document.getElementById("platforms").value || "").trim();
    var subject = "ListReady pre-order interest";
    var body = [
      "I would like to reserve ListReady founding pricing ($9/month for the first 12 months, or $99 for the founding year).",
      "",
      "Name: " + name,
      "Reply-to: " + email,
      "Marketplaces I sell on: " + (platforms || "(not specified)"),
      "",
      "I understand this is interest only — no payment is taken until I use the checkout link you send."
    ].join("\n");
    var mailto =
      "mailto:timwvedco+listready@gmail.com?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);
    window.location.href = mailto;
    form.hidden = true;
    done.hidden = false;
  });
})();
