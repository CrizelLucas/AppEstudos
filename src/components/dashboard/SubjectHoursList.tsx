import { formatHours, type SubjectStudyMinutes } from "@/lib/dashboard";

interface SubjectHoursListProps {
  subjects: SubjectStudyMinutes[];
}

export function SubjectHoursList({ subjects }: SubjectHoursListProps) {
  if (subjects.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Nenhum pomodoro concluído ainda.
      </p>
    );
  }

  const maxMinutes = Math.max(...subjects.map((subject) => subject.minutes));

  return (
    <div className="flex flex-col gap-2">
      {subjects.map((subject) => (
        <div key={subject.subject} className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground font-medium">
              {subject.subject}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">
              {formatHours(subject.minutes)}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/[.1]">
            <div
              className="h-full rounded-full bg-sky-500 dark:bg-sky-400"
              style={{
                width: `${maxMinutes === 0 ? 0 : (subject.minutes / maxMinutes) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
