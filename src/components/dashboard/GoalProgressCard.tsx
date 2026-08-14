import type { GoalProgress } from "@/lib/settings";

interface GoalProgressCardProps {
  progress: GoalProgress;
}

const METRIC_LABEL: Record<GoalProgress["metric"], string> = {
  pomodoros: "pomodoros",
  horas: "horas",
};

const PERIOD_LABEL: Record<GoalProgress["period"], string> = {
  diaria: "diária",
  semanal: "semanal",
};

function formatAmount(value: number, metric: GoalProgress["metric"]): string {
  return metric === "horas" ? value.toFixed(1) : String(Math.round(value));
}

export function GoalProgressCard({ progress }: GoalProgressCardProps) {
  const { metric, period, current, target, percent } = progress;

  return (
    <div className="rounded-xl border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-black">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground font-medium">
          Meta {PERIOD_LABEL[period]}: {formatAmount(current, metric)} de{" "}
          {formatAmount(target, metric)} {METRIC_LABEL[metric]}
        </span>
        <span className="text-zinc-500 dark:text-zinc-400">
          {Math.round(percent)}%
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/[.1]">
        <div
          className="h-full rounded-full bg-sky-500 dark:bg-sky-400"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
