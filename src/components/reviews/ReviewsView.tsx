"use client";

import { useMemo } from "react";
import { usePomodoroHistory } from "@/hooks/usePomodoroHistory";
import { useReviewFlags } from "@/hooks/useReviewFlags";
import { useSpacedReviewOverrides } from "@/hooks/useSpacedReviewOverrides";
import { getDateKey } from "@/lib/date";
import { getTodaySpacedReviewItems } from "@/lib/reviews";
import { capitalizeSubject } from "@/lib/subject";
import { ReviewItemCard } from "./ReviewItemCard";

export function ReviewsView() {
  const { history } = usePomodoroHistory();
  const { flags, removeFlag, postponeFlag } = useReviewFlags();
  const { overrides, markReviewed, postpone } = useSpacedReviewOverrides();

  const today = getDateKey();

  const dueFlags = useMemo(
    () =>
      flags
        .filter((flag) => flag.reviewDate <= today)
        .sort((a, b) => a.reviewDate.localeCompare(b.reviewDate)),
    [flags, today],
  );

  const spacedItems = useMemo(
    () => getTodaySpacedReviewItems(history, overrides, today),
    [history, overrides, today],
  );

  const totalCount = dueFlags.length + spacedItems.length;

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold">Revisões</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Questões marcadas para revisar e matérias estudadas há 1, 7 ou 30
          dias.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-foreground text-sm font-semibold">
          Revisões de hoje{totalCount > 0 && ` (${totalCount})`}
        </h2>

        {totalCount === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Nenhuma revisão pendente para hoje.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {dueFlags.map((flag) => (
              <ReviewItemCard
                key={`flag-${flag.id}`}
                subject={flag.subject}
                description={flag.note}
                onMarkReviewed={() => removeFlag(flag.id)}
                onPostpone={() => postponeFlag(flag.id)}
              />
            ))}
            {spacedItems.map((item) => (
              <ReviewItemCard
                key={`spaced-${item.id}`}
                subject={capitalizeSubject(item.subject)}
                description={`Revisão espaçada — estudado há ${item.intervalDays} dia${
                  item.intervalDays > 1 ? "s" : ""
                }`}
                onMarkReviewed={() => markReviewed(item)}
                onPostpone={() => postpone(item)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
