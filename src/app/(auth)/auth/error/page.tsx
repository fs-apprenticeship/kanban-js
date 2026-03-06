"use client";

import { Card, CardBody, CardHeader, Code } from "@heroui/react";
import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const sp = useSearchParams();
  const error = sp.get("error") ?? "unknown_error";
  const message = sp.get("message");
  const errorDescription = sp.get("error_description");

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-xl font-semibold">Authentication error</CardHeader>
        <CardBody className="gap-3">
          <div>
            <div className="text-sm opacity-70">Error</div>
            <Code>{error}</Code>
          </div>

          {message ? (
            <div>
              <div className="text-sm opacity-70">Message</div>
              <Code>{message}</Code>
            </div>
          ) : null}

          {errorDescription ? (
            <div>
              <div className="text-sm opacity-70">Provider details</div>
              <Code>{errorDescription}</Code>
            </div>
          ) : null}
        </CardBody>
      </Card>
    </main>
  );
}