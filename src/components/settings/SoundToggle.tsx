interface SoundToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function SoundToggle({ enabled, onChange }: SoundToggleProps) {
  return (
    <label className="flex w-full max-w-xs cursor-pointer items-center justify-between gap-3 rounded-lg border border-black/[.08] bg-white px-3 py-2 dark:border-white/[.145] dark:bg-black">
      <span className="text-foreground text-sm">Sons de alerta</span>
      <input
        type="checkbox"
        checked={enabled}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-foreground h-5 w-5"
      />
    </label>
  );
}
