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
  status: "DISCOVERED"
};

describe("JobDetailPanel", () => {
  it("renders job info, meta, and the fixed action set", () => {
    render(
      <MemoryRouter>
        <JobDetailPanel pipeline={pipeline} onStatusChange={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByText(/Full-time/)).toBeInTheDocument();
    expect(screen.getByText(/\$140,000–\$180,000/)).toBeInTheDocument();
    expect(screen.getByText(/via greenhouse/)).toBeInTheDocument();
    expect(screen.getByText("Tailor Resume")).toBeInTheDocument();
    expect(screen.getByText("Find Contacts")).toBeInTheDocument();
    expect(screen.getByText("Draft Referral")).toBeInTheDocument();
    expect(screen.getByText("Open Listing")).toBeInTheDocument();
  });

  it("calls onStatusChange with SKIPPED when the Skip action is used", async () => {
    const onStatusChange = vi.fn().mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <JobDetailPanel pipeline={pipeline} onStatusChange={onStatusChange} />
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

  it("shows the ATS report when the pipeline has run", () => {
    const withAts = {
      ...pipeline,
      ats: {
        score: 82,
        matchedKeywords: ["React", "TypeScript"],
        missingKeywords: ["Go"],
        pages: 1,
        missingEmployers: ["Beta Inc"],
        passed: true
      }
    };

    render(
      <MemoryRouter>
        <JobDetailPanel pipeline={withAts} onStatusChange={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText("82")).toBeInTheDocument();
    expect(screen.getByText("ATS Pass")).toBeInTheDocument();
    expect(screen.getByText(/82% of target keywords/)).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Go")).toBeInTheDocument();
    expect(screen.getByText(/Dropped employer\(s\): Beta Inc/)).toBeInTheDocument();
  });

  it("omits the ATS section before the pipeline has run", () => {
    render(
      <MemoryRouter>
        <JobDetailPanel pipeline={pipeline} onStatusChange={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.queryByText("ATS Pass")).not.toBeInTheDocument();
    expect(screen.queryByText("Needs Review")).not.toBeInTheDocument();
  });

  it("omits the Run Pipeline button when onRunPipeline isn't provided", () => {
    render(
      <MemoryRouter>
        <JobDetailPanel pipeline={pipeline} onStatusChange={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.queryByText("Run Pipeline")).not.toBeInTheDocument();
  });

  it("runs the pipeline and shows the result message when onRunPipeline is provided", () => {
    const onRunPipeline = vi.fn();
    render(
      <MemoryRouter>
        <JobDetailPanel
          pipeline={pipeline}
          onStatusChange={vi.fn()}
          onRunPipeline={onRunPipeline}
          pipelineStatus="success"
          pipelineMessage="Resume generated and referral drafted."
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Run Pipeline"));
    expect(onRunPipeline).toHaveBeenCalled();
    expect(screen.getByText("Resume generated and referral drafted.")).toBeInTheDocument();
  });
});
