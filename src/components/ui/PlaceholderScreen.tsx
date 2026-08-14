type PlaceholderScreenProps = {
  title: string;
  description: string;
};

export function PlaceholderScreen({
  title,
  description,
}: PlaceholderScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="max-w-sm text-zinc-600 dark:text-zinc-400">{description}</p>
    </div>
  );
}
