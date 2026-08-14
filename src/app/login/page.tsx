import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-foreground text-xl font-semibold">Entrar</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Pomodoro BB — sua central de estudos
        </p>
      </div>
      <AuthForm mode="login" />
    </div>
  );
}
