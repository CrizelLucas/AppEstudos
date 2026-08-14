"use client";

import { useCallback, useEffect, useState } from "react";
import { getDateKey } from "@/lib/date";
import type { SpacedReviewCandidate } from "@/lib/reviews";
import {
  loadSpacedReviewOverrides,
  saveSpacedReviewOverride,
} from "@/lib/storage";
import type { SpacedReviewOverride } from "@/types/reviews";

export function useSpacedReviewOverrides() {
  const [overrides, setOverrides] = useState<
    Record<string, SpacedReviewOverride>
  >({});

  useEffect(() => {
    let cancelled = false;
    loadSpacedReviewOverrides().then((stored) => {
      if (!cancelled) setOverrides(stored);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const markReviewed = useCallback((candidate: SpacedReviewCandidate) => {
    const override: SpacedReviewOverride = {
      id: candidate.id,
      subject: candidate.subject,
      studiedDate: candidate.studiedDate,
      intervalDays: candidate.intervalDays,
      status: "revisado",
    };
    setOverrides((current) => ({ ...current, [candidate.id]: override }));
    saveSpacedReviewOverride(override);
  }, []);

  const postpone = useCallback((candidate: SpacedReviewCandidate) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const override: SpacedReviewOverride = {
      id: candidate.id,
      subject: candidate.subject,
      studiedDate: candidate.studiedDate,
      intervalDays: candidate.intervalDays,
      status: "adiado",
      effectiveDate: getDateKey(tomorrow),
    };
    setOverrides((current) => ({ ...current, [candidate.id]: override }));
    saveSpacedReviewOverride(override);
  }, []);

  return { overrides, markReviewed, postpone };
}
