import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { ensurePrismaUserFromSupabase } from "@/src/features/auth/services/ensurePrismaUserFromSupabase";
import { PrismaClient } from "@prisma/client/extension";

export type OAuthCallbackResult =
  | { ok: true; needsOnboarding: boolean }
  | { ok: false; error: string; message?: string };

export async function handleOAuthCallback(
  code: string,
  deps: { prisma: PrismaClient },
): Promise<OAuthCallbackResult> {
  const supabase = await createSupabaseServerClient();

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return {
      ok: false,
      error: "exchange_failed",
      message: exchangeError.message,
    };
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { ok: false, error: "user_missing", message: userError?.message };
  }
  const ensured = await ensurePrismaUserFromSupabase(deps.prisma, {
    id: userData.user.id,
    email: userData.user.email,
  });

  if (ensured.error) {
    return { ok: false, error: "prisma_user_error", message: ensured.error };
  }

  if (!ensured.prismaUser) {
    return { ok: false, error: "prisma_user_missing" };
  }

  return { ok: true, needsOnboarding: ensured.needsOnboarding };
}
