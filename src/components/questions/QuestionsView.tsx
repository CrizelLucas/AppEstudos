"use client";

import { useMemo } from "react";
import { useQuestionLog } from "@/hooks/useQuestionLog";
import { useReviewFlags } from "@/hooks/useReviewFlags";
import { useScheduleBlocks } from "@/hooks/useScheduleBlocks";
import { computeSubjectStats } from "@/lib/questions";
import { QuestionLogForm } from "./QuestionLogForm";
import { QuestionLogList } from "./QuestionLogList";
import { ReviewFlagForm } from "./ReviewFlagForm";
import { ReviewFlagList } from "./ReviewFlagList";
import { SubjectStatsList } from "./SubjectStatsList";

export function QuestionsView() {
  const { entries, addEntry, removeEntry } = useQuestionLog();
  const { flags, addFlag, removeFlag } = useReviewFlags();
  const { blocks } = useScheduleBlocks();

  const subjectSuggestions = useMemo(() => {
    const subjects = new Set<string>();
    for (const block of blocks) subjects.add(block.subject);
    for (const entry of entries) subjects.add(entry.subject);
    return Array.from(subjects).sort();
  }, [blocks, entries]);

  const stats = useMemo(() => computeSubjectStats(entries), [entries]);

  return (
    <div className="flex flex-1 flex-col gap-8 px-4 py-6 sm:px-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold">Questões</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Registre quantas questões você resolveu por matéria e acompanhe sua
          taxa de acerto.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-foreground text-sm font-semibold">
          Registrar questões
        </h2>
        <QuestionLogForm
          subjectSuggestions={subjectSuggestions}
          onSubmit={addEntry}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-foreground text-sm font-semibold">
          Taxa de acerto por matéria
        </h2>
        <SubjectStatsList stats={stats} />
      </section>

      {entries.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-foreground text-sm font-semibold">Histórico</h2>
          <QuestionLogList entries={entries} onDelete={removeEntry} />
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-foreground text-sm font-semibold">
          Revisar depois
        </h2>
        <ReviewFlagForm
          subjectSuggestions={subjectSuggestions}
          onSubmit={addFlag}
        />
        <ReviewFlagList flags={flags} onDelete={removeFlag} />
      </section>
    </div>
  );
}
