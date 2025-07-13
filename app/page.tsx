import { Suspense } from "react";
import AssetsGrid from "@/components/crypto/AssetsGrid";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Suspense fallback={<AssetsGrid loading={true} />}>
        <AssetsGrid />
      </Suspense>
    </main>
  );
}
