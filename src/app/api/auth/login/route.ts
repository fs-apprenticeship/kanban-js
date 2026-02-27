import { NextResponse } from "next/server";
import { route } from "@/src/lib/http/route";
import { badRequest, forbidden } from "@/src/lib/http/errors";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { prisma } from "@/src/lib/prisma";
import { findPrismaUserBySupabaseId } from "@/src/features/auth/auth.service";

type Body = { email: string; password: string };

export const POST = route(async (req) => {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) throw badRequest("Invalid JSON");

  const { email, password } = body;
  if (!email || !password) throw badRequest("email and password required");

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 401 });
  }

  const supabaseUserId = data.user?.id;
  if (!supabaseUserId) {
    return NextResponse.json({ ok: false, error: "No user returned from login" }, { status: 500 });
  }

  const prismaUser = await findPrismaUserBySupabaseId(prisma, supabaseUserId);

  if (!prismaUser) {
    // This should not happen if all signups go through /api/auth/signup
    throw forbidden("User profile not created yet (Prisma user missing)");
  }

  return NextResponse.json({ ok: true, supabaseUserId, prismaUser });
});