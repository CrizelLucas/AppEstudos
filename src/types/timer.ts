export type CycleType = "foco" | "pausaCurta" | "pausaLonga";

export interface TimerConfig {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  /** Quantidade de ciclos de foco concluídos até entrar em pausa longa. */
  cyclesBeforeLongBreak: number;
}

/**
 * Estado "ao vivo" do cronômetro (não confundir com `TimerConfig`, que são
 * só os tempos configurados). Persistido pra sobreviver a navegação entre
 * telas, refresh (F5) e fechar/abrir o navegador.
 */
export interface TimerRuntimeState {
  cycle: CycleType;
  cyclesSinceLongBreak: number;
  isRunning: boolean;
  /** Epoch ms de quando o ciclo atual deve terminar — só vale se isRunning. */
  cycleEndTimestamp: number | null;
  /** Segundos restantes no momento em que foi pausado (ou nunca iniciado). */
  pausedSecondsLeft: number;
  subject: string;
}

export interface PomodoroHistoryEntry {
  /** Quantidade de pomodoros de foco concluídos. */
  count: number;
  /** Soma dos minutos de foco desses pomodoros (duração configurada em cada um). */
  minutes: number;
}

/**
 * Pomodoros de foco concluídos por dia e por matéria: chave externa é a data
 * "YYYY-MM-DD", chave interna é a matéria normalizada (ver `normalizeSubject`).
 */
export type PomodoroHistory = Record<
  string,
  Record<string, PomodoroHistoryEntry>
>;
