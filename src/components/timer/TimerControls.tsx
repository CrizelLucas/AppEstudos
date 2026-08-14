import type { CycleType } from "@/types/timer";

interface TimerControlsProps {
  isRunning: boolean;
  cycle?: CycleType;
  onPlayPause: () => void;
  onReset: () => void;
}

export function TimerControls({
  isRunning,
  cycle = "foco",
  onPlayPause,
  onReset,
}: TimerControlsProps) {
  const getGradientTheme = () => {
    switch (cycle) {
      case "foco":
        return "from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 shadow-rose-500/25";
      case "pausaCurta":
        return "from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/25";
      case "pausaLonga":
        return "from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 shadow-sky-500/25";
    }
  };

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Reset button */}
      <button
        type="button"
        onClick={onReset}
        title="Reiniciar ciclo"
        className="group flex h-12 w-12 sm:h-13 sm:w-auto sm:px-5 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-xs transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        <svg
          className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span className="hidden sm:inline text-sm font-medium">Reiniciar</span>
      </button>

      {/* Main Play / Pause button */}
      <button
        type="button"
        onClick={onPlayPause}
        className={`flex h-14 w-40 items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r ${getGradientTheme()} text-white font-semibold text-base shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-95`}
      >
        {isRunning ? (
          <>
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
            <span>Pausar</span>
          </>
        ) : (
          <>
            <svg className="h-5 w-5 fill-current translate-x-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Iniciar</span>
          </>
        )}
      </button>
    </div>
  );
}

