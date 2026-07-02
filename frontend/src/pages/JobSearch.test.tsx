import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import JobSearch from "./JobSearch";
import { useJobSearch } from "../hooks/useJobSearch";
import { useJobStatusUpdate } from "../hooks/useJobStatusUpdate";

vi.mock("../hooks/useJobSearch");
vi.mock("../hooks/useJobStatusUpdate");

const pipeline = {
  job: { id: "1", title: "Senior Engineer", company: "Acme", location: "NYC", remote: false, description: "desc", skills: [], applyUrl: "https://x.com", source: "test" },
  score: { score: 68, missingSkills: [], strengths: [], weaknesses: [], recommendation: "Apply" },
  decision: "DIRECT_APPLY" as const, actions: [], status: "ANALYZED" as const
};

describe("JobSearch", () => {
  it("shows results counter and job list after a search", () => {
    vi.mocked(useJobSearch).mockReturnValue({
      result: { total: 1, referral: 0, directApply: 1, skip: 0, jobs: [pipeline] },
      loading: false, error: null, search: vi.fn()
    });
    vi.mocked(useJobStatusUpdate).mockReturnValue({ updateStatus: vi.fn(), error: null });

    render(<MemoryRouter><JobSearch /></MemoryRouter>);

    expect(screen.getByText(/Results: 1 jobs/)).toBeInTheDocument();
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
  });

  it("shows the detail panel for the selected job", () => {
    vi.mocked(useJobSearch).mockReturnValue({
      result: { total: 1, referral: 0, directApply: 1, skip: 0, jobs: [pipeline] },
      loading: false, error: null, search: vi.fn()
    });
    vi.mocked(useJobStatusUpdate).mockReturnValue({ updateStatus: vi.fn(), error: null });

    render(<MemoryRouter><JobSearch /></MemoryRouter>);

    fireEvent.click(screen.getByText("Senior Engineer"));
    expect(screen.getByText("Tailor Resume")).toBeInTheDocument();
  });
});
