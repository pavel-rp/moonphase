import { generateRandomWalk } from "../utils/random-walk";
import { sleep } from "../utils/sleep";

export async function fetchPrices(symbol: string) {
  const randomDuration = Math.random() * 10000 + 1000;
  await sleep(randomDuration);
  return generateRandomWalk();
}
