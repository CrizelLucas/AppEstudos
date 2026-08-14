export type GoalMetric = "pomodoros" | "horas";
export type GoalPeriod = "diaria" | "semanal";

export interface StudyGoal {
  metric: GoalMetric;
  period: GoalPeriod;
  target: number;
}

export interface AppSettings {
  soundEnabled: boolean;
  goal: StudyGoal;
}
