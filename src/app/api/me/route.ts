import { NextResponse } from "next/server";
import { route } from "@/src/lib/http/route";
import { prisma } from "@/src/lib/prisma";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export const GET = route(async () => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 401 });

  const session = data.session;
  const supabaseUser = session?.user ?? null;

  if (!session || !supabaseUser) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const prismaUser = await prisma.user.findUnique({
    where: { supabaseUserId: supabaseUser.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      supabaseUserId: true,
      isActive: true,
      role: { select: { name: true } },
    },
  });

  return NextResponse.json({
    ok: true,
    supabaseUserId: supabaseUser.id,
    supabaseEmail: supabaseUser.email,
    prismaUser,
  });
});