import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import JobDetailPanel from "./JobDetailPanel";
import type { JobPipeline } from "../../types";

const pipeline: JobPipeline = {
  job: { id: "1", title: "Senior Engineer", company: "Acme", location: "NYC", remote: false, description: "Full description here", skills: [], applyUrl: "https://x.com", source: "test" },
  score: { score: 68, missingSkills: ["Go"], strengths: ["Matched: React"], weaknesses: ["Missing: Go"], recommendation: "Apply" },
  decision: "DIRECT_APPLY",
  actions: [],
  status: "ANALYZED"
};

describe("JobDetailPanel", () => {
  it("renders job info, score, skills, and action links", () => {
    render(
      <MemoryRouter>
        <JobDetailPanel pipeline={pipeline} />
      </MemoryRouter>
    );

    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByText("68")).toBeInTheDocument();
    expect(screen.getByText("Tailor Resume")).toBeInTheDocument();
    expect(screen.getByText("Find Contacts")).toBeInTheDocument();
  });

  it("calls onSkip when the Skip button is clicked", () => {
    const onSkip = vi.fn();
    render(
      <MemoryRouter>
        <JobDetailPanel pipeline={pipeline} onSkip={onSkip} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Skip"));
    expect(onSkip).toHaveBeenCalled();
  });

  it("omits the Skip button when onSkip isn't provided", () => {
    render(
      <MemoryRouter>
        <JobDetailPanel pipeline={pipeline} />
      </MemoryRouter>
    );

    expect(screen.queryByText("Skip")).not.toBeInTheDocument();
  });
});
