"use client";

import { useCallback, useEffect, useState } from "react";
import { getDateKey } from "@/lib/date";
import {
  deleteReviewFlag,
  insertReviewFlag,
  loadReviewFlags,
  updateReviewFlagDate,
} from "@/lib/storage";
import type { ReviewFlag } from "@/types/questions";

interface NewReviewFlag {
  subject: string;
  note: string;
}

export function useReviewFlags() {
  const [flags, setFlags] = useState<ReviewFlag[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadReviewFlags().then((stored) => {
      if (!cancelled) setFlags(stored);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const addFlag = useCallback((data: NewReviewFlag) => {
    const today = getDateKey();
    insertReviewFlag({
      subject: data.subject,
      note: data.note,
      date: today,
      reviewDate: today,
    }).then((created) => {
      setFlags((current) => [...current, created]);
    });
  }, []);

  const removeFlag = useCallback((id: string) => {
    setFlags((current) => current.filter((flag) => flag.id !== id));
    deleteReviewFlag(id);
  }, []);

  /** Empurra a data de revisão pra amanhã, sem apagar a questão marcada. */
  const postponeFlag = useCallback((id: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = getDateKey(tomorrow);

    setFlags((current) =>
      current.map((flag) =>
        flag.id === id ? { ...flag, reviewDate: tomorrowKey } : flag,
      ),
    );
    updateReviewFlagDate(id, tomorrowKey);
  }, []);

  return { flags, addFlag, removeFlag, postponeFlag };
}
