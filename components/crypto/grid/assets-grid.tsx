import { fetchAssets } from "@/lib/data/assets";
import { Suspense } from "react";
import ShimmerGrid from "../../ui/shimmer-grid";
import AssetsGridClient from "./assets-grid-client";

export default function AssetsGrid() {
  return (
    <Suspense fallback={<ShimmerGrid size={15} />}>
      <AssetsGridContent />
    </Suspense>
  );
}

export async function AssetsGridContent() {
  try {
    const assets = await fetchAssets();

    return <AssetsGridClient assets={assets} />;
  } catch (error) {
    console.error("Error in AssetsGridContent:", error);
    return (
      <div className="w-full max-w-7xl mx-auto p-8 text-center">
        <p className="text-red-500">
          Error loading assets:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }
}
