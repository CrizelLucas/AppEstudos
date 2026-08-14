"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

interface AuthFormProps {
  mode: "login" | "signup";
}

const inputClassName =
  "rounded-lg border border-black/[.08] bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-foreground/40 dark:border-white/[.145] dark:bg-black";
const labelClassName = "text-xs font-medium text-zinc-500 dark:text-zinc-400";

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    const supabase = createClient();

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      setSubmitting(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Se a confirmação de e-mail estiver ligada no projeto Supabase, ainda
      // não existe sessão nesse ponto — avisa em vez de tentar navegar.
      if (!data.session) {
        setInfo(
          "Conta criada! Confira seu e-mail pra confirmar antes de entrar.",
        );
        return;
      }

      router.push("/");
      router.refresh();
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setSubmitting(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-4"
    >
      {mode === "signup" && (
        <div className="flex flex-col gap-1">
          <label htmlFor="full-name" className={labelClassName}>
            Nome
          </label>
          <input
            id="full-name"
            type="text"
            required
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className={inputClassName}
          />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className={labelClassName}>
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClassName}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className={labelClassName}>
          Senha
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          autoComplete={
            mode === "signup" ? "new-password" : "current-password"
          }
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClassName}
        />
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {info && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          {info}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="bg-foreground text-background rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-[#383838] disabled:opacity-60 dark:hover:bg-[#ccc]"
      >
        {submitting
          ? "Aguarde..."
          : mode === "signup"
            ? "Criar conta"
            : "Entrar"}
      </button>

      <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
        {mode === "signup" ? (
          <>
            Já tem conta?{" "}
            <Link href="/login" className="font-medium underline">
              Entrar
            </Link>
          </>
        ) : (
          <>
            Ainda não tem conta?{" "}
            <Link href="/signup" className="font-medium underline">
              Criar conta
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
