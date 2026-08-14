/** Chave de data local (YYYY-MM-DD), usada para agrupar dados por dia. */
export function getDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Converte uma chave "YYYY-MM-DD" de volta pra Date (meia-noite local). */
export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Diferença em dias entre duas datas, ignorando o horário (compara por dia civil). */
export function daysBetween(earlier: Date, later: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const startEarlier = new Date(
    earlier.getFullYear(),
    earlier.getMonth(),
    earlier.getDate(),
  );
  const startLater = new Date(
    later.getFullYear(),
    later.getMonth(),
    later.getDate(),
  );
  return Math.round((startLater.getTime() - startEarlier.getTime()) / msPerDay);
}
