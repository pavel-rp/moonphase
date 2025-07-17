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
  const placeholderData = [
    1, 1.0034080652504769, 0.9537985028645104, 0.9559312777475756,
    1.0325555968184625, 1.0463626144930824, 0.9872560150661824,
    1.0834670324058544, 1.1331046464331556, 1.1167304235874866,
    1.0672328445496868, 1.0498933555691223, 1.0440217839544255,
    1.113671345694995, 1.170531174581718, 1.1889943522575503,
    1.2725301559169935, 1.3717558210983005, 1.3213229344000967,
    1.3214069783627582,
  ];

  return (
    <Sparkline
      data={placeholderData}
      className={cn("text-gray-500", className)}
      opacity={opacity}
    />
  );
};

export default LoadingSparkline;
