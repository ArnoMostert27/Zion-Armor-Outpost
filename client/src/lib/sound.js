/**
 * Tiny synthesised sound kit built on the Web Audio API.
 * No audio files to download, no licensing to worry about, a few hundred bytes
 * of code. Muted by default - the UI toggle turns it on.
 */

let context = null;
let enabled = false;

const getContext = () => {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  if (!context) context = new Ctor();
  if (context.state === 'suspended') context.resume().catch(() => {});
  return context;
};

export const setSoundEnabled = (value) => {
  enabled = Boolean(value);
  if (enabled) getContext();
};

export const isSoundEnabled = () => enabled;

/** One shaped oscillator burst. */
const blip = ({ freq = 440, type = 'sine', duration = 0.12, gain = 0.06, sweepTo = null }) => {
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  const now = ctx.currentTime;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, now + duration);

  amp.gain.setValueAtTime(0.0001, now);
  amp.gain.exponentialRampToValueAtTime(gain, now + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(amp).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
};

/** Short filtered noise - used for the paper sounds. */
const noise = ({ duration = 0.16, gain = 0.05, freq = 1400, q = 0.8 }) => {
  const ctx = getContext();
  if (!ctx) return;

  const frames = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) {
    // Fade the noise out so it reads as a swish rather than a hiss.
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = q;

  const amp = ctx.createGain();
  amp.gain.value = gain;

  source.connect(filter).connect(amp).connect(ctx.destination);
  source.start();
};

export const sfx = {
  /** Adding to the satchel - a bright rising pluck. */
  stow: () => enabled && blip({ freq: 320, sweepTo: 720, type: 'triangle', duration: 0.14 }),

  /** Turning a page in the preview reader. */
  page: () => enabled && noise({ duration: 0.2, freq: 2000, gain: 0.055 }),

  /** Route change - a soft low thud under the panel wipe. */
  panel: () => enabled && blip({ freq: 180, sweepTo: 90, type: 'sine', duration: 0.18, gain: 0.05 }),

  /** Unsheathing - used when a rank or badge unlocks. */
  unsheathe: () => {
    if (!enabled) return;
    noise({ duration: 0.28, freq: 3200, gain: 0.05 });
    blip({ freq: 880, sweepTo: 1760, type: 'triangle', duration: 0.32, gain: 0.05 });
  },

  /** Completing the armor set. */
  ignite: () => {
    if (!enabled) return;
    blip({ freq: 140, sweepTo: 560, type: 'sawtooth', duration: 0.45, gain: 0.055 });
    setTimeout(() => blip({ freq: 660, sweepTo: 1320, type: 'triangle', duration: 0.35 }), 110);
  },

  /** A small tick for toggles and filters. */
  tick: () => enabled && blip({ freq: 1100, type: 'square', duration: 0.045, gain: 0.028 }),
};

export default sfx;
