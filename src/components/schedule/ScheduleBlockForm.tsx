"use client";

import { useState, type FormEvent } from "react";
import { WEEKDAY_LABELS } from "@/lib/schedule";
import type { ScheduleBlock, Weekday } from "@/types/schedule";

interface ScheduleBlockFormProps {
  weekday: Weekday;
  initialBlock?: ScheduleBlock;
  subjectSuggestions: string[];
  onSubmit: (values: Omit<ScheduleBlock, "id">) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-rose-400 dark:focus:ring-rose-400/15";
const labelClassName = "text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400";

export function ScheduleBlockForm({
  weekday,
  initialBlock,
  subjectSuggestions,
  onSubmit,
  onCancel,
  onDelete,
}: ScheduleBlockFormProps) {
  const [subject, setSubject] = useState(initialBlock?.subject ?? "");
  const [startTime, setStartTime] = useState(
    initialBlock?.startTime ?? "08:00",
  );
  const [durationMinutes, setDurationMinutes] = useState(
    initialBlock?.durationMinutes ?? 60,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedSubject = subject.trim();
    if (!trimmedSubject || !startTime || durationMinutes <= 0) return;
    onSubmit({ weekday, subject: trimmedSubject, startTime, durationMinutes });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
        {initialBlock ? "Editar bloco" : "Novo bloco"} —{" "}
        <span className="text-rose-500">{WEEKDAY_LABELS[weekday]}</span>
      </h2>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="block-subject" className={labelClassName}>
          Matéria
        </label>
        <input
          id="block-subject"
          list="block-subject-suggestions"
          required
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Ex: Português — Crase"
          className={inputClassName}
        />
        <datalist id="block-subject-suggestions">
          {subjectSuggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="block-start" className={labelClassName}>
            Horário
          </label>
          <input
            id="block-start"
            type="time"
            required
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            className={inputClassName}
          />
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="block-duration" className={labelClassName}>
            Duração (min)
          </label>
          <input
            id="block-duration"
            type="number"
            min={5}
            step={5}
            required
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(Number(event.target.value))}
            className={inputClassName}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400"
          >
            Apagar Bloco
          </button>
        ) : (
          <span />
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-5 py-2 text-xs font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95"
          >
            Salvar
          </button>
        </div>
      </div>
    </form>
  );
}

