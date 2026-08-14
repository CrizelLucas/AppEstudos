import type { ReviewFlag } from "@/types/questions";

interface ReviewFlagListProps {
  flags: ReviewFlag[];
  onDelete: (id: string) => void;
}

export function ReviewFlagList({ flags, onDelete }: ReviewFlagListProps) {
  if (flags.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Nenhuma questão marcada para revisar ainda.
      </p>
    );
  }

  const sorted = [...flags].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-1.5">
      {sorted.map((flag) => (
        <div
          key={flag.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm"
        >
          <div>
            <p className="text-foreground font-medium">{flag.subject}</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {flag.note}
            </p>
            {flag.reviewDate !== flag.date && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Adiada para {flag.reviewDate}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onDelete(flag.id)}
            className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
          >
            Remover
          </button>
        </div>
      ))}
    </div>
  );
}
