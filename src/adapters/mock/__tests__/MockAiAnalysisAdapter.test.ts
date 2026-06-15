import {
  MockAiAnalysisAdapter,
  MOCK_PRE_STREAM_ERROR_SYMBOL,
  MOCK_MID_STREAM_ERROR_SYMBOL,
} from '@/adapters/mock/MockAiAnalysisAdapter';
import { ExternalException } from '@/lib/errors';

async function collect(stream: AsyncIterable<string>): Promise<string[]> {
  const out: string[] = [];
  for await (const chunk of stream) out.push(chunk);
  return out;
}

describe('MockAiAnalysisAdapter', () => {
  const adapter = new MockAiAnalysisAdapter();

  it('analyzeAsset returns symbol-templated multi-section markdown', async () => {
    const text = await adapter.analyzeAsset('btc');
    expect(text).toContain('**Market Bias**');
    expect(text).toContain('**Price Analysis**');
    expect(text).toContain('**News Sentiment**');
    expect(text).toContain('**Key Takeaway**');
    // Symbol is uppercased and interpolated.
    expect(text).toContain('BTC');
    expect(text).not.toContain('btc');
  });

  it('streams in multiple chunks that reconstruct the full analysis', async () => {
    const chunks = await collect(adapter.analyzeAssetStream('eth'));
    expect(chunks.length).toBeGreaterThan(1);
    const full = chunks.join('');
    expect(full).toContain('**Key Takeaway**');
    expect(full).toContain('ETH');
    expect(full).toBe(await adapter.analyzeAsset('eth'));
  });

  it('throws before the first chunk for the pre-stream error symbol', async () => {
    const iterator = adapter
      .analyzeAssetStream(MOCK_PRE_STREAM_ERROR_SYMBOL)
      [Symbol.asyncIterator]();
    await expect(iterator.next()).rejects.toBeInstanceOf(ExternalException);
  });

  it('yields one chunk then throws for the mid-stream error symbol', async () => {
    const iterator = adapter
      .analyzeAssetStream(MOCK_MID_STREAM_ERROR_SYMBOL)
      [Symbol.asyncIterator]();
    const first = await iterator.next();
    expect(first.done).toBe(false);
    expect(typeof first.value).toBe('string');
    await expect(iterator.next()).rejects.toBeInstanceOf(ExternalException);
  });

  it('analyzeAsset throws for an error symbol', async () => {
    await expect(adapter.analyzeAsset(MOCK_PRE_STREAM_ERROR_SYMBOL)).rejects.toBeInstanceOf(
      ExternalException,
    );
  });
});
