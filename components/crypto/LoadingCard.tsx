import { Card } from "@/components/ui/card";

export default function LoadingCard() {
  return (
    <Card className="glassmorphic p-6 animate-pulse min-h-[220px] flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/3"></div>
        </div>
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
      </div>
      <div className="space-y-2">
        <div className="h-6 bg-gray-300 rounded w-1/2 mb-6"></div>
        <div className="h-3 bg-gray-300 rounded w-1/3"></div>
        <div className="h-3 bg-gray-300 rounded w-1/3"></div>
        <div className="h-3 bg-gray-300 rounded w-1/3"></div>
      </div>
    </Card>
  );
}
