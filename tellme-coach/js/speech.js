(function (global) {
  function pickVoice() {
    const voices = speechSynthesis.getVoices() || [];
    const preferred = [
      (v) => v.lang === "en-GB" && /daniel|uk english|gbr|britain|female|male/i.test(v.name),
      (v) => v.lang === "en-GB",
      (v) => /^en-GB/i.test(v.lang),
      (v) => /^en/i.test(v.lang),
    ];
    for (const test of preferred) {
      const hit = voices.find(test);
      if (hit) return hit;
    }
    return voices[0] || null;
  }

  let voiceReady = new Promise((resolve) => {
    const now = speechSynthesis.getVoices();
    if (now && now.length) return resolve();
    speechSynthesis.addEventListener("voiceschanged", () => resolve(), { once: true });
    setTimeout(resolve, 800);
  });

  async function speak(text, { cancel = true } = {}) {
    if (!text || !global.speechSynthesis) return;
    await voiceReady;
    if (cancel) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickVoice();
    if (voice) u.voice = voice;
    u.lang = (voice && voice.lang) || "en-GB";
    u.rate = 0.95;
    u.pitch = 1;
    await new Promise((resolve) => {
      u.onend = resolve;
      u.onerror = resolve;
      speechSynthesis.speak(u);
    });
  }

  function stopSpeak() {
    if (global.speechSynthesis) speechSynthesis.cancel();
  }

  function getRecognition() {
    const Ctor = global.SpeechRecognition || global.webkitSpeechRecognition;
    if (!Ctor) return null;
    const rec = new Ctor();
    rec.lang = "en-GB";
    rec.interimResults = true;
    rec.continuous = true;
    rec.maxAlternatives = 1;
    return rec;
  }

  global.TellMeSpeech = { speak, stopSpeak, getRecognition, pickVoice };
})(window);
