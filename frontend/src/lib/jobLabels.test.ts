import { describe, it, expect } from "vitest";
import {
  ALL_STATUSES,
  labelForStatus,
  toneForStatus,
  labelForDecision,
  toneForDecision,
  reasoningForDecision,
  specForAction
} from "./jobLabels";
import type { Job } from "../types";

const job: Job = {
  id: "1",
  title: "Senior Engineer",
  company: "Acme",
  location: "NYC",
  remote: false,
  description: "desc",
  skills: [],
  applyUrl: "https://acme.example/apply",
  source: "test"
};

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

  it("labels and tones decisions", () => {
    expect(labelForDecision("DIRECT_APPLY")).toBe("Direct Apply");
    expect(toneForDecision("REFERRAL")).toBe("success");
    expect(toneForDecision("SKIP")).toBe("neutral");
    expect(reasoningForDecision("SKIP")).toMatch(/below 75/);
  });

  it("maps route actions to the job's sub-routes", () => {
    expect(specForAction("GENERATE_RESUME", job)).toEqual({
      label: "Tailor Resume",
      kind: "route",
      to: "/jobs/1/resume"
    });
    expect(specForAction("FIND_EMPLOYEES", job).to).toBe("/jobs/1/employees");
    expect(specForAction("GENERATE_REFERRAL", job).to).toBe("/jobs/1/referral");
  });

  it("maps APPLY to an external link to the job's apply URL", () => {
    expect(specForAction("APPLY", job)).toEqual({
      label: "Apply",
      kind: "external",
      to: "https://acme.example/apply"
    });
  });

  it("maps SKIP to a status transition", () => {
    expect(specForAction("SKIP", job)).toEqual({
      label: "Skip",
      kind: "status",
      status: "SKIPPED"
    });
  });

  it("marks not-yet-built actions as disabled", () => {
    expect(specForAction("GENERATE_COVER_LETTER", job).kind).toBe("disabled");
    expect(specForAction("FOLLOW_UP", job).kind).toBe("disabled");
  });
});
