import { NextResponse } from "next/server";
import { route } from "@/src/lib/http/route";
import { badRequest } from "@/src/lib/http/errors";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { prisma } from "@/src/lib/prisma";
import { createPrismaUserForSupabaseUser } from "@/src/features/auth/auth.service";

type Body = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export const POST = route(async (req) => {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) throw badRequest("Invalid JSON");

  const { email, password, firstName, lastName } = body;

  if (!email || !password || !firstName || !lastName) {
    throw badRequest("email, password, firstName, lastName are required");
  }

  const supabase = await createSupabaseServerClient();

  // Create Supabase user
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  const supabaseUserId = data.user?.id;
  const supabaseEmail = data.user?.email;

  if (!supabaseUserId || !supabaseEmail) {
    return NextResponse.json(
      { ok: false, error: "Supabase user was not returned from signUp" },
      { status: 500 }
    );
  }

  // Create Prisma user linked by supabaseUserId
  const prismaUser = await createPrismaUserForSupabaseUser(prisma, {
    supabaseUserId,
    email: supabaseEmail,
    firstName,
    lastName,
  });

  return NextResponse.json({
    ok: true,
    supabaseUserId,
    prismaUser,
  });
});