import { ANALYST_SYSTEM_PROMPT } from '../analystPrompt';

describe('ANALYST_SYSTEM_PROMPT', () => {
  it('defines the analyst role', () => {
    expect(ANALYST_SYSTEM_PROMPT).toContain('cryptocurrency market analyst');
  });

  it('lists the four response sections', () => {
    expect(ANALYST_SYSTEM_PROMPT).toContain('**Market Bias**');
    expect(ANALYST_SYSTEM_PROMPT).toContain('**Price Analysis**');
    expect(ANALYST_SYSTEM_PROMPT).toContain('**News Sentiment**');
    expect(ANALYST_SYSTEM_PROMPT).toContain('**Key Takeaway**');
  });

  it('keeps the no-financial-advice guardrail', () => {
    expect(ANALYST_SYSTEM_PROMPT).toContain('Do not provide financial advice');
  });
});
