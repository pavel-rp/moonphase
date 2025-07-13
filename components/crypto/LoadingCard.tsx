import { Card } from "@/components/ui/card";
import LoadingSparkline from "./LoadingSparkline";

export default function LoadingCard() {
  return (
    <Card className="glassmorphic p-6 animate-pulse min-h-[210px] flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-400 rounded w-1/2 opacity-30"></div>
          <div className="h-3 bg-gray-400 rounded w-1/3 opacity-30"></div>
        </div>
        <div className="w-8 h-8 bg-gray-400 rounded-full opacity-30"></div>
      </div>
      <div>
        <div className="h-6 bg-gray-400 rounded w-1/2 opacity-30"></div>
        <LoadingSparkline opacity={0.2} />
      </div>
    </Card>
  );
}
