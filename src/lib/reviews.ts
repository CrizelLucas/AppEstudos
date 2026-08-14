import { daysBetween, getDateKey, parseDateKey } from "@/lib/date";
import type { SpacedReviewOverride } from "@/types/reviews";
import type { PomodoroHistory } from "@/types/timer";

/** Repetição espaçada simples (ver CLAUDE.md): revisar 1, 7 e 30 dias depois de estudar. */
export const SPACED_REVIEW_INTERVALS_DAYS: readonly number[] = [1, 7, 30];

export interface SpacedReviewCandidate {
  id: string;
  subject: string;
  studiedDate: string;
  intervalDays: number;
}

/** Matérias estudadas há exatamente 1, 7 ou 30 dias, a partir do histórico de pomodoros. */
export function computeSpacedReviewCandidates(
  history: PomodoroHistory,
  today: Date = new Date(),
): SpacedReviewCandidate[] {
  const candidates: SpacedReviewCandidate[] = [];

  for (const [studiedDateKey, subjects] of Object.entries(history)) {
    const daysSince = daysBetween(parseDateKey(studiedDateKey), today);
    if (!SPACED_REVIEW_INTERVALS_DAYS.includes(daysSince)) continue;

    for (const subjectKey of Object.keys(subjects)) {
      candidates.push({
        id: `${studiedDateKey}:${subjectKey}:${daysSince}`,
        subject: subjectKey,
        studiedDate: studiedDateKey,
        intervalDays: daysSince,
      });
    }
  }

  return candidates;
}

/**
 * Junta os candidatos naturais de hoje com os que foram adiados pra hoje, e
 * tira os já marcados como revisados.
 */
export function getTodaySpacedReviewItems(
  history: PomodoroHistory,
  overrides: Record<string, SpacedReviewOverride>,
  today: string = getDateKey(),
): SpacedReviewCandidate[] {
  const natural = computeSpacedReviewCandidates(history);
  const naturalIds = new Set(natural.map((candidate) => candidate.id));

  const fromOverrides: SpacedReviewCandidate[] = Object.values(overrides)
    .filter(
      (override) =>
        override.status === "adiado" &&
        override.effectiveDate === today &&
        !naturalIds.has(override.id),
    )
    .map((override) => ({
      id: override.id,
      subject: override.subject,
      studiedDate: override.studiedDate,
      intervalDays: override.intervalDays,
    }));

  return [...natural, ...fromOverrides].filter((candidate) => {
    const override = overrides[candidate.id];
    if (!override) return true;
    if (override.status === "revisado") return false;
    return override.effectiveDate === today;
  });
}
