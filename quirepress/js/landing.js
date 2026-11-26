(function () {
  const CONTACT = "timwvedco+quirepress@gmail.com";
  const KEY = "quirepress-waitlist";

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function setContact() {
    $all("[data-contact]").forEach((el) => {
      if (el.tagName === "A") {
        el.href = "mailto:" + CONTACT + "?subject=" + encodeURIComponent("Quire waitlist");
        el.textContent = CONTACT;
      } else {
        el.textContent = CONTACT;
      }
    });
  }

  function loadList() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch { return []; }
  }

  function saveEntry(entry) {
    const list = loadList();
    list.push(entry);
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  function openModal() {
    const modal = $("#waitlist-modal");
    if (!modal) return;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    const input = $("#wl-email");
    if (input) input.focus();
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    const modal = $("#waitlist-modal");
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function bindWaitlist() {
    $all("[data-open-waitlist]").forEach((btn) => btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    }));
    $all("[data-close-waitlist]").forEach((btn) => btn.addEventListener("click", closeModal));
    const modal = $("#waitlist-modal");
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
      });
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    const form = $("#waitlist-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = ($("#wl-name") || {}).value.trim();
      const email = ($("#wl-email") || {}).value.trim();
      const interest = ($("#wl-interest") || {}).value;
      const err = $("#wl-error");
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (err) { err.hidden = false; err.textContent = "Enter a valid email address."; }
        return;
      }
      saveEntry({ name, email, interest, at: new Date().toISOString() });
      form.hidden = true;
      const done = $("#wl-done");
      if (done) {
        done.hidden = false;
        const mail = "mailto:" + CONTACT
          + "?subject=" + encodeURIComponent("Quire founder waitlist")
          + "&body=" + encodeURIComponent(
            (name ? "Name: " + name + "\n" : "")
            + "Email: " + email + "\n"
            + (interest ? "I make: " + interest + "\n" : "")
            + "\nPlease add me to the Quire founder waitlist ($99 founder year).\n"
          );
        const a = done.querySelector("[data-mailto]");
        if (a) a.href = mail;
      }
    });
  }

  function bindYear() {
    $all("[data-year]").forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  }

  setContact();
  bindWaitlist();
  bindYear();
})();
