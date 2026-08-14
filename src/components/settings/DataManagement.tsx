"use client";

import { useRef, useState, type ChangeEvent } from "react";
import {
  exportAllData,
  importAllData,
  resetTimerData,
  type ExportedData,
} from "@/lib/storage";

export function DataManagement() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleResetTimer() {
    if (
      !window.confirm(
        "Isso vai apagar os tempos configurados do Pomodoro, o histórico de pomodoros concluídos e o ciclo em andamento. Cronograma, questões e revisões não são afetados. Continuar?",
      )
    ) {
      return;
    }

    await resetTimerData();
    setMessage("Dados do cronômetro resetados. Recarregando...");
    window.location.reload();
  }

  async function handleExport() {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `pomodoro-bb-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();

    URL.revokeObjectURL(url);
    setMessage("Backup baixado.");
  }

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // permite escolher o mesmo arquivo de novo, se precisar

    if (!file) return;

    if (
      !window.confirm(
        "Importar vai ADICIONAR os dados desse backup à sua conta atual (cronograma, questões, revisões e histórico) — não apaga o que já existe. Continuar?",
      )
    ) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<ExportedData>;
      await importAllData(parsed);
      setMessage("Dados importados com sucesso. Recarregando...");
      window.location.reload();
    } catch {
      setMessage(
        "Não deu pra importar esse arquivo — confira se é um backup válido do Pomodoro BB.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="bg-foreground text-background rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Exportar dados (.json)
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full border border-black/[.08] px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-300 dark:hover:bg-white/[.08]"
        >
          Importar dados
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleImportFile}
          className="hidden"
        />
      </div>
      {message && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
      )}

      <div className="mt-2 border-t border-black/[.08] pt-3 dark:border-white/[.145]">
        <button
          type="button"
          onClick={handleResetTimer}
          className="rounded-full border border-red-500/30 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          Resetar dados do cronômetro
        </button>
        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          Apaga os tempos configurados, o histórico de pomodoros e o ciclo em
          andamento. Cronograma, questões e revisões não são afetados.
        </p>
      </div>
    </div>
  );
}
