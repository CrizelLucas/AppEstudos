"use client";

import { useAppSettings } from "@/hooks/useAppSettings";
import { useTimerConfig } from "@/hooks/useTimerConfig";
import { useTimerStore } from "@/store/timerStore";
import type { TimerConfig } from "@/types/timer";
import { DataManagement } from "./DataManagement";
import { GoalSettingsForm } from "./GoalSettingsForm";
import { SoundToggle } from "./SoundToggle";
import { TimerSettingsForm } from "./TimerSettingsForm";

export function SettingsView() {
  const { config, updateConfig } = useTimerConfig();
  const { settings, updateSettings } = useAppSettings();

  // Além de persistir (updateConfig), aplica na store global do timer na
  // hora — senão o cronômetro só pegaria a mudança no próximo F5, já que o
  // "motor" (TimerEngine) não fica reobservando esta tela.
  function handleSaveTimerConfig(nextConfig: TimerConfig) {
    updateConfig(nextConfig);
    useTimerStore.getState().setConfig(nextConfig);
  }

  return (
    <div className="flex flex-1 flex-col gap-8 px-4 py-6 sm:px-6">
      <h1 className="text-foreground text-xl font-semibold">Configurações</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-foreground text-sm font-semibold">
          Tempos do Pomodoro
        </h2>
        <TimerSettingsForm config={config} onSave={handleSaveTimerConfig} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-foreground text-sm font-semibold">Sons</h2>
        <SoundToggle
          enabled={settings.soundEnabled}
          onChange={(soundEnabled) =>
            updateSettings({ ...settings, soundEnabled })
          }
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-foreground text-sm font-semibold">
          Meta de estudo
        </h2>
        <GoalSettingsForm
          goal={settings.goal}
          onSave={(goal) => updateSettings({ ...settings, goal })}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-foreground text-sm font-semibold">
          Backup dos dados
        </h2>
        <DataManagement />
      </section>
    </div>
  );
}
