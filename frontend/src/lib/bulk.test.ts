import { describe, it, expect, vi, afterEach } from "vitest";
import { runWithConcurrency, runSequentiallyWithDelay } from "./bulk";

describe("runWithConcurrency", () => {
  it("runs at most `limit` tasks at once and reports every result", async () => {
    let active = 0;
    let maxActive = 0;
    const results: Array<{ item: number; status: string }> = [];

    await runWithConcurrency(
      [1, 2, 3, 4, 5],
      2,
      async item => {
        active++;
        maxActive = Math.max(maxActive, active);
        await new Promise(resolve => setTimeout(resolve, 10));
        active--;
        return item * 10;
      },
      (item, result) => {
        results.push({ item, status: result.status });
      }
    );

    expect(maxActive).toBeLessThanOrEqual(2);
    expect(results).toHaveLength(5);
    expect(results.every(r => r.status === "success")).toBe(true);
  });

  it("reports a failed item as an error without stopping the rest", async () => {
    const results: Array<{ item: number; status: string }> = [];

    await runWithConcurrency(
      [1, 2, 3],
      3,
      async item => {
        if (item === 2) throw new Error("boom");
        return item;
      },
      (item, result) => results.push({ item, status: result.status })
    );

    expect(results).toHaveLength(3);
    expect(results.find(r => r.item === 2)?.status).toBe("error");
  });

  it("still makes progress and reports every item when limit is 0 or negative", async () => {
    for (const limit of [0, -1]) {
      const results: Array<{ item: number; status: string }> = [];

      await runWithConcurrency(
        [1, 2, 3],
        limit,
        async item => item,
        (item, result) => results.push({ item, status: result.status })
      );

      expect(results).toHaveLength(3);
      expect(results.every(r => r.status === "success")).toBe(true);
    }
  });
});

describe("runSequentiallyWithDelay", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("waits within the real default delay range ([3000, 5000]ms) between items", async () => {
    vi.useFakeTimers();

    const task = vi.fn(async (item: number) => item);

    // No delayRangeMs override - exercises the real default in bulk.ts.
    const donePromise = runSequentiallyWithDelay([1, 2], task, () => {});

    // Let the first item's task and its microtask chain settle.
    await vi.advanceTimersByTimeAsync(0);
    expect(task).toHaveBeenCalledTimes(1);

    // Still short of the minimum 3000ms delay - second item must not start yet.
    await vi.advanceTimersByTimeAsync(2999);
    expect(task).toHaveBeenCalledTimes(1);

    // Past the maximum 5000ms delay - second item must have started by now.
    await vi.advanceTimersByTimeAsync(2001);
    expect(task).toHaveBeenCalledTimes(2);

    await donePromise;
  });

  it("processes items one at a time, in order", async () => {
    const order: number[] = [];
    let active = 0;
    let maxActive = 0;

    await runSequentiallyWithDelay(
      [1, 2, 3],
      async item => {
        active++;
        maxActive = Math.max(maxActive, active);
        order.push(item);
        await new Promise(resolve => setTimeout(resolve, 10));
        active--;
        return item;
      },
      () => {},
      [0, 0]
    );

    expect(maxActive).toBeLessThanOrEqual(1);
    expect(order).toEqual([1, 2, 3]);
  });

  it("continues past a failed item and still reports it", async () => {
    const results: Array<{ item: number; status: string }> = [];

    await runSequentiallyWithDelay(
      [1, 2, 3],
      async item => {
        if (item === 2) throw new Error("boom");
        return item;
      },
      (item, result) => results.push({ item, status: result.status }),
      [0, 0]
    );

    expect(results.map(r => r.status)).toEqual(["success", "error", "success"]);
  });
});
