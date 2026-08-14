interface SubjectInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  required?: boolean;
  label?: string;
}

export function SubjectInput({
  id,
  value,
  onChange,
  suggestions,
  placeholder,
  required,
  label = "Matéria",
}: SubjectInputProps) {
  const datalistId = `${id}-suggestions`;

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-xs font-medium text-zinc-500 dark:text-zinc-400"
      >
        {label}
      </label>
      <input
        id={id}
        list={datalistId}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="text-foreground focus:border-foreground/40 rounded-lg border border-black/[.08] bg-white px-3 py-2 text-sm outline-none dark:border-white/[.145] dark:bg-black"
      />
      <datalist id={datalistId}>
        {suggestions.map((subject) => (
          <option key={subject} value={subject} />
        ))}
      </datalist>
    </div>
  );
}
