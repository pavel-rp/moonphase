export const sleep = (duration: number, abortSignal?: AbortSignal) => {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => resolve(undefined), duration);

    if (abortSignal) {
        const onAbort = () => {
            clearTimeout(timeoutId);
            resolve(undefined); // Resolve the promise when aborted
        };
        abortSignal.addEventListener("abort", onAbort);
        // Clean up the event listener after the promise resolves
        abortSignal.addEventListener("abort", () => abortSignal.removeEventListener("abort", onAbort));
    }
  });
};
