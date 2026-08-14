"use client";

import { useCallback, useEffect, useState } from "react";
import { loadTimerConfig, saveTimerConfig } from "@/lib/storage";
import { DEFAULT_TIMER_CONFIG } from "@/lib/timer";
import type { TimerConfig } from "@/types/timer";

/** Carrega a config do timer persistida (se houver) e permite salvar alterações. */
export function useTimerConfig() {
  const [config, setConfig] = useState<TimerConfig>(DEFAULT_TIMER_CONFIG);

  useEffect(() => {
    let cancelled = false;
    // Só dá pra buscar depois do mount (precisa do usuário logado). Começa
    // com o valor padrão (igual ao HTML renderizado no servidor) e corrige
    // aqui depois, evitando divergência entre hidratação e a marcação
    // enviada pelo servidor.
    loadTimerConfig().then((stored) => {
      if (!cancelled && stored) setConfig(stored);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateConfig = useCallback((next: TimerConfig) => {
    setConfig(next);
    saveTimerConfig(next);
  }, []);

  return { config, updateConfig };
}
