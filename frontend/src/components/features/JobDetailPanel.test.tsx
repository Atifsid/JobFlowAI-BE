import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import JobDetailPanel from "./JobDetailPanel";
import type { JobPipeline } from "../../types";

const pipeline: JobPipeline = {
  job: {
    id: "1",
    title: "Senior Engineer",
    company: "Acme",
    location: "NYC",
    remote: false,
    employmentType: "Full-time",
    salaryMin: 140000,
    salaryMax: 180000,
    currency: "$",
    description: "Full description here",
    skills: [],
    applyUrl: "https://x.com",
    source: "greenhouse",
    postedAt: "2026-06-01T00:00:00.000Z"
  },
  score: { score: 68, missingSkills: ["Go"], strengths: ["Matched: React"], weaknesses: ["Missing: Go"], recommendation: "Apply" },
  decision: "DIRECT_APPLY",
  actions: ["GENERATE_RESUME", "GENERATE_COVER_LETTER", "APPLY"],
  status: "ANALYZED"
};

describe("JobDetailPanel", () => {
  it("renders job info, decision reasoning, score, skills, meta, and computed actions", () => {
    render(
      <MemoryRouter>
        <JobDetailPanel pipeline={pipeline} onStatusChange={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByText("68")).toBeInTheDocument();
    expect(screen.getByText("Direct Apply")).toBeInTheDocument();
    expect(screen.getByText(/Recommendation: Apply/)).toBeInTheDocument();
    expect(screen.getByText(/Full-time/)).toBeInTheDocument();
    expect(screen.getByText(/\$140,000–\$180,000/)).toBeInTheDocument();
    expect(screen.getByText(/via greenhouse/)).toBeInTheDocument();
    expect(screen.getByText("Tailor Resume")).toBeInTheDocument();
    expect(screen.getByText("Apply")).toBeInTheDocument();
  });

  it("omits Open Listing once APPLY is already a computed action", () => {
    render(
      <MemoryRouter>
        <JobDetailPanel pipeline={pipeline} onStatusChange={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.queryByText("Open Listing")).not.toBeInTheDocument();
  });

  it("calls onStatusChange with SKIPPED when the Skip action is used", async () => {
    const onStatusChange = vi.fn().mockResolvedValue(undefined);
    const skipPipeline: JobPipeline = { ...pipeline, decision: "SKIP", actions: ["SKIP"] };

    render(
      <MemoryRouter>
        <JobDetailPanel pipeline={skipPipeline} onStatusChange={onStatusChange} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith("SKIPPED"));
  });

  it("calls onStatusChange when a new status is selected", async () => {
    const onStatusChange = vi.fn().mockResolvedValue(undefined);
    render(
      <MemoryRouter>
        <JobDetailPanel pipeline={pipeline} onStatusChange={onStatusChange} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Change status"), { target: { value: "APPLIED" } });
    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith("APPLIED"));
  });
});
