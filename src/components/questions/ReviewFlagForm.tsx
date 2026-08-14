"use client";

import { useState, type FormEvent } from "react";
import { SubjectInput } from "@/components/ui/SubjectInput";

interface ReviewFlagFormProps {
  subjectSuggestions: string[];
  onSubmit: (values: { subject: string; note: string }) => void;
}

export function ReviewFlagForm({
  subjectSuggestions,
  onSubmit,
}: ReviewFlagFormProps) {
  const [subject, setSubject] = useState("");
  const [note, setNote] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedSubject = subject.trim();
    const trimmedNote = note.trim();
    if (!trimmedSubject || !trimmedNote) return;

    onSubmit({ subject: trimmedSubject, note: trimmedNote });
    setSubject("");
    setNote("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <SubjectInput
          id="review-subject"
          value={subject}
          onChange={setSubject}
          suggestions={subjectSuggestions}
          placeholder="Ex: TI — Banco de Dados"
          required
        />
      </div>

      <div className="flex flex-[2] flex-col gap-1">
        <label
          htmlFor="review-note"
          className="text-xs font-medium text-zinc-500 dark:text-zinc-400"
        >
          Anotação (nº/tema da questão)
        </label>
        <input
          id="review-note"
          required
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Ex: Questão 15 — normalização de tabelas"
          className="text-foreground focus:border-foreground/40 rounded-lg border border-black/[.08] bg-white px-3 py-2 text-sm outline-none dark:border-white/[.145] dark:bg-black"
        />
      </div>

      <button
        type="submit"
        className="rounded-full border border-black/[.08] px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-300 dark:hover:bg-white/[.08]"
      >
        Marcar para revisar
      </button>
    </form>
  );
}
