import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client do Supabase para uso em Server Components/Actions (não usado pelos
 * hooks hoje, que rodam no cliente — existe pra deixar a porta aberta pra
 * quem precisar ler dados no servidor no futuro).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // `set` chamado a partir de um Server Component: ignora — a
            // sessão já é renovada pelo proxy.ts em toda navegação.
          }
        },
      },
    },
  );
}
