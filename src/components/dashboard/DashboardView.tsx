"use client";

import { useMemo } from "react";
import { useAppSettings } from "@/hooks/useAppSettings";
import { usePomodoroHistory } from "@/hooks/usePomodoroHistory";
import { useQuestionLog } from "@/hooks/useQuestionLog";
import {
  computeDailyStudyPoints,
  computeStudyStreak,
  computeSubjectStudyMinutes,
  computeTotalStudyMinutes,
  formatHours,
} from "@/lib/dashboard";
import { computeOverallStats, formatAccuracy } from "@/lib/questions";
import { computeGoalProgress } from "@/lib/settings";
import { GoalProgressCard } from "./GoalProgressCard";
import { StatCard } from "./StatCard";
import { StudyEvolutionChart } from "./StudyEvolutionChart";
import { SubjectHoursList } from "./SubjectHoursList";

const EVOLUTION_CHART_DAYS = 14;

export function DashboardView() {
  const { history } = usePomodoroHistory();
  const { entries } = useQuestionLog();
  const { settings } = useAppSettings();

  const totalMinutes = useMemo(
    () => computeTotalStudyMinutes(history),
    [history],
  );
  const subjectMinutes = useMemo(
    () => computeSubjectStudyMinutes(history),
    [history],
  );
  const dailyPoints = useMemo(
    () => computeDailyStudyPoints(history, EVOLUTION_CHART_DAYS),
    [history],
  );
  const streak = useMemo(() => computeStudyStreak(history), [history]);
  const overallStats = useMemo(() => computeOverallStats(entries), [entries]);
  const goalProgress = useMemo(
    () => computeGoalProgress(history, settings.goal),
    [history, settings.goal],
  );

  return (
    <div className="flex flex-1 flex-col gap-8 px-4 py-6 sm:px-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Um resumo do que você já estudou e resolveu.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total estudado" value={formatHours(totalMinutes)} />
        <StatCard
          label="Streak"
          value={`${streak} dia${streak === 1 ? "" : "s"}`}
        />
        <StatCard
          label="Questões resolvidas"
          value={String(overallStats.total)}
        />
        <StatCard
          label="Taxa de acerto"
          value={formatAccuracy(overallStats.accuracy)}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-foreground text-sm font-semibold">
          Meta de estudo
        </h2>
        <GoalProgressCard progress={goalProgress} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-foreground text-sm font-semibold">
          Evolução — últimos {EVOLUTION_CHART_DAYS} dias
        </h2>
        <StudyEvolutionChart data={dailyPoints} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-foreground text-sm font-semibold">
          Horas estudadas por matéria
        </h2>
        <SubjectHoursList subjects={subjectMinutes} />
      </section>
    </div>
  );
}
