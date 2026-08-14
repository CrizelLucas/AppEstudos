/**
 * Registra a decisão do usuário sobre uma sugestão de revisão espaçada
 * (que, sem isso, seria só recalculada a cada render a partir do histórico
 * de pomodoros). Guarda os dados originais do candidato porque, depois que o
 * intervalo natural passa (ex: no dia seguinte ao "7 dias"), ele não seria
 * mais recalculado sozinho — só reaparece via este registro adiado.
 */
export interface SpacedReviewOverride {
  id: string;
  subject: string;
  studiedDate: string;
  intervalDays: number;
  status: "revisado" | "adiado";
  /** Só relevante quando status === "adiado": data em que volta a aparecer. */
  effectiveDate?: string;
}
