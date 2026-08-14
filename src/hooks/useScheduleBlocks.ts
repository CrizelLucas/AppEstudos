"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteScheduleBlock,
  insertScheduleBlock,
  loadScheduleBlocks,
  updateScheduleBlock,
} from "@/lib/storage";
import type { ScheduleBlock } from "@/types/schedule";

export function useScheduleBlocks() {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadScheduleBlocks().then((stored) => {
      if (!cancelled) setBlocks(stored);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const addBlock = useCallback((data: Omit<ScheduleBlock, "id">) => {
    insertScheduleBlock(data).then((created) => {
      setBlocks((current) => [...current, created]);
    });
  }, []);

  const updateBlock = useCallback(
    (id: string, data: Omit<ScheduleBlock, "id">) => {
      updateScheduleBlock(id, data).then((updated) => {
        setBlocks((current) =>
          current.map((block) => (block.id === id ? updated : block)),
        );
      });
    },
    [],
  );

  const removeBlock = useCallback((id: string) => {
    setBlocks((current) => current.filter((block) => block.id !== id));
    deleteScheduleBlock(id);
  }, []);

  return { blocks, addBlock, updateBlock, removeBlock };
}
