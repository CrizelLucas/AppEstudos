import {
  getScheduleBlockStatus,
  sortByStartTime,
  WEEKDAY_LABELS,
} from "@/lib/schedule";
import type { ScheduleBlock, Weekday } from "@/types/schedule";
import { ScheduleBlockCard } from "./ScheduleBlockCard";

interface DayColumnProps {
  weekday: Weekday;
  blocks: ScheduleBlock[];
  isToday: boolean;
  getMinutesStudiedToday?: (subject: string) => number;
  onAddBlock: (weekday: Weekday) => void;
  onEditBlock: (block: ScheduleBlock) => void;
}

export function DayColumn({
  weekday,
  blocks,
  isToday,
  getMinutesStudiedToday,
  onAddBlock,
  onEditBlock,
}: DayColumnProps) {
  const sortedBlocks = sortByStartTime(blocks);

  return (
    <div
      className={`flex min-w-0 flex-col gap-3.5 rounded-2xl border p-4 transition-colors ${
        isToday
          ? "border-rose-500/40 bg-rose-500/5 shadow-xs dark:border-rose-500/30 dark:bg-rose-500/10"
          : "border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <div className="flex items-center justify-between min-w-0">
        <h3 className={`text-base font-bold truncate ${isToday ? "text-rose-600 dark:text-rose-400" : "text-slate-800 dark:text-slate-200"}`}>
          {WEEKDAY_LABELS[weekday]}
        </h3>
        {isToday && (
          <span className="shrink-0 rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-rose-600 dark:bg-rose-500/25 dark:text-rose-300">
            Hoje
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2.5 min-w-0">
        {sortedBlocks.length === 0 && (
          <p className="py-3 text-center text-sm font-medium text-slate-400 dark:text-slate-500 italic">
            Sem blocos
          </p>
        )}
        {sortedBlocks.map((block) => (
          <ScheduleBlockCard
            key={block.id}
            block={block}
            status={
              isToday && getMinutesStudiedToday
                ? getScheduleBlockStatus(
                    block,
                    getMinutesStudiedToday(block.subject),
                  )
                : undefined
            }
            onClick={() => onEditBlock(block)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => onAddBlock(weekday)}
        className="mt-1 flex items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 py-2.5 text-sm font-medium text-slate-500 transition-all duration-150 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-800 active:scale-95 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <span>+ Adicionar bloco</span>
      </button>
    </div>
  );
}

