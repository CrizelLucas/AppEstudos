"use client";

import { useMemo, useState } from "react";
import { usePomodoroHistory } from "@/hooks/usePomodoroHistory";
import { useScheduleBlocks } from "@/hooks/useScheduleBlocks";
import { Modal } from "@/components/ui/Modal";
import { getWeekdayKey } from "@/lib/schedule";
import { WEEKDAYS } from "@/types/schedule";
import type { ScheduleBlock, Weekday } from "@/types/schedule";
import { DayColumn } from "./DayColumn";
import { ScheduleBlockForm } from "./ScheduleBlockForm";

type FormState =
  | { mode: "closed" }
  | { mode: "create"; weekday: Weekday }
  | { mode: "edit"; block: ScheduleBlock };

export function ScheduleView() {
  const { blocks, addBlock, updateBlock, removeBlock } = useScheduleBlocks();
  const { getMinutesStudiedToday } = usePomodoroHistory();
  const [formState, setFormState] = useState<FormState>({ mode: "closed" });

  const today = getWeekdayKey();

  const blocksByWeekday = useMemo(() => {
    const grouped = new Map<Weekday, ScheduleBlock[]>();
    for (const weekday of WEEKDAYS) grouped.set(weekday, []);
    for (const block of blocks) grouped.get(block.weekday)?.push(block);
    return grouped;
  }, [blocks]);

  const subjectSuggestions = useMemo(
    () => Array.from(new Set(blocks.map((block) => block.subject))).sort(),
    [blocks],
  );

  function handleSubmit(values: Omit<ScheduleBlock, "id">) {
    if (formState.mode === "edit") {
      updateBlock(formState.block.id, values);
    } else {
      addBlock(values);
    }
    setFormState({ mode: "closed" });
  }

  function handleDelete() {
    if (formState.mode !== "edit") return;
    if (window.confirm("Apagar este bloco de estudo?")) {
      removeBlock(formState.block.id);
      setFormState({ mode: "closed" });
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[2000px] flex-1 flex-col gap-6 px-4 py-8 sm:px-8 lg:px-12">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          📅 Cronograma Semanal
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Organize seus blocos de estudo para cada dia da semana.
        </p>
      </div>

      {/* Grid container with min-w-0 to prevent layout thrashing / scrollbar flickering */}
      <div className="w-full min-w-0 overflow-x-auto pb-4 scrollbar-none">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 min-w-[300px]">
          {WEEKDAYS.map((weekday) => (
            <DayColumn
              key={weekday}
              weekday={weekday}
              blocks={blocksByWeekday.get(weekday) ?? []}
              isToday={weekday === today}
              getMinutesStudiedToday={
                weekday === today ? getMinutesStudiedToday : undefined
              }
              onAddBlock={(w) => setFormState({ mode: "create", weekday: w })}
              onEditBlock={(block) => setFormState({ mode: "edit", block })}
            />
          ))}
        </div>
      </div>

      {/* Modal form */}
      {formState.mode !== "closed" && (
        <Modal onClose={() => setFormState({ mode: "closed" })}>
          <ScheduleBlockForm
            weekday={
              formState.mode === "edit"
                ? formState.block.weekday
                : formState.weekday
            }
            initialBlock={
              formState.mode === "edit" ? formState.block : undefined
            }
            subjectSuggestions={subjectSuggestions}
            onSubmit={handleSubmit}
            onCancel={() => setFormState({ mode: "closed" })}
            onDelete={formState.mode === "edit" ? handleDelete : undefined}
          />
        </Modal>
      )}
    </div>
  );
}

