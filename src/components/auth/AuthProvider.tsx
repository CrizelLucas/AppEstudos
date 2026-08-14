"use client";

import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { cycleDurationInSeconds, DEFAULT_TIMER_CONFIG } from "@/lib/timer";
import { useTimerStore } from "@/store/timerStore";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Contexto do usuário logado — monta uma vez no layout raiz. Além de expor
 * `user`, `signOut()` zera a store global do timer: sem isso, se duas pessoas
 * do grupo usarem o mesmo navegador em sequência, a segunda veria por um
 * instante o ciclo/matéria da primeira antes da store recarregar do banco.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    useTimerStore.setState({
      cycle: "foco",
      cyclesSinceLongBreak: 0,
      isRunning: false,
      cycleEndTimestamp: null,
      pausedSecondsLeft: cycleDurationInSeconds("foco", DEFAULT_TIMER_CONFIG),
      subject: "",
      config: DEFAULT_TIMER_CONFIG,
      hydrated: false,
    });
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de <AuthProvider>");
  }
  return context;
}
