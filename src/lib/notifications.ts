import type { CycleType } from "@/types/timer";

/** Pede permissão apenas se ainda não foi decidida — não insiste depois de negada. */
export function requestNotificationPermission(): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "default") {
    void Notification.requestPermission();
  }
}

/** Notifica o fim de `endedCycle` (o ciclo que acabou de terminar), só com a aba em segundo plano. */
export function notifyCycleEnd(endedCycle: CycleType): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (document.visibilityState === "visible") return;

  const { title, body } =
    endedCycle === "foco"
      ? {
          title: "Hora da pausa",
          body: "Você concluiu um pomodoro. Aproveite para descansar.",
        }
      : {
          title: "Hora de focar",
          body: "A pausa acabou. Bora retomar os estudos.",
        };

  new Notification(title, { body });
}
