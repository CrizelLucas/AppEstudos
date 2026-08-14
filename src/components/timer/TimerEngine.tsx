"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAppSettings } from "@/hooks/useAppSettings";
import { usePomodoroHistory } from "@/hooks/usePomodoroHistory";
import { useTimerTabTitle } from "@/hooks/useTimerTabTitle";
import { notifyCycleEnd } from "@/lib/notifications";
import { playBreakEndSound, playFocusEndSound } from "@/lib/sound";
import { useLiveSecondsLeft, useTimerStore } from "@/store/timerStore";

const CHECK_INTERVAL_MS = 250;

/**
 * Componente sem UI, montado uma vez no layout raiz (fora de qualquer rota).
 * É ele quem detecta o fim de um ciclo — som, notificação, registro no
 * histórico e título da aba — em vez da tela de Timer, então isso continua
 * funcionando mesmo com o usuário em outra aba do app (o componente da tela
 * de Timer é desmontado ao navegar; este aqui não).
 *
 * A config do timer só é carregada aqui via `hydrate()` (direto do storage,
 * uma vez). Não fica reobservando `useTimerConfig()` pra "sincronizar" —
 * isso causava uma corrida: essa outra instância do hook começa com o valor
 * padrão antes de carregar o valor real, e se esse padrão chegasse depois da
 * hidratação, reiniciava o cronômetro do zero. Quem edita os tempos em
 * Configurações agora chama `useTimerStore.getState().setConfig(...)`
 * diretamente pra atualizar a store na hora.
 */
export function TimerEngine() {
  const { user } = useAuth();
  const { settings } = useAppSettings();
  const { registerPomodoroCompleted } = usePomodoroHistory();

  const hydrate = useTimerStore((state) => state.hydrate);
  const cycle = useTimerStore((state) => state.cycle);
  const isRunning = useTimerStore((state) => state.isRunning);

  // Roda de novo a cada troca de usuário logado (login, logout, ou duas
  // pessoas do grupo usando o mesmo navegador em sequência) — sem isso, a
  // store ficaria com os dados da conta anterior até um F5.
  useEffect(() => {
    if (!user) return;
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só o id importa (evita re-hidratar a cada refresh de token)
  }, [hydrate, user?.id]);

  // Refs pra sempre ler o valor mais recente dentro do setInterval, sem
  // precisar recriar o intervalo (e sem fechar sobre valores desatualizados).
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const registerPomodoroCompletedRef = useRef(registerPomodoroCompleted);
  useEffect(() => {
    registerPomodoroCompletedRef.current = registerPomodoroCompleted;
  }, [registerPomodoroCompleted]);

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      const state = useTimerStore.getState();
      if (!state.isRunning || state.cycleEndTimestamp === null) return;
      if (Date.now() < state.cycleEndTimestamp) return;

      const focusMinutesAtCompletion = state.config.focusMinutes;
      const subjectAtCompletion = state.subject;
      const endedCycle = state.completeCycle();

      if (endedCycle === "foco") {
        if (settingsRef.current.soundEnabled) playFocusEndSound();
        registerPomodoroCompletedRef.current(
          subjectAtCompletion,
          focusMinutesAtCompletion,
        );
      } else if (settingsRef.current.soundEnabled) {
        playBreakEndSound();
      }
      notifyCycleEnd(endedCycle);
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [isRunning]);

  const secondsLeft = useLiveSecondsLeft();
  useTimerTabTitle(cycle, secondsLeft);

  return null;
}
