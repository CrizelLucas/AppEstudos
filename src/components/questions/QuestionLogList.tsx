import { formatAccuracy } from "@/lib/questions";
import type { QuestionLogEntry } from "@/types/questions";

interface QuestionLogListProps {
  entries: QuestionLogEntry[];
  onDelete: (id: string) => void;
}

export function QuestionLogList({ entries, onDelete }: QuestionLogListProps) {
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-1.5">
      {sorted.map((entry) => {
        const accuracy =
          entry.total === 0 ? 0 : (entry.correct / entry.total) * 100;
        return (
          <div
            key={entry.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-black/[.08] px-3 py-1.5 text-sm dark:border-white/[.1]"
          >
            <span className="text-zinc-600 dark:text-zinc-400">
              {entry.date} ·{" "}
              <span className="text-foreground font-medium">
                {entry.subject}
              </span>{" "}
              · {entry.correct}/{entry.total} ({formatAccuracy(accuracy)})
            </span>
            <button
              type="button"
              onClick={() => onDelete(entry.id)}
              className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
            >
              Apagar
            </button>
          </div>
        );
      })}
    </div>
  );
}
