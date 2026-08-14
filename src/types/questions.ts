export interface QuestionLogEntry {
  id: string;
  subject: string;
  /** Data em que o registro foi feito, "YYYY-MM-DD". */
  date: string;
  total: number;
  correct: number;
  wrong: number;
}

export interface ReviewFlag {
  id: string;
  subject: string;
  /** Nº/tema da questão a revisar depois. */
  note: string;
  /** Data em que foi marcada, "YYYY-MM-DD". */
  date: string;
  /** Data em que deve aparecer em "Revisões de hoje" (começa igual a `date`). */
  reviewDate: string;
}
