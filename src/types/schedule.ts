export const WEEKDAYS = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo",
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

export interface ScheduleBlock {
  id: string;
  weekday: Weekday;
  subject: string;
  /** Horário previsto, formato 24h "HH:MM". */
  startTime: string;
  durationMinutes: number;
}
