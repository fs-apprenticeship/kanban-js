"use client";
// TODO(auth-ui): move onboarding submission into src/features/auth/api + hook
// (e.g. completeOnboardingApi + useCompleteOnboarding) and add client validation.

import * as React from "react";
import { Button, Card, CardBody, CardHeader, Input } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const next = sp.get("next") ?? "/";
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const submit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message ?? "Failed to complete onboarding.");
        return;
      }

      router.push(next);
    } catch (e) {
      setError("Network error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-xl font-semibold">Complete your profile</CardHeader>
        <CardBody className="gap-4">
          <Input
            label="First name"
            value={firstName}
            onValueChange={setFirstName}
            isRequired
          />
          <Input
            label="Last name"
            value={lastName}
            onValueChange={setLastName}
            isRequired
          />

          {error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : null}

          <Button onPress={submit} isLoading={isLoading}>
            Continue
          </Button>

          <p className="text-xs opacity-70">
            This is temporary UI.
          </p>
        </CardBody>
      </Card>
    </main>
  );
}