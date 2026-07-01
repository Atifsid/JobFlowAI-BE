import { describe, it, expect, vi } from "vitest";
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
});

describe("runSequentiallyWithDelay", () => {
  it("processes items one at a time, in order", async () => {
    const order: number[] = [];

    await runSequentiallyWithDelay(
      [1, 2, 3],
      async item => {
        order.push(item);
        return item;
      },
      () => {},
      [0, 0]
    );

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
