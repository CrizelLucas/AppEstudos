let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const win = window as typeof window & {
    webkitAudioContext?: typeof AudioContext;
  };
  const AudioContextClass = window.AudioContext ?? win.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }
  return audioContext;
}

/** Retoma o AudioContext dentro de um gesto do usuário (ex: clique em Iniciar). */
export function primeAudioContext(): void {
  const ctx = getAudioContext();
  if (ctx?.state === "suspended") {
    void ctx.resume();
  }
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

function playSequence(frequencies: number[], noteDuration = 0.16, gap = 0.05) {
  const ctx = getAudioContext();
  if (!ctx) return;
  void ctx.resume();

  const now = ctx.currentTime;
  frequencies.forEach((frequency, index) => {
    playTone(ctx, frequency, now + index * (noteDuration + gap), noteDuration);
  });
}

/** Toca quando o tempo de foco termina — hora da pausa. */
export function playFocusEndSound(): void {
  playSequence([880, 659.25]);
}

/** Toca quando o tempo de pausa termina — hora de voltar a estudar. */
export function playBreakEndSound(): void {
  playSequence([523.25, 659.25, 783.99]);
}
