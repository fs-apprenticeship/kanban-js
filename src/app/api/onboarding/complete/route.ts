import { NextResponse } from "next/server";
import { prisma } from "@/src//lib/prisma";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { completeOnboarding } from "@/src/features/auth/services/completeOnboarding";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json(
      { error: "unauthorized", message: "Not signed in." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "bad_request", message: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const { firstName, lastName } = (body ?? {}) as Partial<{
    firstName: string;
    lastName: string;
  }>;

  const result = await completeOnboarding(prisma, userData.user.id, {
    firstName: firstName ?? "",
    lastName: lastName ?? "",
  });

  if (!result.ok) {
    const status =
      result.error === "validation"
        ? 400
        : result.error === "user_not_found"
          ? 403
          : result.error === "inactive"
            ? 403
            : 400;

    return NextResponse.json(
      { error: result.error, message: result.message },
      { status },
    );
  }

  return NextResponse.json({ ok: true });
}
