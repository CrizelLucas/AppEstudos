import type { ReactNode } from "react";
import type { CycleType } from "@/types/timer";

interface ProgressRingProps {
  /** Fração já decorrida do ciclo, de 0 a 1. */
  progress: number;
  /** Ciclo atual para selecionar a paleta de cores em gradiente. */
  cycle?: CycleType;
  /** Tamanho "de referência" — só define as proporções internas do SVG (viewBox). */
  size?: number;
  strokeWidth?: number;
  progressClassName?: string;
  /** Classes Tailwind que controlam o tamanho renderizado (ex: responsivo por breakpoint). */
  className?: string;
  children?: ReactNode;
}

export function ProgressRing({
  progress,
  cycle = "foco",
  size = 260,
  strokeWidth = 12,
  progressClassName,
  className = "h-[260px] w-[260px]",
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const dashOffset = circumference * (1 - clampedProgress);

  const gradientId = `timer-gradient-${cycle}`;

  return (
    <div className={`relative ${className}`}>
      <svg viewBox={`0 0 ${size} ${size}`} className="relative h-full w-full -rotate-90">
        <defs>
          <linearGradient id="timer-gradient-foco" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" /> {/* rose-500 */}
            <stop offset="100%" stopColor="#fb923c" /> {/* orange-400 */}
          </linearGradient>
          <linearGradient id="timer-gradient-pausaCurta" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" /> {/* emerald-500 */}
            <stop offset="100%" stopColor="#14b8a6" /> {/* teal-500 */}
          </linearGradient>
          <linearGradient id="timer-gradient-pausaLonga" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" /> {/* sky-600 */}
            <stop offset="100%" stopColor="#6366f1" /> {/* indigo-500 */}
          </linearGradient>
        </defs>

        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className="stroke-slate-200 dark:stroke-slate-800"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          stroke={progressClassName ? undefined : `url(#${gradientId})`}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={`${progressClassName ?? ""} transition-[stroke-dashoffset] duration-300 ease-linear`}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}


