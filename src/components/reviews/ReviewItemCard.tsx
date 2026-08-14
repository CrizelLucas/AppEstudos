interface ReviewItemCardProps {
  subject: string;
  description: string;
  onMarkReviewed: () => void;
  onPostpone: () => void;
}

export function ReviewItemCard({
  subject,
  description,
  onMarkReviewed,
  onPostpone,
}: ReviewItemCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-black/[.08] bg-white px-3 py-2 text-sm dark:border-white/[.145] dark:bg-black">
      <div>
        <p className="text-foreground font-medium">{subject}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onPostpone}
          className="rounded-full border border-black/[.08] px-3 py-1 text-xs font-medium text-zinc-700 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-300 dark:hover:bg-white/[.08]"
        >
          Adiar
        </button>
        <button
          type="button"
          onClick={onMarkReviewed}
          className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Revisado
        </button>
      </div>
    </div>
  );
}
