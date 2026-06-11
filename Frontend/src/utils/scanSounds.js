let audioCtx = null;

function getAudioContext() {
  if (!audioCtx && typeof window !== "undefined") {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  return audioCtx;
}

function playTone({ frequencies, duration = 0.22, volume = 0.25 }) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);

    const start = ctx.currentTime;
    frequencies.forEach(([freq, at]) => {
      osc.frequency.setValueAtTime(freq, start + at);
    });

    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

    osc.start(start);
    osc.stop(start + duration);
  } catch {
    // Audio not available — fail silently
  }
}

/** Short ascending chime — successful submission */
export function playScanSuccessSound() {
  playTone({
    frequencies: [
      [660, 0],
      [880, 0.08],
    ],
    duration: 0.28,
    volume: 0.3,
  });
}

/** Low double beep — scan error (not found / already submitted) */
export function playScanErrorSound() {
  playTone({
    frequencies: [
      [280, 0],
      [220, 0.12],
    ],
    duration: 0.2,
    volume: 0.22,
  });
}
