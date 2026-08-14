const FALLBACK_SUBJECT_KEY = "sem-materia";

// Normaliza variações de travessão/hífen ("—", "–", "-") para o mesmo caractere,
// já que é comum digitar "TI — Banco de Dados" de formas ligeiramente diferentes.
const DASH_VARIANTS = /[‐-―−]/g;

/** Chave normalizada para cruzar a matéria do timer com a do cronograma. */
export function normalizeSubject(subject: string): string {
  const normalized = subject
    .trim()
    .toLowerCase()
    .replace(DASH_VARIANTS, "-")
    .replace(/\s+/g, " ");
  return normalized || FALLBACK_SUBJECT_KEY;
}

/**
 * O histórico de pomodoros só guarda a matéria já normalizada (minúscula),
 * então isso só deixa a exibição mais legível — não é o texto original digitado.
 */
export function capitalizeSubject(subject: string): string {
  if (!subject) return subject;
  return subject.charAt(0).toUpperCase() + subject.slice(1);
}
