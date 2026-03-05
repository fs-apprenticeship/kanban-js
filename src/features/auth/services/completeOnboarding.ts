import type { PrismaClient } from "@prisma/client";

export type CompleteOnboardingInput = {
  firstName: string;
  lastName: string;
};

export type CompleteOnboardingResult =
  | { ok: true }
  | {
      ok: false;
      error: "validation" | "user_not_found" | "inactive";
      message: string;
    };

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function isValidName(value: string) {
  const v = normalizeName(value);
  if (v.length < 1) return false;
  if (v.length > 50) return false;
  return true;
}

export async function completeOnboarding(
  prisma: PrismaClient,
  supabaseUserId: string,
  input: CompleteOnboardingInput,
): Promise<CompleteOnboardingResult> {
  const firstName = normalizeName(input.firstName ?? "");
  const lastName = normalizeName(input.lastName ?? "");

  if (!isValidName(firstName) || !isValidName(lastName)) {
    return {
      ok: false,
      error: "validation",
      message: "firstName and lastName are required (1–50 chars).",
    };
  }

  const user = await prisma.user.findUnique({
    where: { supabaseUserId },
    select: { id: true, isActive: true },
  });

  if (!user) {
    return {
      ok: false,
      error: "user_not_found",
      message: "No app user found for this session. Please sign in again.",
    };
  }

  if (!user.isActive) {
    return {
      ok: false,
      error: "inactive",
      message: "Your account is disabled.",
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { firstName, lastName },
  });

  return { ok: true };
}
