"use client";

import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/browser";

// TODO(auth-ui): move OAuth start logic into src/features/auth/hooks/useOAuthSignIn
// and keep this page as composition-only.

function getSiteOrigin() {
  // For production: set NEXT_PUBLIC_SITE_URL in prod
  // local: fallback to browser origin
  return process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
}

export default function LoginPage() {
  const signIn = async () => {
    const supabase = createSupabaseBrowserClient();

    const redirectTo = new URL("/api/auth/callback", getSiteOrigin());
    redirectTo.searchParams.set("next", "/"); // TODO: change later to dashboard
    

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: redirectTo.toString(),
      },
    });

    console.log(redirectTo.toString())

    if (error) {
      // send user to error page
      const errUrl = new URL("/auth/error", getSiteOrigin());
      errUrl.searchParams.set("error", "oauth_start_failed");
      errUrl.searchParams.set("message", error.message);
      window.location.assign(errUrl.toString());
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-xl font-semibold">Sign in</CardHeader>
        <CardBody className="gap-4">
          <Button onPress={signIn}>
            Continue with GitHub
          </Button>
          <p className="text-sm opacity-80">
            After signing in, you may be asked to complete onboarding (first/last name).
          </p>
        </CardBody>
      </Card>
    </main>
  );
}