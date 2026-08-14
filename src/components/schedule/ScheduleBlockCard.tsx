import { formatTimeRange, type ScheduleBlockStatus } from "@/lib/schedule";
import type { ScheduleBlock } from "@/types/schedule";

interface ScheduleBlockCardProps {
  block: ScheduleBlock;
  /** Só é definido para a coluna do dia atual. */
  status?: ScheduleBlockStatus;
  onClick: () => void;
}

const STATUS_CLASSES: Record<ScheduleBlockStatus | "neutro", string> = {
  feito:
    "border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-950 dark:text-emerald-100",
  "em-andamento":
    "border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-950 dark:text-amber-100",
  pendente:
    "border-slate-300/80 bg-slate-100/80 hover:bg-slate-200/80 dark:border-slate-700/80 dark:bg-slate-800/60 dark:hover:bg-slate-800",
  neutro:
    "border-slate-200/80 bg-white/90 hover:bg-slate-100/80 dark:border-slate-700/80 dark:bg-slate-800/50 dark:hover:bg-slate-800",
};

const STATUS_BADGES: Record<
  ScheduleBlockStatus,
  { label: string; className: string }
> = {
  feito: {
    label: "✓ Feito",
    className: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300",
  },
  "em-andamento": {
    label: "Em andamento",
    className: "bg-amber-500/20 text-amber-600 dark:text-amber-300",
  },
  pendente: {
    label: "Pendente",
    className: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400",
  },
};

export function ScheduleBlockCard({
  block,
  status,
  onClick,
}: ScheduleBlockCardProps) {
  const badge = status ? STATUS_BADGES[status] : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-0 w-full flex-col gap-1.5 rounded-xl border p-3.5 text-left transition-all duration-150 active:scale-95 shadow-2xs ${
        STATUS_CLASSES[status ?? "neutro"]
      }`}
    >
      <div className="flex items-start justify-between gap-2 min-w-0">
        <span className="text-sm font-semibold leading-snug text-slate-800 break-words dark:text-slate-100">
          {block.subject}
        </span>
        {badge && (
          <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-bold whitespace-nowrap ${badge.className}`}>
            {badge.label}
          </span>
        )}
      </div>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {formatTimeRange(block.startTime, block.durationMinutes)}
      </span>
    </button>
  );
}

