export const sleep = (duration: number, abortSignal?: AbortSignal) => {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => resolve(undefined), duration);

    if(abortSignal) {
        abortSignal.onabort = () => clearTimeout(timeoutId);
    } 
  });
};
