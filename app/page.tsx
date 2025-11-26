import AssetsGrid from "@/components/crypto/grid/assets-grid";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-6 sm:px-12 pb-8 pt-24">
      <AssetsGrid />
    </main>
  );
}
