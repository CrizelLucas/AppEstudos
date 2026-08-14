"use client";

import { useEffect } from "react";
import { APP_NAME } from "@/lib/constants";
import { CYCLE_LABELS, formatTime } from "@/lib/timer";
import type { CycleType } from "@/types/timer";

/** Mantém o título da aba mostrando o tempo restante, ex: "23:45 — FOCO". */
export function useTimerTabTitle(cycle: CycleType, secondsLeft: number) {
  useEffect(() => {
    const title = `${formatTime(secondsLeft)} — ${CYCLE_LABELS[cycle].toUpperCase()}`;
    document.title = title;

    // No mount inicial, o Next.js reaplica o <title> do metadata um instante
    // depois da hidratação. Reforça o título logo em seguida para garantir
    // que o valor dinâmico "vença" também na primeira renderização.
    const timeoutId = setTimeout(() => {
      document.title = title;
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [cycle, secondsLeft]);

  useEffect(() => {
    return () => {
      document.title = APP_NAME;
    };
  }, []);
}
