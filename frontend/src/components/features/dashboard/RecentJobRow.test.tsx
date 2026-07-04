import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RecentJobRow from "./RecentJobRow";
import type { JobPipeline } from "@/types";

const pipeline: JobPipeline = {
  job: {
    id: "job-1", title: "Senior Engineer", company: "Acme", location: "NYC",
    remote: true, description: "", skills: [], applyUrl: "https://x.com",
    source: "test", postedAt: "2026-07-01"
  },
  score: { score: 82, missingSkills: [], strengths: [], weaknesses: [], recommendation: "Apply" },
  decision: "REFERRAL",
  actions: [],
  status: "REFERRAL_READY"
};

describe("RecentJobRow", () => {
  it("renders the job title, company, status label, and score", () => {
    render(<MemoryRouter><RecentJobRow pipeline={pipeline} /></MemoryRouter>);
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByText(/Acme/)).toBeInTheDocument();
    expect(screen.getByText("Referral Ready")).toBeInTheDocument();
    expect(screen.getByText("82")).toBeInTheDocument();
  });

  it("links to the job detail page", () => {
    render(<MemoryRouter><RecentJobRow pipeline={pipeline} /></MemoryRouter>);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/jobs/job-1");
  });
});
