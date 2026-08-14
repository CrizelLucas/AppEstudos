import { normalizeSubject } from "@/lib/subject";
import type { QuestionLogEntry } from "@/types/questions";

export interface SubjectStats {
  subject: string;
  total: number;
  correct: number;
  wrong: number;
  /** 0 a 100. */
  accuracy: number;
}

/** Agrega os registros por matéria (comparação normalizada, ver `normalizeSubject`). */
export function computeSubjectStats(
  entries: QuestionLogEntry[],
): SubjectStats[] {
  const bySubject = new Map<
    string,
    { subject: string; total: number; correct: number; wrong: number }
  >();

  for (const entry of entries) {
    const key = normalizeSubject(entry.subject);
    const current = bySubject.get(key) ?? {
      subject: entry.subject,
      total: 0,
      correct: 0,
      wrong: 0,
    };
    bySubject.set(key, {
      subject: current.subject,
      total: current.total + entry.total,
      correct: current.correct + entry.correct,
      wrong: current.wrong + entry.wrong,
    });
  }

  return Array.from(bySubject.values())
    .map((stats) => ({
      ...stats,
      accuracy: stats.total === 0 ? 0 : (stats.correct / stats.total) * 100,
    }))
    .sort((a, b) => b.total - a.total);
}

export function formatAccuracy(accuracy: number): string {
  return `${accuracy.toFixed(1)}%`;
}

export interface OverallQuestionStats {
  total: number;
  correct: number;
  wrong: number;
  /** 0 a 100. */
  accuracy: number;
}

/** Taxa de acerto geral, somando todas as matérias. */
export function computeOverallStats(
  entries: QuestionLogEntry[],
): OverallQuestionStats {
  let total = 0;
  let correct = 0;
  let wrong = 0;

  for (const entry of entries) {
    total += entry.total;
    correct += entry.correct;
    wrong += entry.wrong;
  }

  return {
    total,
    correct,
    wrong,
    accuracy: total === 0 ? 0 : (correct / total) * 100,
  };
}
