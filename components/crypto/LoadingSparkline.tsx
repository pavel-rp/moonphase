import { cn } from "@/lib/utils/utils";
import { Sparkline } from "../ui/sparkline";

type LoadingSparklineProps = {
  className?: string;
  opacity?: number;
};

const LoadingSparkline = ({
  className,
  opacity = 0.2,
}: LoadingSparklineProps) => {
  return (
    <Sparkline
      data={placeholderData}
      className={cn("text-gray-500", className)}
      opacity={opacity}
    />
  );
};

export default LoadingSparkline;
