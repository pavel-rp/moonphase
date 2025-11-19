import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { ActionButton } from "@/components/ui/action-button";
import { BrainCircuit } from "lucide-react";

type AiAnalysisSectionProps = {
  symbol: string;
  name: string;
  onGenerate?: () => void;
};

export default function AiAnalysisSection({
  symbol,
  name,
  onGenerate,
}: AiAnalysisSectionProps) {
  return (
    <Card className="glassmorphic">
      {/* Header Zone */}
      <CardHeader>
        <CardTitle>AI Analysis</CardTitle>
        <CardDescription>
          Get AI-powered insights and scenarios for {name}
        </CardDescription>
        <CardAction>
          <span className="inline-flex items-center justify-center rounded-full bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Beta
          </span>
        </CardAction>
      </CardHeader>

      {/* Empty-State Content Zone */}
      <CardContent>
        <div className="flex items-start gap-6 mb-8">
          {/* Icon Container */}
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-800/40 backdrop-blur-sm ring-1 ring-stone-700/30">
              <BrainCircuit className="h-6 w-6 text-stone-300" />
            </div>
          </div>

          {/* Text Block */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-base font-semibold text-foreground mb-1">
                No analysis generated yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Run an AI pass on recent {symbol} data to get an at-a-glance
                view.
              </p>
            </div>

            {/* Bulleted List */}
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-stone-500 mt-0.5">•</span>
                <span>
                  <strong className="font-medium text-foreground">
                    Short-term bias
                  </strong>{" "}
                  (bullish / bearish / sideways)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-500 mt-0.5">•</span>
                <span>
                  <strong className="font-medium text-foreground">
                    Fair value band
                  </strong>{" "}
                  vs the current price
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-500 mt-0.5">•</span>
                <span>
                  <strong className="font-medium text-foreground">
                    Key signals
                  </strong>{" "}
                  such as trend, momentum, liquidity, and volatility
                </span>
              </li>
            </ul>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground/80 pt-1">
              Takes a few seconds. Uses public market and volume data only. Not
              financial advice.
            </p>
          </div>
        </div>

        {/* Button Row */}
        <div className="flex justify-end">
          <ActionButton onClick={onGenerate}>
            Generate AI Analysis
            <BrainCircuit
              className={
                "size-5 group-hover:translate-x-1 rotate-180 " +
                "group-hover:rotate-0 transition duration-300 ease-out " +
                "group-active:translate-x-2"
              }
            />
          </ActionButton>
        </div>
      </CardContent>
    </Card>
  );
}
