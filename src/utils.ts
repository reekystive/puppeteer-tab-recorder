function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withResolvers<T>() {
  let resolve: (value: T | PromiseLike<T>) => void = () => undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reject: (reason?: any) => void = () => undefined;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export { delay, withResolvers };
