import type { CycleType, TimerConfig } from "@/types/timer";

/**
 * Valores padrão do ciclo Pomodoro (ver CLAUDE.md). Fáceis de sobrescrever:
 * basta passar um `TimerConfig` diferente para `useTimer` — a tela de
 * Configurações (fase futura) vai persistir e injetar esses valores aqui.
 */
export const DEFAULT_TIMER_CONFIG: TimerConfig = {
  focusMinutes: 30,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesBeforeLongBreak: 4,
};

export const CYCLE_LABELS: Record<CycleType, string> = {
  foco: "Foco",
  pausaCurta: "Pausa curta",
  pausaLonga: "Pausa longa",
};

export const CYCLE_RING_COLOR: Record<CycleType, string> = {
  foco: "stroke-rose-500",
  pausaCurta: "stroke-emerald-500",
  pausaLonga: "stroke-sky-500",
};

export function cycleDurationInSeconds(
  cycle: CycleType,
  config: TimerConfig,
): number {
  switch (cycle) {
    case "foco":
      return config.focusMinutes * 60;
    case "pausaCurta":
      return config.shortBreakMinutes * 60;
    case "pausaLonga":
      return config.longBreakMinutes * 60;
  }
}

export function formatTime(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}
