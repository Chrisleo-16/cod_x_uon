/** Lightweight Web Audio UI sounds + optional phone vibration */

let ctx: AudioContext | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Short mechanical “car / selector click” when scrolling between operators */
export function playSelectTick() {
  const ac = audio();
  if (!ac) return;

  const t0 = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const filter = ac.createBiquadFilter();

  osc.type = "square";
  osc.frequency.setValueAtTime(180, t0);
  osc.frequency.exponentialRampToValueAtTime(90, t0 + 0.06);

  filter.type = "bandpass";
  filter.frequency.value = 900;
  filter.Q.value = 4;

  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(0.22, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + 0.1);

  // soft thud layer
  const osc2 = ac.createOscillator();
  const g2 = ac.createGain();
  osc2.type = "triangle";
  osc2.frequency.value = 55;
  g2.gain.setValueAtTime(0.12, t0);
  g2.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08);
  osc2.connect(g2);
  g2.connect(ac.destination);
  osc2.start(t0);
  osc2.stop(t0 + 0.09);
}

/** Mission complete sting */
export function playMissionComplete() {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime;
  const notes = [220, 277, 330, 440];
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    const start = t0 + i * 0.08;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.15, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(start);
    osc.stop(start + 0.4);
  });
}

/** Phone haptic pulse train — no-op on desktop */
export function pulseVibrate() {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  // ta-ta-ta-ta
  navigator.vibrate([30, 40, 30, 40, 30, 40, 45]);
}

export function celebrateSelect() {
  playSelectTick();
  pulseVibrate();
}
