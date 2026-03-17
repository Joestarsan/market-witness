// Web Audio API sound effects

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

// Helper: play a note
function playNote(
  freq: number,
  type: OscillatorType,
  volume: number,
  startTime: number,
  duration: number
) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

// Gavel slam
export function playGavel() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  // Thud
  playNote(150, "square", 0.5, t, 0.15);
  playNote(80, "square", 0.4, t, 0.2);
  // Noise burst
  const bufferSize = ctx.sampleRate * 0.08;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.25, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
  noise.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(t);
}

// Objection dramatic hit
export function playObjection() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  playNote(600, "sawtooth", 0.35, t, 0.15);
  playNote(800, "square", 0.25, t + 0.02, 0.2);
  playNote(100, "square", 0.4, t, 0.15);
}

// Hold it — rising tone
export function playHoldIt() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "square";
  osc.frequency.setValueAtTime(400, t);
  osc.frequency.linearRampToValueAtTime(700, t + 0.12);
  gain.gain.setValueAtTime(0.3, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  osc.start(t);
  osc.stop(t + 0.3);
}

// Text pop - hand-crafted PCM waveform, 3 cycles of a 250Hz pop then silence
export function playTypeClick() {
  const ctx = getCtx();
  const sampleRate = ctx.sampleRate;
  const freq = 250 + Math.random() * 50;
  const cycles = 3;
  const samplesPerCycle = Math.floor(sampleRate / freq);
  const totalSamples = samplesPerCycle * cycles;
  const buffer = ctx.createBuffer(1, totalSamples, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < totalSamples; i++) {
    // Square-ish wave with fast decay per cycle
    const phase = (i % samplesPerCycle) / samplesPerCycle;
    const cycleNum = Math.floor(i / samplesPerCycle);
    const amp = 1 - cycleNum / cycles; // decay across cycles
    data[i] = (phase < 0.5 ? 1 : -1) * amp * 0.12;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(ctx.currentTime);
}

// Victory fanfare - triumphant ascending melody
export function playVictory() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  // C major fanfare: C-E-G-C (up), then held high C
  const melody = [
    { freq: 523, time: 0, dur: 0.15 },     // C5
    { freq: 659, time: 0.15, dur: 0.15 },   // E5
    { freq: 784, time: 0.3, dur: 0.15 },    // G5
    { freq: 1047, time: 0.45, dur: 0.5 },   // C6 (held)
  ];
  melody.forEach(({ freq, time, dur }) => {
    playNote(freq, "square", 0.2, t + time, dur);
    // Add harmony
    playNote(freq * 1.5, "triangle", 0.08, t + time, dur);
  });
  // Final chord shimmer
  playNote(1047, "triangle", 0.15, t + 0.45, 0.8);
  playNote(1318, "sine", 0.08, t + 0.5, 0.7);
  playNote(784, "triangle", 0.1, t + 0.45, 0.8);
}

// Guilty / defeat sound - sad descending, minor key
export function playGuilty() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  // Descending minor: E-C-A-F
  const melody = [
    { freq: 330, time: 0, dur: 0.3 },      // E4
    { freq: 262, time: 0.3, dur: 0.3 },     // C4
    { freq: 220, time: 0.6, dur: 0.3 },     // A3
    { freq: 175, time: 0.9, dur: 0.6 },     // F3 (held, sad)
  ];
  melody.forEach(({ freq, time, dur }) => {
    playNote(freq, "triangle", 0.2, t + time, dur);
  });
  // Low rumble at the end
  playNote(100, "sawtooth", 0.1, t + 1.0, 0.5);
}

// Dramatic reveal (for evidence card)
export function playReveal() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  playNote(300, "triangle", 0.2, t, 0.08);
  playNote(600, "triangle", 0.15, t + 0.05, 0.15);
}
