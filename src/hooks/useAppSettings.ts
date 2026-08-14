"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_APP_SETTINGS } from "@/lib/settings";
import { loadAppSettings, saveAppSettings } from "@/lib/storage";
import type { AppSettings } from "@/types/settings";

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    loadAppSettings().then((stored) => {
      if (!cancelled) setSettings(stored);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateSettings = useCallback((next: AppSettings) => {
    setSettings(next);
    saveAppSettings(next);
  }, []);

  return { settings, updateSettings };
}
