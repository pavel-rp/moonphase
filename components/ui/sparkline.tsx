import clsx from "clsx";
import { useId } from "react";

type SparklineProps = {
  data: number[];
  height?: number | string;
  strokeWidth?: number;
  opacity?: number;
  areaOpacity?: number;
  baselineOpacity?: number;
  className?: string;
};

export function Sparkline({
  data,
  height = 50,
  strokeWidth = 40,
  opacity = 0.9,
  areaOpacity = 0.1,
  className,
}: SparklineProps) {
  const id = useId();

  console.log(data);

  // Use unique IDs for gradient and filter
  const gradientId = `sparkline-fade-${id}`;
  const filterId = `sparkline-shadow-${id}`;

  if (data.length < 2) {
    console.warn("Sparkline requires at least two data points");
    return null;
  }
  console.log(data);

  // Compute min/max and normalized points in a 1×1 box
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pointCount = data.length;
  const step = 1 / (pointCount - 1);

  // Calculate 2px padding in viewBox units
  let pxHeight = 60;
  if (typeof height === "number") {
    pxHeight = height;
  } else if (typeof height === "string") {
    const parsed = parseFloat(height);
    if (!isNaN(parsed)) pxHeight = parsed;
  }
  const pad = 0.01; // 1% of the box, visually about 1-2px at 50-100px height

  // When mapping points, add padding
  const points = data
    .map((value, i) => {
      const x = i * step;
      const y = 1 - (value - min) / range;
      const px = pad + x * (1 - 2 * pad);
      const py = pad + y * (1 - 2 * pad);
      return `${px},${py}`;
    })
    .join(" ");

  // Expand the viewBox to include padding
  const vb = `${-pad} ${-pad} ${1 + 2 * pad} ${1 + 2 * pad}`;

  // Normalize strokeWidth to viewBox units so non-scaling-stroke works
  // If height is a string, strip non-digits to estimate px (fallback to strokeWidth)
  let normStroke = strokeWidth;
  if (typeof height === "number") {
    normStroke = strokeWidth / height;
  } else if (typeof height === "string") {
    const px = parseFloat(height);
    if (!isNaN(px)) {
      normStroke = strokeWidth / px;
    }
  }

  return (
    <div className={clsx("w-full", className)}>
      <svg
        className={clsx("w-full", className)}
        viewBox={vb}
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{
          display: "block",
          width: "100%",
          height: typeof height === "number" ? `${height}px` : height,
        }}
      >
        <defs>
          {/* Area fade */}
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1" className={className}>
            <stop
              offset="0%"
              stopColor="currentColor"
              stopOpacity={areaOpacity}
            />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
          {/* Subtle drop shadow */}
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation="1"
              floodColor="currentColor"
              floodOpacity="0.4"
            />
          </filter>
        </defs>
        <polyline
          points={`0,1 ${points} 1,1`}
          fill={`url(#${gradientId})`}
          stroke="none"
        />
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth={normStroke}
          opacity={opacity}
          vectorEffect="non-scaling-stroke"
          filter={`url(#${filterId})`}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
