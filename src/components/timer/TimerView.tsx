"use client";

import { useCallback, useMemo } from "react";
import { usePomodoroHistory } from "@/hooks/usePomodoroHistory";
import { useScheduleBlocks } from "@/hooks/useScheduleBlocks";
import { requestNotificationPermission } from "@/lib/notifications";
import { primeAudioContext } from "@/lib/sound";
import {
  CYCLE_LABELS,
  cycleDurationInSeconds,
  formatTime,
} from "@/lib/timer";
import { useLiveSecondsLeft, useTimerStore } from "@/store/timerStore";
import { ProgressRing } from "./ProgressRing";
import { SubjectField } from "./SubjectField";
import { TimerControls } from "./TimerControls";

export function TimerView() {
  const { completedToday } = usePomodoroHistory();
  const { blocks } = useScheduleBlocks();

  const cycle = useTimerStore((state) => state.cycle);
  const cyclesSinceLongBreak = useTimerStore((state) => state.cyclesSinceLongBreak);
  const isRunning = useTimerStore((state) => state.isRunning);
  const config = useTimerStore((state) => state.config);
  const subject = useTimerStore((state) => state.subject);
  const setSubject = useTimerStore((state) => state.setSubject);
  const play = useTimerStore((state) => state.play);
  const pause = useTimerStore((state) => state.pause);
  const reset = useTimerStore((state) => state.reset);

  const secondsLeft = useLiveSecondsLeft();
  const totalSeconds = cycleDurationInSeconds(cycle, config);

  const subjectSuggestions = useMemo(
    () => Array.from(new Set(blocks.map((block) => block.subject))).sort(),
    [blocks],
  );

  const handlePlay = useCallback(() => {
    primeAudioContext();
    requestNotificationPermission();
    play();
  }, [play]);

  const elapsedProgress =
    totalSeconds === 0 ? 0 : 1 - secondsLeft / totalSeconds;

  const cycleBadgeColors = {
    foco: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300 border-rose-500/20",
    pausaCurta: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500/20",
    pausaLonga: "bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300 border-sky-500/20",
  };

  const statusDotColors = {
    foco: "bg-rose-500",
    pausaCurta: "bg-emerald-500",
    pausaLonga: "bg-sky-500",
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-7 px-4 py-8 max-w-xl mx-auto w-full">
      {/* Top Cycle Badge & Progress Dots */}
      <div className="flex flex-col items-center gap-2">
        <div
          className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold tracking-wide uppercase transition-colors shadow-sm ${cycleBadgeColors[cycle]}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${statusDotColors[cycle]} ${
              isRunning ? "animate-pulse" : ""
            }`}
          />
          <span>{CYCLE_LABELS[cycle]}</span>
        </div>

        {/* Round progress indicator dots (e.g. 4 pomodoros round) */}
        <div className="flex items-center gap-1.5 pt-1">
          {Array.from({ length: config.cyclesBeforeLongBreak }).map((_, index) => {
            const isCompleted = index < cyclesSinceLongBreak;
            const isCurrent = index === cyclesSinceLongBreak && cycle === "foco";
            return (
              <span
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isCompleted
                    ? "w-6 bg-rose-500 dark:bg-rose-400"
                    : isCurrent
                    ? "w-4 bg-rose-400/60 dark:bg-rose-400/60 animate-pulse"
                    : "w-2 bg-slate-200 dark:bg-slate-800"
                }`}
                title={`Pomodoro ${index + 1} de ${config.cyclesBeforeLongBreak}`}
              />
            );
          })}
        </div>
      </div>

      {/* Main Timer Display */}
      <ProgressRing
        progress={elapsedProgress}
        cycle={cycle}
        size={442}
        className="h-64 w-64 sm:h-[380px] sm:w-[380px] my-2"
      >
        <div className="flex flex-col items-center justify-center">
          <span className="text-5xl font-extrabold tracking-tight tabular-nums sm:text-7xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent dark:from-white dark:via-slate-100 dark:to-slate-300">
            {formatTime(secondsLeft)}
          </span>
          <span className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            {isRunning ? "em andamento" : "pausado"}
          </span>
        </div>
      </ProgressRing>

      {/* Subject Input */}
      <SubjectField
        value={subject}
        onChange={setSubject}
        suggestions={subjectSuggestions}
      />

      {/* Timer Controls */}
      <TimerControls
        isRunning={isRunning}
        cycle={cycle}
        onPlayPause={isRunning ? pause : handlePlay}
        onReset={reset}
      />

      {/* Today's Stats Card */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <span className="text-xl">🔥</span>
        <div className="text-xs">
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            {completedToday} pomodoro{completedToday === 1 ? "" : "s"} concluído{completedToday === 1 ? "" : "s"} hoje
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            {completedToday === 0
              ? "Inicie seu primeiro bloco de foco!"
              : "Excelente ritmo de estudos!"}
          </p>
        </div>
      </div>
    </div>
  );
}

