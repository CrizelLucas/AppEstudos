import type { ScheduleBlock, Weekday } from "@/types/schedule";

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  segunda: "Segunda",
  terca: "Terça",
  quarta: "Quarta",
  quinta: "Quinta",
  sexta: "Sexta",
  sabado: "Sábado",
  domingo: "Domingo",
};

const JS_DAY_TO_WEEKDAY: Record<number, Weekday> = {
  0: "domingo",
  1: "segunda",
  2: "terca",
  3: "quarta",
  4: "quinta",
  5: "sexta",
  6: "sabado",
};

export function getWeekdayKey(date: Date = new Date()): Weekday {
  return JS_DAY_TO_WEEKDAY[date.getDay()];
}

/** Ex: formatTimeRange("14:00", 50) -> "14:00 – 14:50" (passa da meia-noite se preciso). */
export function formatTimeRange(
  startTime: string,
  durationMinutes: number,
): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const startTotal = hours * 60 + minutes;
  const endTotal = startTotal + durationMinutes;
  const endHours = Math.floor(endTotal / 60) % 24;
  const endMinutes = endTotal % 60;
  const end = `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
  return `${startTime} – ${end}`;
}

export function sortByStartTime(blocks: ScheduleBlock[]): ScheduleBlock[] {
  return [...blocks].sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export type ScheduleBlockStatus = "feito" | "em-andamento" | "pendente";

/**
 * Compara os minutos já estudados hoje na matéria do bloco (ver
 * `getMinutesStudiedToday`) com a duração total do bloco:
 * - 0 minutos -> pendente
 * - entre 0 e a duração total -> em andamento
 * - atingiu ou passou a duração total -> feito
 */
export function getScheduleBlockStatus(
  block: ScheduleBlock,
  minutesStudiedToday: number,
): ScheduleBlockStatus {
  if (minutesStudiedToday <= 0) return "pendente";
  if (minutesStudiedToday >= block.durationMinutes) return "feito";
  return "em-andamento";
}
