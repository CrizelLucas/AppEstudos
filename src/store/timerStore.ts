"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import {
  loadTimerConfig,
  loadTimerRuntimeState,
  saveTimerRuntimeState,
} from "@/lib/storage";
import { cycleDurationInSeconds, DEFAULT_TIMER_CONFIG } from "@/lib/timer";
import type { CycleType, TimerConfig } from "@/types/timer";

/**
 * Estado global do cronômetro (Zustand, não React Context) — vive fora de
 * qualquer componente de tela, então sobrevive à troca de rota (o Next.js
 * desmonta o componente da página ao navegar, mas a store continua). O
 * "motor" que detecta fim de ciclo fica em `TimerEngine`, sempre montado no
 * layout raiz; esta store só guarda o estado e as transições básicas.
 *
 * O tempo restante NÃO fica armazenado tickando aqui — cada consumidor que
 * precisa exibir a contagem ao vivo usa `useLiveSecondsLeft()`, que recalcula
 * a partir de `cycleEndTimestamp` (um timestamp real, persistido) em vez de
 * decrementar um contador em memória. É isso que permite recalcular certo
 * depois de um F5 ou de fechar/abrir o navegador.
 */
interface TimerStoreState {
  cycle: CycleType;
  cyclesSinceLongBreak: number;
  isRunning: boolean;
  cycleEndTimestamp: number | null;
  pausedSecondsLeft: number;
  subject: string;
  config: TimerConfig;
  hydrated: boolean;
}

interface TimerStoreActions {
  hydrate: () => Promise<void>;
  play: () => void;
  pause: () => void;
  reset: () => void;
  setSubject: (subject: string) => void;
  setConfig: (config: TimerConfig) => void;
  /** Avança pro próximo ciclo e retorna o tipo do ciclo que ACABOU de terminar. */
  completeCycle: () => CycleType;
}

type TimerStore = TimerStoreState & TimerStoreActions;

/** Dispara o save sem bloquear a UI — o resultado não muda nada na tela. */
function persistRuntime(state: TimerStoreState): void {
  void saveTimerRuntimeState({
    cycle: state.cycle,
    cyclesSinceLongBreak: state.cyclesSinceLongBreak,
    isRunning: state.isRunning,
    cycleEndTimestamp: state.cycleEndTimestamp,
    pausedSecondsLeft: state.pausedSecondsLeft,
    subject: state.subject,
  });
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  cycle: "foco",
  cyclesSinceLongBreak: 0,
  isRunning: false,
  cycleEndTimestamp: null,
  pausedSecondsLeft: cycleDurationInSeconds("foco", DEFAULT_TIMER_CONFIG),
  subject: "",
  config: DEFAULT_TIMER_CONFIG,
  hydrated: false,

  hydrate: async () => {
    // Sem guarda de "já hidratado": quem decide QUANDO chamar é o
    // `TimerEngine`, re-chamando a cada troca de usuário logado (login,
    // logout, ou troca de conta no mesmo navegador) — ver comentário lá.
    const [config, runtime] = await Promise.all([
      loadTimerConfig().then((stored) => stored ?? DEFAULT_TIMER_CONFIG),
      loadTimerRuntimeState(),
    ]);

    if (!runtime) {
      set({
        config,
        pausedSecondsLeft: cycleDurationInSeconds("foco", config),
        hydrated: true,
      });
      return;
    }

    // Restaura tudo como estava salvo — inclusive se `cycleEndTimestamp` já
    // passou (app fechado/recarregado depois que o ciclo devia ter acabado).
    // O TimerEngine detecta isso no primeiro tick e processa a conclusão
    // normalmente (mesmo caminho de som/notificação/histórico).
    set({
      cycle: runtime.cycle,
      cyclesSinceLongBreak: runtime.cyclesSinceLongBreak,
      subject: runtime.subject,
      config,
      isRunning: runtime.isRunning,
      cycleEndTimestamp: runtime.cycleEndTimestamp,
      pausedSecondsLeft: runtime.pausedSecondsLeft,
      hydrated: true,
    });
  },

  play: () => {
    const { isRunning, pausedSecondsLeft } = get();
    if (isRunning) return;
    set({
      isRunning: true,
      cycleEndTimestamp: Date.now() + pausedSecondsLeft * 1000,
    });
    persistRuntime(get());
  },

  pause: () => {
    const { isRunning, cycleEndTimestamp } = get();
    if (!isRunning || cycleEndTimestamp === null) return;
    const remaining = Math.max(
      0,
      Math.round((cycleEndTimestamp - Date.now()) / 1000),
    );
    set({
      isRunning: false,
      cycleEndTimestamp: null,
      pausedSecondsLeft: remaining,
    });
    persistRuntime(get());
  },

  reset: () => {
    const { cycle, config } = get();
    set({
      isRunning: false,
      cycleEndTimestamp: null,
      pausedSecondsLeft: cycleDurationInSeconds(cycle, config),
    });
    persistRuntime(get());
  },

  setSubject: (subject) => {
    set({ subject });
    persistRuntime(get());
  },

  setConfig: (config) => {
    const { cycle, isRunning, config: previousConfig } = get();
    const previousDuration = cycleDurationInSeconds(cycle, previousConfig);
    const nextDuration = cycleDurationInSeconds(cycle, config);

    // TimerEngine chama isso em todo mount só pra sincronizar a config já
    // persistida — se a duração do ciclo atual não mudou de verdade, não
    // pode reiniciar a contagem (senão todo F5/navegação "religaria" o
    // timestamp de término e o cronômetro voltaria pro tempo cheio).
    if (previousDuration === nextDuration) {
      set({ config });
      persistRuntime(get());
      return;
    }

    if (isRunning) {
      set({ config, cycleEndTimestamp: Date.now() + nextDuration * 1000 });
    } else {
      set({ config, pausedSecondsLeft: nextDuration });
    }
    persistRuntime(get());
  },

  completeCycle: () => {
    const { cycle, cyclesSinceLongBreak, config } = get();
    const endedCycle = cycle;

    if (cycle === "foco") {
      const nextCyclesSinceLongBreak = cyclesSinceLongBreak + 1;
      const isLongBreak =
        nextCyclesSinceLongBreak >= config.cyclesBeforeLongBreak;
      const nextCycle: CycleType = isLongBreak ? "pausaLonga" : "pausaCurta";
      const duration = cycleDurationInSeconds(nextCycle, config);
      set({
        cycle: nextCycle,
        cyclesSinceLongBreak: isLongBreak ? 0 : nextCyclesSinceLongBreak,
        isRunning: true,
        cycleEndTimestamp: Date.now() + duration * 1000,
        pausedSecondsLeft: duration,
      });
    } else {
      const duration = cycleDurationInSeconds("foco", config);
      set({
        cycle: "foco",
        isRunning: true,
        cycleEndTimestamp: Date.now() + duration * 1000,
        pausedSecondsLeft: duration,
      });
    }

    persistRuntime(get());
    return endedCycle;
  },
}));

const DISPLAY_TICK_MS = 250;

/**
 * Segundos restantes "ao vivo": recalcula a cada 250ms enquanto rodando, sem
 * guardar isso na store global (evita re-render em toda a árvore a cada
 * tick — só quem chama este hook re-renderiza).
 *
 * `Date.now()` só pode ser chamado dentro do efeito (nunca durante a
 * renderização, que precisa ser pura) — por isso o valor fica em `useState`
 * e é recalculado ali, não inline no corpo da função.
 */
export function useLiveSecondsLeft(): number {
  const isRunning = useTimerStore((state) => state.isRunning);
  const cycleEndTimestamp = useTimerStore((state) => state.cycleEndTimestamp);
  const pausedSecondsLeft = useTimerStore((state) => state.pausedSecondsLeft);

  const [secondsLeft, setSecondsLeft] = useState(pausedSecondsLeft);

  useEffect(() => {
    const update = () => {
      if (isRunning && cycleEndTimestamp !== null) {
        setSecondsLeft(
          Math.max(0, Math.round((cycleEndTimestamp - Date.now()) / 1000)),
        );
      } else {
        setSecondsLeft(pausedSecondsLeft);
      }
    };

    update();
    if (!isRunning) return;

    const intervalId = setInterval(update, DISPLAY_TICK_MS);
    return () => clearInterval(intervalId);
  }, [isRunning, cycleEndTimestamp, pausedSecondsLeft]);

  return secondsLeft;
}
