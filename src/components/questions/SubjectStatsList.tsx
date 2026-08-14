import { formatAccuracy, type SubjectStats } from "@/lib/questions";

interface SubjectStatsListProps {
  stats: SubjectStats[];
}

function accuracyClassName(accuracy: number): string {
  if (accuracy >= 70) return "text-emerald-600 dark:text-emerald-400";
  if (accuracy >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function SubjectStatsList({ stats }: SubjectStatsListProps) {
  if (stats.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Nenhuma questão registrada ainda.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {stats.map((entry) => (
        <div
          key={entry.subject}
          className="flex items-center justify-between gap-3 rounded-lg border border-black/[.08] bg-white px-3 py-2 dark:border-white/[.145] dark:bg-black"
        >
          <div>
            <p className="text-foreground text-sm font-medium">
              {entry.subject}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {entry.total} questões · {entry.correct} acertos · {entry.wrong}{" "}
              erros
            </p>
          </div>
          <span
            className={`text-sm font-semibold ${accuracyClassName(entry.accuracy)}`}
          >
            {formatAccuracy(entry.accuracy)}
          </span>
        </div>
      ))}
    </div>
  );
}
