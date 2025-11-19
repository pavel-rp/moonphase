import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ActionButton } from "@/components/ui/action-button";
import { BrainCircuit } from "lucide-react";

interface AiAnalysisSectionProps {
  name: string;
}

export function AiAnalysisSection({ name }: AiAnalysisSectionProps) {
  return (
    <Card className="glassmorphic">
      <CardHeader>
        <CardTitle>AI Analysis</CardTitle>
        <CardDescription>
          Get AI-powered insights and analysis for {name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center gap-4">
          <ActionButton>
            Generate AI Analysis
            <BrainCircuit
              className={
                "size-5 group-hover:translate-x-1 rotate-180 " +
                "group-hover:rotate-0 transition duration-300 ease-out " +
                "group-active:translate-x-2 "
              }
            />
          </ActionButton>
        </div>
      </CardContent>
    </Card>
  );
}
