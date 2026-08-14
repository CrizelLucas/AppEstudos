interface SubjectFieldProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
}

export function SubjectField({
  value,
  onChange,
  suggestions,
}: SubjectFieldProps) {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-2">
      <div className="relative w-full">
        <label
          htmlFor="timer-subject"
          className="mb-1 block text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
        >
          Matéria de Estudo
        </label>
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-3 text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <input
            id="timer-subject"
            list="timer-subject-suggestions"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Ex: Matemática Financeira"
            className="w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-center text-sm font-medium text-slate-800 shadow-xs transition-colors placeholder:text-slate-400 focus:border-rose-500 focus:outline-none focus:ring-4 focus:ring-rose-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-rose-400 dark:focus:ring-rose-400/15"
          />
        </div>
        <datalist id="timer-subject-suggestions">
          {suggestions.map((subject) => (
            <option key={subject} value={subject} />
          ))}
        </datalist>
      </div>

      {/* Quick suggestions pills */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
          {suggestions.slice(0, 4).map((subj) => (
            <button
              key={subj}
              type="button"
              onClick={() => onChange(subj)}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-150 ${
                value === subj
                  ? "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/30"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

