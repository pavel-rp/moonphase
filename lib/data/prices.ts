import { generateRandomWalk } from "../utils/random-walk";
import { sleep } from "../utils/sleep";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function fetchPrices(_symbol: string) {
  const randomDuration = Math.random() * 10000 + 1000;
  await sleep(randomDuration);
  return generateRandomWalk();
}
