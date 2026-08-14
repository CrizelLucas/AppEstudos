"use client";

import { useState, type FormEvent } from "react";
import { SubjectInput } from "@/components/ui/SubjectInput";

interface QuestionLogFormProps {
  subjectSuggestions: string[];
  onSubmit: (values: {
    subject: string;
    total: number;
    correct: number;
  }) => void;
}

const inputClassName =
  "rounded-lg border border-black/[.08] bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40 dark:border-white/[.145] dark:bg-black";
const labelClassName = "text-xs font-medium text-zinc-500 dark:text-zinc-400";

export function QuestionLogForm({
  subjectSuggestions,
  onSubmit,
}: QuestionLogFormProps) {
  const [subject, setSubject] = useState("");
  const [total, setTotal] = useState(10);
  const [correct, setCorrect] = useState(0);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedSubject = subject.trim();
    if (!trimmedSubject || total <= 0 || correct < 0 || correct > total) return;

    onSubmit({ subject: trimmedSubject, total, correct });
    setSubject("");
    setTotal(10);
    setCorrect(0);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <div className="min-w-[12rem] flex-1">
        <SubjectInput
          id="question-subject"
          value={subject}
          onChange={setSubject}
          suggestions={subjectSuggestions}
          placeholder="Ex: TI — Banco de Dados"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="question-total" className={labelClassName}>
          Total
        </label>
        <input
          id="question-total"
          type="number"
          min={1}
          required
          value={total}
          onChange={(event) => setTotal(Number(event.target.value))}
          className={`${inputClassName} w-20`}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="question-correct" className={labelClassName}>
          Acertos
        </label>
        <input
          id="question-correct"
          type="number"
          min={0}
          max={total}
          required
          value={correct}
          onChange={(event) => setCorrect(Number(event.target.value))}
          className={`${inputClassName} w-20`}
        />
      </div>

      <p className="text-xs text-zinc-500 sm:pb-2 dark:text-zinc-400">
        Erros:{" "}
        <span className="text-foreground font-medium">
          {Math.max(total - correct, 0)}
        </span>
      </p>

      <button
        type="submit"
        className="bg-foreground text-background rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Registrar
      </button>
    </form>
  );
}
