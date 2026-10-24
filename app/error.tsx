"use client";

import { startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ActionButton } from "@/components/ui/action-button";

// Last-resort boundary for errors a page didn't handle itself, so they render
// an inline retry instead of Next's blank "Application error" screen.
export default function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Unhandled page error:", error);
  }, [error]);

  // `reset` alone only re-renders on the client; refresh re-runs the server
  // components, where this app's data fetching (and its failures) happen.
  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 px-6 sm:px-12 pb-8 pt-24 text-center">
      <p className="text-red-500">Something went wrong loading this page.</p>
      <ActionButton onClick={retry}>Try again</ActionButton>
    </main>
  );
}
