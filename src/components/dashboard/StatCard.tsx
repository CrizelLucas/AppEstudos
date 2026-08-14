interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  icon?: string;
}

export function StatCard({ label, value, sublabel, icon }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
          {label}
        </span>
        {icon && <span className="text-base">{icon}</span>}
      </div>
      <span className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
        {value}
      </span>
      {sublabel && (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {sublabel}
        </span>
      )}
    </div>
  );
}

