import { getAiAnalysis } from '@/usecases/getAiAnalysis';
import { getAiAnalysisDeps } from '@/compositionRoot';

export async function analyzeAsset(symbol: string): Promise<string> {
  const deps = await getAiAnalysisDeps();
  return getAiAnalysis(deps, symbol);
}
