import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export async function getAuthSession() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.getSession();

  if (error) return { session: null, supabaseUser: null, error: error.message } as const;

  const session = data.session;
  const supabaseUser = session?.user ?? null;

  return { session, supabaseUser, error: null } as const;
}