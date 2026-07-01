type Result<R> = { status: "success"; value: R } | { status: "error"; error: unknown };

export async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  task: (item: T) => Promise<R>,
  onResult: (item: T, result: Result<R>) => void
): Promise<void> {
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = items[index++];
      try {
        const value = await task(current);
        onResult(current, { status: "success", value });
      } catch (error) {
        onResult(current, { status: "error", error });
      }
    }
  }

  const workerCount = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: workerCount }, worker));
}

const randomDelay = (minMs: number, maxMs: number) =>
  new Promise(resolve => setTimeout(resolve, minMs + Math.random() * (maxMs - minMs)));

export async function runSequentiallyWithDelay<T, R>(
  items: T[],
  task: (item: T, index: number) => Promise<R>,
  onResult: (item: T, result: Result<R>) => void,
  delayRangeMs: [number, number] = [3000, 5000]
): Promise<void> {
  for (let i = 0; i < items.length; i++) {
    const current = items[i];
    try {
      const value = await task(current, i);
      onResult(current, { status: "success", value });
    } catch (error) {
      onResult(current, { status: "error", error });
    }
    if (i < items.length - 1) {
      await randomDelay(delayRangeMs[0], delayRangeMs[1]);
    }
  }
}
