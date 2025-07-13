/**
 * Generate a single normally-distributed random number via Box–Muller
 */
function randnBM(): number {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); // avoid 0
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

interface RandomWalkOpts {
  /** Number of data points to simulate */
  length: number;
  /** Starting value */
  S0: number;
  /** Expected return per step (drift) */
  mu: number;
  /** Volatility per step (standard deviation of returns) */
  sigma: number;
  /** Time increment per step (default = 1) */
  dt?: number;
}

/**
 * Simulate a generic random walk (geometric Brownian motion)
 *
 * series[t] = series[t-1] * exp((mu - 0.5*sigma^2)*dt + sigma*sqrt(dt)*Z)
 */
export function generateRandomWalk({
  length = 20,
  S0 = 1,
  mu = 0,
  sigma = 0.05,
  dt = 1,
}: Partial<RandomWalkOpts> = {}): number[] {
  const series: number[] = [S0];
  const drift = (mu - 0.5 * sigma * sigma) * dt;
  const volScale = sigma * Math.sqrt(dt);

  for (let i = 1; i < length; i++) {
    const Z = randnBM();
    const ret = drift + volScale * Z;
    series.push(series[i - 1] * Math.exp(ret));
  }

  return series;
}
