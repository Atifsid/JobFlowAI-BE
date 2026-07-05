import { describe, it, expect } from "vitest";
import { ALL_STATUSES, labelForStatus, toneForStatus } from "./jobLabels";

describe("jobLabels", () => {
  it("covers every status with a distinct human-readable label", () => {
    const labels = ALL_STATUSES.map(labelForStatus);
    expect(new Set(labels).size).toBe(ALL_STATUSES.length);
    expect(labelForStatus("REFERRAL_READY")).toBe("Referral Ready");
  });

  it("maps statuses to one of the four badge tones", () => {
    expect(toneForStatus("APPLIED")).toBe("success");
    expect(toneForStatus("REFERRAL_READY")).toBe("warning");
    expect(toneForStatus("REJECTED")).toBe("error");
    expect(toneForStatus("DISCOVERED")).toBe("neutral");
  });
});
