import { NextResponse } from "next/server";
import { getSiteOrigin, sanitizeNextPath } from "@/src/lib/http/redirect";
import { redirectToAuthError } from "@/src/features/auth/http/authRedirects";
import { handleOAuthCallback } from "@/src/features/auth/services/handleOAuthCallback";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = getSiteOrigin(url.origin);

  const nextPath = sanitizeNextPath(url.searchParams.get("next"), "/");
  const code = url.searchParams.get("code");

  // Provider may send error params instead of code
  const providerError = url.searchParams.get("error");
  const providerErrorDescription = url.searchParams.get("error_description");
  if (providerError) {
    return redirectToAuthError(origin, {
      error: providerError,
      ...(providerErrorDescription
        ? { error_description: providerErrorDescription }
        : {}),
    });
  }

  if (!code) {
    return redirectToAuthError(origin, { error: "missing_code" });
  }

  const result = await handleOAuthCallback(code, { prisma });

  if (!result.ok) {
    return redirectToAuthError(origin, {
      error: result.error,
      ...(result.message ? { message: result.message } : {}),
    });
  }

  if (result.needsOnboarding) {
    const onboardingUrl = new URL("/onboarding", origin);
    onboardingUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(onboardingUrl);
  }

  return NextResponse.redirect(new URL(nextPath, origin));
}
