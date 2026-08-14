import { getDateKey } from "@/lib/date";
import { capitalizeSubject } from "@/lib/subject";
import type { PomodoroHistory } from "@/types/timer";

export interface SubjectStudyMinutes {
  subject: string;
  minutes: number;
}

export interface DailyStudyPoint {
  date: string;
  /** Ex: "29/07", pra eixo do gráfico. */
  label: string;
  pomodoros: number;
  minutes: number;
}

export function computeTotalStudyMinutes(history: PomodoroHistory): number {
  let total = 0;
  for (const subjects of Object.values(history)) {
    for (const entry of Object.values(subjects)) {
      total += entry.minutes;
    }
  }
  return total;
}

/** Soma os minutos estudados por matéria, somando todos os dias do histórico. */
export function computeSubjectStudyMinutes(
  history: PomodoroHistory,
): SubjectStudyMinutes[] {
  const bySubject = new Map<string, number>();

  for (const subjects of Object.values(history)) {
    for (const [subjectKey, entry] of Object.entries(subjects)) {
      bySubject.set(
        subjectKey,
        (bySubject.get(subjectKey) ?? 0) + entry.minutes,
      );
    }
  }

  return Array.from(bySubject.entries())
    .map(([subject, minutes]) => ({
      subject: capitalizeSubject(subject),
      minutes,
    }))
    .sort((a, b) => b.minutes - a.minutes);
}

/** Um ponto por dia dos últimos `days` dias (incluindo hoje e dias sem estudo, com 0). */
export function computeDailyStudyPoints(
  history: PomodoroHistory,
  days: number,
  today: Date = new Date(),
): DailyStudyPoint[] {
  const points: DailyStudyPoint[] = [];

  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    const dateKey = getDateKey(date);
    const subjects = history[dateKey] ?? {};

    let pomodoros = 0;
    let minutes = 0;
    for (const entry of Object.values(subjects)) {
      pomodoros += entry.count;
      minutes += entry.minutes;
    }

    points.push({
      date: dateKey,
      label: `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`,
      pomodoros,
      minutes,
    });
  }

  return points;
}

/**
 * Dias consecutivos com pelo menos 1 pomodoro, terminando hoje — ou ontem, se
 * hoje ainda não tiver nenhum registrado (pra não zerar o streak só porque o
 * usuário ainda não estudou hoje).
 */
export function computeStudyStreak(
  history: PomodoroHistory,
  today: Date = new Date(),
): number {
  function hasStudied(date: Date): boolean {
    const subjects = history[getDateKey(date)];
    if (!subjects) return false;
    return Object.values(subjects).some((entry) => entry.count > 0);
  }

  let streak = 0;
  const cursor = new Date(today);
  if (!hasStudied(cursor)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (hasStudied(cursor)) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function formatHours(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remaining = Math.round(minutes % 60);
  if (hours === 0) return `${remaining}min`;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h${String(remaining).padStart(2, "0")}`;
}
