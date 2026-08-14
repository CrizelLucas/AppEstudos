"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { TimerConfig } from "@/types/timer";

interface TimerSettingsFormProps {
  config: TimerConfig;
  onSave: (config: TimerConfig) => void;
}

const inputClassName =
  "rounded-lg border border-black/[.08] bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40 dark:border-white/[.145] dark:bg-black";
const labelClassName = "text-xs font-medium text-zinc-500 dark:text-zinc-400";

/**
 * Alguns valores de teste (ex: o botão "Testar 10s") geram frações como
 * 0.16666666666666666 — arredonda pra no máximo 2 casas antes de exibir.
 */
function roundMinutes(value: number): number {
  return Math.round(value * 100) / 100;
}

export function TimerSettingsForm({ config, onSave }: TimerSettingsFormProps) {
  const [focusMinutes, setFocusMinutes] = useState(() =>
    roundMinutes(config.focusMinutes),
  );
  const [shortBreakMinutes, setShortBreakMinutes] = useState(() =>
    roundMinutes(config.shortBreakMinutes),
  );
  const [longBreakMinutes, setLongBreakMinutes] = useState(() =>
    roundMinutes(config.longBreakMinutes),
  );
  const [cyclesBeforeLongBreak, setCyclesBeforeLongBreak] = useState(
    config.cyclesBeforeLongBreak,
  );

  // Reflete a config persistida se ela mudar por fora (carregamento
  // assíncrono do storage no mount, ou importar um backup depois).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFocusMinutes(roundMinutes(config.focusMinutes));
    setShortBreakMinutes(roundMinutes(config.shortBreakMinutes));
    setLongBreakMinutes(roundMinutes(config.longBreakMinutes));
    setCyclesBeforeLongBreak(config.cyclesBeforeLongBreak);
  }, [config]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      focusMinutes <= 0 ||
      shortBreakMinutes <= 0 ||
      longBreakMinutes <= 0 ||
      cyclesBeforeLongBreak <= 0
    ) {
      return;
    }
    onSave({
      focusMinutes,
      shortBreakMinutes,
      longBreakMinutes,
      cyclesBeforeLongBreak,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="focus-minutes" className={labelClassName}>
            Foco (min)
          </label>
          <input
            id="focus-minutes"
            type="number"
            min={1}
            required
            value={focusMinutes}
            onChange={(event) => setFocusMinutes(Number(event.target.value))}
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="short-break-minutes" className={labelClassName}>
            Pausa curta (min)
          </label>
          <input
            id="short-break-minutes"
            type="number"
            min={1}
            required
            value={shortBreakMinutes}
            onChange={(event) =>
              setShortBreakMinutes(Number(event.target.value))
            }
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="long-break-minutes" className={labelClassName}>
            Pausa longa (min)
          </label>
          <input
            id="long-break-minutes"
            type="number"
            min={1}
            required
            value={longBreakMinutes}
            onChange={(event) =>
              setLongBreakMinutes(Number(event.target.value))
            }
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="cycles-before-long-break" className={labelClassName}>
            Ciclos p/ pausa longa
          </label>
          <input
            id="cycles-before-long-break"
            type="number"
            min={1}
            required
            value={cyclesBeforeLongBreak}
            onChange={(event) =>
              setCyclesBeforeLongBreak(Number(event.target.value))
            }
            className={inputClassName}
          />
        </div>
      </div>

      <button
        type="submit"
        className="bg-foreground text-background self-start rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Salvar tempos
      </button>
    </form>
  );
}
