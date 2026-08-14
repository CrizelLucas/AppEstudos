"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useIsDarkMode } from "@/hooks/useIsDarkMode";
import type { DailyStudyPoint } from "@/lib/dashboard";

interface StudyEvolutionChartProps {
  data: DailyStudyPoint[];
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: { payload: DailyStudyPoint }[];
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-black/[.08] bg-white px-3 py-2 text-xs shadow-sm dark:border-white/[.145] dark:bg-zinc-900">
      <p className="text-foreground font-medium">{point.label}</p>
      <p className="text-zinc-500 dark:text-zinc-400">
        {point.pomodoros} pomodoro{point.pomodoros === 1 ? "" : "s"}
      </p>
    </div>
  );
}

export function StudyEvolutionChart({ data }: StudyEvolutionChartProps) {
  const isDark = useIsDarkMode();

  // Único hue sequencial (magnitude ao longo do tempo) — sem paleta categórica
  // aqui, já que é uma série só.
  const barColor = isDark ? "#38bdf8" : "#0ea5e9";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const tickColor = isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)";
  const cursorFill = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  return (
    <div className="h-56 w-full rounded-xl border border-black/[.08] bg-white p-3 dark:border-white/[.145] dark:bg-black">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: tickColor }}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: tickColor }}
            width={28}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: cursorFill }} />
          <Bar
            dataKey="pomodoros"
            fill={barColor}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
