import { describe, it, expect } from "vitest";
import dashboardService from "../../../src/services/dashboard/dashboard.service";
import { JobPipeline } from "../../../src/models/job-pipeline.model";
import { JobStatus } from "../../../src/models/job-status.model";

const at = (id: string, status: JobStatus): JobPipeline => ({
  job: {
    id,
    title: "Engineer",
    company: "Acme",
    location: "Remote",
    remote: true,
    description: "",
    skills: [],
    applyUrl: "https://example.com",
    source: "test"
  },
  status
});

describe("DashboardService.build", () => {
  it("counts pipeline activity cumulatively: a further-along job counts in every earlier stage", () => {
    const jobs = [
      at("1", JobStatus.DISCOVERED),
      at("2", JobStatus.RESUME_GENERATED),
      at("3", JobStatus.REFERRAL_READY),
      at("4", JobStatus.APPLIED),
      at("5", JobStatus.SKIPPED)
    ];

    const dashboard = dashboardService.build(jobs);

    expect(dashboard.total).toBe(5);
    expect(dashboard.resumesGenerated).toBe(3); // resume-generated, referral-ready, applied
    expect(dashboard.referralsReady).toBe(2); // referral-ready, applied
    expect(dashboard.applied).toBe(1);
  });

  it("excludes SKIPPED and REJECTED jobs from every activity count", () => {
    const jobs = [at("1", JobStatus.SKIPPED), at("2", JobStatus.REJECTED)];

    const dashboard = dashboardService.build(jobs);

    expect(dashboard.total).toBe(2);
    expect(dashboard.resumesGenerated).toBe(0);
    expect(dashboard.referralsReady).toBe(0);
    expect(dashboard.applied).toBe(0);
  });

  it("passes pagination through when provided", () => {
    const dashboard = dashboardService.build([], { page: 2, limit: 10, totalMatches: 45 });

    expect(dashboard.page).toBe(2);
    expect(dashboard.limit).toBe(10);
    expect(dashboard.totalMatches).toBe(45);
  });
});
