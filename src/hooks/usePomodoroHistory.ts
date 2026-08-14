"use client";

import { useCallback, useEffect, useState } from "react";
import { getDateKey } from "@/lib/date";
import { insertPomodoroCompletion, loadPomodoroHistory } from "@/lib/storage";
import { normalizeSubject } from "@/lib/subject";
import type { PomodoroHistory } from "@/types/timer";

/**
 * Histórico de pomodoros concluídos por dia e por matéria (contagem e minutos
 * de foco). `completedToday` soma as matérias do dia atual, então zera
 * sozinho quando o dia muda — não existe um contador separado para "resetar".
 */
export function usePomodoroHistory() {
  const [history, setHistory] = useState<PomodoroHistory>({});

  useEffect(() => {
    let cancelled = false;
    loadPomodoroHistory().then((stored) => {
      if (!cancelled) setHistory(stored);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const registerPomodoroCompleted = useCallback(
    (subject: string, minutes: number) => {
      const subjectKey = normalizeSubject(subject);
      setHistory((current) => {
        const todayKey = getDateKey();
        const todayEntries = current[todayKey] ?? {};
        const existing = todayEntries[subjectKey] ?? { count: 0, minutes: 0 };
        return {
          ...current,
          [todayKey]: {
            ...todayEntries,
            [subjectKey]: {
              count: existing.count + 1,
              minutes: existing.minutes + minutes,
            },
          },
        };
      });
      insertPomodoroCompletion(subjectKey, minutes);
    },
    [],
  );

  /** Minutos de foco já estudados hoje na matéria (comparação exata, normalizada). */
  const getMinutesStudiedToday = useCallback(
    (subject: string) => {
      const subjectKey = normalizeSubject(subject);
      return history[getDateKey()]?.[subjectKey]?.minutes ?? 0;
    },
    [history],
  );

  const todayEntries = history[getDateKey()] ?? {};
  const completedToday = Object.values(todayEntries).reduce(
    (sum, entry) => sum + entry.count,
    0,
  );

  return {
    history,
    completedToday,
    registerPomodoroCompleted,
    getMinutesStudiedToday,
  };
}
