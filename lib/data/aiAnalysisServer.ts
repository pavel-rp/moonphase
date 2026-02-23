import { LangChainAiAdapter } from '@/adapters/langchain/LangChainAiAdapter';
import { getAiAnalysis } from '@/usecases/getAiAnalysis';

export async function analyzeAsset(symbol: string): Promise<string> {
  return getAiAnalysis({ ai: new LangChainAiAdapter() }, symbol);
}
