interface TokenBucketOptions {
  capacity: number; // max tokens
  refillRate: number; // tokens per second
}

export class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  constructor(private opts: TokenBucketOptions) {
    this.tokens = opts.capacity;
    this.lastRefill = Date.now();
  }

  private refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const refillTokens = elapsed * this.opts.refillRate;
    if (refillTokens > 1) {
      this.tokens = Math.min(this.opts.capacity, this.tokens + refillTokens);
      this.lastRefill = now;
    }
  }

  public removeToken(): boolean {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }
}