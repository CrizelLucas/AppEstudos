"use client";

import { useCallback, useEffect, useState } from "react";
import { getDateKey } from "@/lib/date";
import {
  deleteQuestionLogEntry,
  insertQuestionLogEntry,
  loadQuestionLogEntries,
} from "@/lib/storage";
import type { QuestionLogEntry } from "@/types/questions";

interface NewQuestionLogEntry {
  subject: string;
  total: number;
  correct: number;
}

export function useQuestionLog() {
  const [entries, setEntries] = useState<QuestionLogEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadQuestionLogEntries().then((stored) => {
      if (!cancelled) setEntries(stored);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // wrong é sempre derivado aqui (total - correct), pra nunca ficar
  // inconsistente com o que foi digitado no formulário.
  const addEntry = useCallback((data: NewQuestionLogEntry) => {
    insertQuestionLogEntry({
      date: getDateKey(),
      subject: data.subject,
      total: data.total,
      correct: data.correct,
      wrong: data.total - data.correct,
    }).then((created) => {
      setEntries((current) => [...current, created]);
    });
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
    deleteQuestionLogEntry(id);
  }, []);

  return { entries, addEntry, removeEntry };
}
