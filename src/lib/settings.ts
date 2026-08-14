import { getDateKey } from "@/lib/date";
import type { AppSettings, StudyGoal } from "@/types/settings";
import type { PomodoroHistory } from "@/types/timer";

export const DEFAULT_APP_SETTINGS: AppSettings = {
  soundEnabled: true,
  goal: {
    metric: "pomodoros",
    period: "diaria",
    target: 4,
  },
};

function getMondayOfWeek(date: Date): Date {
  const day = date.getDay(); // 0 = domingo ... 6 = sábado
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  return monday;
}

function datesInRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export interface GoalProgress {
  metric: StudyGoal["metric"];
  period: StudyGoal["period"];
  current: number;
  target: number;
  /** 0 a 100. */
  percent: number;
}

/** Soma o histórico de hoje (meta diária) ou de segunda até hoje (meta semanal). */
export function computeGoalProgress(
  history: PomodoroHistory,
  goal: StudyGoal,
  today: Date = new Date(),
): GoalProgress {
  const dates =
    goal.period === "diaria"
      ? [today]
      : datesInRange(getMondayOfWeek(today), today);

  let pomodoros = 0;
  let minutes = 0;
  for (const date of dates) {
    const subjects = history[getDateKey(date)] ?? {};
    for (const entry of Object.values(subjects)) {
      pomodoros += entry.count;
      minutes += entry.minutes;
    }
  }

  const current = goal.metric === "pomodoros" ? pomodoros : minutes / 60;
  const percent =
    goal.target <= 0 ? 0 : Math.min(100, (current / goal.target) * 100);

  return {
    metric: goal.metric,
    period: goal.period,
    current,
    target: goal.target,
    percent,
  };
}
