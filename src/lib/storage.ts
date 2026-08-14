import { createClient } from "@/lib/supabase/client";
import { getDateKey } from "@/lib/date";
import { DEFAULT_APP_SETTINGS } from "@/lib/settings";
import { DEFAULT_TIMER_CONFIG } from "@/lib/timer";
import type { QuestionLogEntry, ReviewFlag } from "@/types/questions";
import type { SpacedReviewOverride } from "@/types/reviews";
import type { ScheduleBlock } from "@/types/schedule";
import type { AppSettings, GoalMetric, GoalPeriod } from "@/types/settings";
import type { PomodoroHistory, TimerConfig, TimerRuntimeState } from "@/types/timer";

/**
 * Ponto único de acesso a dados persistidos (Supabase/Postgres, isolado por
 * usuário via RLS). Trocar de backend no futuro significa reescrever só este
 * arquivo — quem consome continua chamando as mesmas funções.
 */

// ---------------------------------------------------------------------------
// user_settings — 1 linha por usuário, junta TimerConfig + AppSettings
// ---------------------------------------------------------------------------

export async function loadTimerConfig(): Promise<TimerConfig | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("user_settings")
    .select(
      "focus_minutes, short_break_minutes, long_break_minutes, cycles_before_long_break",
    )
    .maybeSingle();
  if (!data) return null;

  return {
    focusMinutes: data.focus_minutes,
    shortBreakMinutes: data.short_break_minutes,
    longBreakMinutes: data.long_break_minutes,
    cyclesBeforeLongBreak: data.cycles_before_long_break,
  };
}

export async function saveTimerConfig(config: TimerConfig): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("user_settings").upsert({
    user_id: user.id,
    focus_minutes: config.focusMinutes,
    short_break_minutes: config.shortBreakMinutes,
    long_break_minutes: config.longBreakMinutes,
    cycles_before_long_break: config.cyclesBeforeLongBreak,
  });
}

export async function loadAppSettings(): Promise<AppSettings> {
  const supabase = createClient();
  const { data } = await supabase
    .from("user_settings")
    .select("sound_enabled, goal_metric, goal_period, goal_target")
    .maybeSingle();
  if (!data) return DEFAULT_APP_SETTINGS;

  return {
    soundEnabled: data.sound_enabled,
    goal: {
      metric: data.goal_metric as GoalMetric,
      period: data.goal_period as GoalPeriod,
      target: data.goal_target,
    },
  };
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("user_settings").upsert({
    user_id: user.id,
    sound_enabled: settings.soundEnabled,
    goal_metric: settings.goal.metric,
    goal_period: settings.goal.period,
    goal_target: settings.goal.target,
  });
}

/**
 * Só os tempos do Pomodoro voltam ao padrão (`DEFAULT_TIMER_CONFIG`) — som e
 * meta de estudo (que moram na mesma linha) ficam intactos, assim como
 * cronograma, questões e revisões.
 */
export async function resetTimerData(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("user_settings")
    .update({
      focus_minutes: DEFAULT_TIMER_CONFIG.focusMinutes,
      short_break_minutes: DEFAULT_TIMER_CONFIG.shortBreakMinutes,
      long_break_minutes: DEFAULT_TIMER_CONFIG.longBreakMinutes,
      cycles_before_long_break: DEFAULT_TIMER_CONFIG.cyclesBeforeLongBreak,
    })
    .eq("user_id", user.id);
  await supabase.from("timer_runtime_state").delete().eq("user_id", user.id);
  await supabase.from("pomodoro_completions").delete().eq("user_id", user.id);
}

// ---------------------------------------------------------------------------
// timer_runtime_state — 1 linha por usuário, ciclo do Pomodoro em andamento
// ---------------------------------------------------------------------------

const VALID_CYCLES = new Set(["foco", "pausaCurta", "pausaLonga"]);

export async function loadTimerRuntimeState(): Promise<TimerRuntimeState | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("timer_runtime_state")
    .select(
      "cycle, cycles_since_long_break, is_running, cycle_end_timestamp, paused_seconds_left, subject",
    )
    .maybeSingle();
  if (!data || !VALID_CYCLES.has(data.cycle)) return null;

  return {
    cycle: data.cycle,
    cyclesSinceLongBreak: data.cycles_since_long_break,
    isRunning: data.is_running,
    cycleEndTimestamp: data.cycle_end_timestamp
      ? new Date(data.cycle_end_timestamp).getTime()
      : null,
    pausedSecondsLeft: data.paused_seconds_left,
    subject: data.subject,
  };
}

export async function saveTimerRuntimeState(
  state: TimerRuntimeState,
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("timer_runtime_state").upsert({
    user_id: user.id,
    cycle: state.cycle,
    cycles_since_long_break: state.cyclesSinceLongBreak,
    is_running: state.isRunning,
    cycle_end_timestamp: state.cycleEndTimestamp
      ? new Date(state.cycleEndTimestamp).toISOString()
      : null,
    paused_seconds_left: Math.round(state.pausedSecondsLeft),
    subject: state.subject,
  });
}

// ---------------------------------------------------------------------------
// pomodoro_completions — log de eventos (1 linha por pomodoro de foco
// concluído); reconstruímos o formato agregado `PomodoroHistory` em memória
// depois de buscar, pra `lib/dashboard.ts`/`lib/reviews.ts`/`lib/schedule.ts`
// continuarem operando sem mudanças.
// ---------------------------------------------------------------------------

interface PomodoroCompletionRow {
  subject: string;
  minutes: number;
  completed_at: string;
}

function toHistory(rows: PomodoroCompletionRow[]): PomodoroHistory {
  const history: PomodoroHistory = {};
  for (const row of rows) {
    const dateKey = getDateKey(new Date(row.completed_at));
    const dayEntries = history[dateKey] ?? (history[dateKey] = {});
    const existing = dayEntries[row.subject] ?? { count: 0, minutes: 0 };
    dayEntries[row.subject] = {
      count: existing.count + 1,
      minutes: existing.minutes + row.minutes,
    };
  }
  return history;
}

export async function loadPomodoroHistory(): Promise<PomodoroHistory> {
  const supabase = createClient();
  const { data } = await supabase
    .from("pomodoro_completions")
    .select("subject, minutes, completed_at");
  return toHistory(data ?? []);
}

/** `subject` já deve chegar normalizado (ver `normalizeSubject`). */
export async function insertPomodoroCompletion(
  subject: string,
  minutes: number,
): Promise<void> {
  const supabase = createClient();
  await supabase.from("pomodoro_completions").insert({ subject, minutes });
}

// ---------------------------------------------------------------------------
// schedule_blocks
// ---------------------------------------------------------------------------

interface ScheduleBlockRow {
  id: string;
  weekday: ScheduleBlock["weekday"];
  subject: string;
  start_time: string;
  duration_minutes: number;
}

function fromScheduleBlockRow(row: ScheduleBlockRow): ScheduleBlock {
  return {
    id: row.id,
    weekday: row.weekday,
    subject: row.subject,
    startTime: row.start_time,
    durationMinutes: row.duration_minutes,
  };
}

export async function loadScheduleBlocks(): Promise<ScheduleBlock[]> {
  const supabase = createClient();
  const { data } = await supabase.from("schedule_blocks").select("*");
  return (data ?? []).map(fromScheduleBlockRow);
}

export async function insertScheduleBlock(
  block: Omit<ScheduleBlock, "id">,
): Promise<ScheduleBlock> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("schedule_blocks")
    .insert({
      weekday: block.weekday,
      subject: block.subject,
      start_time: block.startTime,
      duration_minutes: block.durationMinutes,
    })
    .select()
    .single();
  if (error || !data) throw error ?? new Error("Falha ao criar bloco de estudo.");
  return fromScheduleBlockRow(data);
}

export async function updateScheduleBlock(
  id: string,
  block: Omit<ScheduleBlock, "id">,
): Promise<ScheduleBlock> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("schedule_blocks")
    .update({
      weekday: block.weekday,
      subject: block.subject,
      start_time: block.startTime,
      duration_minutes: block.durationMinutes,
    })
    .eq("id", id)
    .select()
    .single();
  if (error || !data)
    throw error ?? new Error("Falha ao atualizar bloco de estudo.");
  return fromScheduleBlockRow(data);
}

export async function deleteScheduleBlock(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("schedule_blocks").delete().eq("id", id);
}

// ---------------------------------------------------------------------------
// question_log
// ---------------------------------------------------------------------------

export async function loadQuestionLogEntries(): Promise<QuestionLogEntry[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("question_log")
    .select("id, subject, date, total, correct, wrong")
    .order("date", { ascending: false });
  return data ?? [];
}

export async function insertQuestionLogEntry(
  entry: Omit<QuestionLogEntry, "id">,
): Promise<QuestionLogEntry> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("question_log")
    .insert({
      subject: entry.subject,
      date: entry.date,
      total: entry.total,
      correct: entry.correct,
      wrong: entry.wrong,
    })
    .select("id, subject, date, total, correct, wrong")
    .single();
  if (error || !data) throw error ?? new Error("Falha ao registrar questões.");
  return data;
}

export async function deleteQuestionLogEntry(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("question_log").delete().eq("id", id);
}

// ---------------------------------------------------------------------------
// review_flags
// ---------------------------------------------------------------------------

interface ReviewFlagRow {
  id: string;
  subject: string;
  note: string;
  date: string;
  review_date: string;
}

function fromReviewFlagRow(row: ReviewFlagRow): ReviewFlag {
  return {
    id: row.id,
    subject: row.subject,
    note: row.note,
    date: row.date,
    reviewDate: row.review_date,
  };
}

export async function loadReviewFlags(): Promise<ReviewFlag[]> {
  const supabase = createClient();
  const { data } = await supabase.from("review_flags").select("*");
  return (data ?? []).map(fromReviewFlagRow);
}

export async function insertReviewFlag(flag: {
  subject: string;
  note: string;
  date: string;
  reviewDate: string;
}): Promise<ReviewFlag> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("review_flags")
    .insert({
      subject: flag.subject,
      note: flag.note,
      date: flag.date,
      review_date: flag.reviewDate,
    })
    .select()
    .single();
  if (error || !data)
    throw error ?? new Error("Falha ao marcar questão para revisão.");
  return fromReviewFlagRow(data);
}

export async function deleteReviewFlag(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("review_flags").delete().eq("id", id);
}

export async function updateReviewFlagDate(
  id: string,
  reviewDate: string,
): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("review_flags")
    .update({ review_date: reviewDate })
    .eq("id", id);
}

// ---------------------------------------------------------------------------
// spaced_review_overrides
// ---------------------------------------------------------------------------

interface SpacedReviewOverrideRow {
  subject: string;
  studied_date: string;
  interval_days: number;
  status: SpacedReviewOverride["status"];
  effective_date: string | null;
}

/** Mesma chave sintética usada por `lib/reviews.ts` (`studiedDate:subject:intervalDays`). */
function overrideKey(subject: string, studiedDate: string, intervalDays: number): string {
  return `${studiedDate}:${subject}:${intervalDays}`;
}

function fromOverrideRow(row: SpacedReviewOverrideRow): SpacedReviewOverride {
  const id = overrideKey(row.subject, row.studied_date, row.interval_days);
  return {
    id,
    subject: row.subject,
    studiedDate: row.studied_date,
    intervalDays: row.interval_days,
    status: row.status,
    effectiveDate: row.effective_date ?? undefined,
  };
}

export async function loadSpacedReviewOverrides(): Promise<
  Record<string, SpacedReviewOverride>
> {
  const supabase = createClient();
  const { data } = await supabase
    .from("spaced_review_overrides")
    .select("subject, studied_date, interval_days, status, effective_date");

  const result: Record<string, SpacedReviewOverride> = {};
  for (const row of data ?? []) {
    const override = fromOverrideRow(row);
    result[override.id] = override;
  }
  return result;
}

export async function saveSpacedReviewOverride(
  override: SpacedReviewOverride,
): Promise<void> {
  const supabase = createClient();
  await supabase.from("spaced_review_overrides").upsert(
    {
      subject: override.subject,
      studied_date: override.studiedDate,
      interval_days: override.intervalDays,
      status: override.status,
      effective_date: override.effectiveDate ?? null,
    },
    { onConflict: "user_id,subject,studied_date,interval_days" },
  );
}

// ---------------------------------------------------------------------------
// Backup (export/import) — cada pessoa exporta/importa só os próprios dados
// ---------------------------------------------------------------------------

export interface ExportedData {
  version: 2;
  exportedAt: string;
  timerConfig: TimerConfig;
  appSettings: AppSettings;
  pomodoroCompletions: { subject: string; minutes: number; completedAt: string }[];
  scheduleBlocks: ScheduleBlock[];
  questionLog: QuestionLogEntry[];
  reviewFlags: ReviewFlag[];
  spacedReviewOverrides: Record<string, SpacedReviewOverride>;
}

/** Reúne tudo que o usuário logado tem salvo, pra baixar como backup. */
export async function exportAllData(): Promise<ExportedData> {
  const supabase = createClient();

  const [
    timerConfig,
    appSettings,
    completions,
    scheduleBlocks,
    questionLog,
    reviewFlags,
    spacedReviewOverrides,
  ] = await Promise.all([
    loadTimerConfig(),
    loadAppSettings(),
    supabase.from("pomodoro_completions").select("subject, minutes, completed_at"),
    loadScheduleBlocks(),
    loadQuestionLogEntries(),
    loadReviewFlags(),
    loadSpacedReviewOverrides(),
  ]);

  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    timerConfig: timerConfig ?? DEFAULT_TIMER_CONFIG,
    appSettings,
    pomodoroCompletions: (completions.data ?? []).map((row) => ({
      subject: row.subject,
      minutes: row.minutes,
      completedAt: row.completed_at,
    })),
    scheduleBlocks,
    questionLog,
    reviewFlags,
    spacedReviewOverrides,
  };
}

/**
 * Adiciona os dados de um backup à conta do usuário logado (não apaga o que
 * já existe — cada linha do backup vira uma linha nova). Campos ausentes no
 * arquivo (backup parcial ou de uma versão anterior) são simplesmente
 * ignorados.
 */
export async function importAllData(data: Partial<ExportedData>): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (data.timerConfig) await saveTimerConfig(data.timerConfig);
  if (data.appSettings) await saveAppSettings(data.appSettings);

  if (data.pomodoroCompletions?.length) {
    await supabase.from("pomodoro_completions").insert(
      data.pomodoroCompletions.map((row) => ({
        subject: row.subject,
        minutes: row.minutes,
        completed_at: row.completedAt,
      })),
    );
  }

  if (data.scheduleBlocks?.length) {
    await supabase.from("schedule_blocks").insert(
      data.scheduleBlocks.map((block) => ({
        weekday: block.weekday,
        subject: block.subject,
        start_time: block.startTime,
        duration_minutes: block.durationMinutes,
      })),
    );
  }

  if (data.questionLog?.length) {
    await supabase.from("question_log").insert(
      data.questionLog.map((entry) => ({
        subject: entry.subject,
        date: entry.date,
        total: entry.total,
        correct: entry.correct,
        wrong: entry.wrong,
      })),
    );
  }

  if (data.reviewFlags?.length) {
    await supabase.from("review_flags").insert(
      data.reviewFlags.map((flag) => ({
        subject: flag.subject,
        note: flag.note,
        date: flag.date,
        review_date: flag.reviewDate,
      })),
    );
  }

  if (data.spacedReviewOverrides) {
    for (const override of Object.values(data.spacedReviewOverrides)) {
      await saveSpacedReviewOverride(override);
    }
  }
}
