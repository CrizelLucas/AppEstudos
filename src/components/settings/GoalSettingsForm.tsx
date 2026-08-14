"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { StudyGoal } from "@/types/settings";

interface GoalSettingsFormProps {
  goal: StudyGoal;
  onSave: (goal: StudyGoal) => void;
}

const inputClassName =
  "rounded-lg border border-black/[.08] bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40 dark:border-white/[.145] dark:bg-black";
const labelClassName = "text-xs font-medium text-zinc-500 dark:text-zinc-400";

export function GoalSettingsForm({ goal, onSave }: GoalSettingsFormProps) {
  const [metric, setMetric] = useState(goal.metric);
  const [period, setPeriod] = useState(goal.period);
  const [target, setTarget] = useState(goal.target);

  // Reflete a meta persistida se ela mudar por fora (carregamento
  // assíncrono do storage no mount, ou importar um backup depois).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMetric(goal.metric);
    setPeriod(goal.period);
    setTarget(goal.target);
  }, [goal]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (target <= 0) return;
    onSave({ metric, period, target });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="goal-period" className={labelClassName}>
          Período
        </label>
        <select
          id="goal-period"
          value={period}
          onChange={(event) =>
            setPeriod(event.target.value as StudyGoal["period"])
          }
          className={inputClassName}
        >
          <option value="diaria">Diária</option>
          <option value="semanal">Semanal</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="goal-metric" className={labelClassName}>
          Unidade
        </label>
        <select
          id="goal-metric"
          value={metric}
          onChange={(event) =>
            setMetric(event.target.value as StudyGoal["metric"])
          }
          className={inputClassName}
        >
          <option value="pomodoros">Pomodoros</option>
          <option value="horas">Horas</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="goal-target" className={labelClassName}>
          Meta
        </label>
        <input
          id="goal-target"
          type="number"
          min={metric === "horas" ? 0.5 : 1}
          step={metric === "horas" ? 0.5 : 1}
          required
          value={target}
          onChange={(event) => setTarget(Number(event.target.value))}
          className={`${inputClassName} w-24`}
        />
      </div>

      <button
        type="submit"
        className="bg-foreground text-background rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Salvar meta
      </button>
    </form>
  );
}
