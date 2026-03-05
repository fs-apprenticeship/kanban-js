import { NextResponse } from "next/server";

export function redirectToAuthError(
  origin: string,
  params: Record<string, string>,
) {
  const url = new URL("/auth/error", origin);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return NextResponse.redirect(url);
}
