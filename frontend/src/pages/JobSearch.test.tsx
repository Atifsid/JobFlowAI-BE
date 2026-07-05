import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import JobSearch from "./JobSearch";
import { useJobSearch } from "../hooks/useJobSearch";
import { resumeService } from "../services/resumeService";
import { referralService } from "../services/referralService";
import type { JobPipeline } from "../types";

vi.mock("../hooks/useJobSearch");
vi.mock("../services/resumeService", () => ({ resumeService: { generate: vi.fn() } }));
vi.mock("../services/referralService", () => ({ referralService: { generateDrafts: vi.fn() } }));

const pipeline: JobPipeline = {
  job: { id: "1", title: "Senior Engineer", company: "Acme", location: "NYC", remote: false, description: "desc", skills: [], applyUrl: "https://x.com", source: "test" },
  status: "DISCOVERED"
};

function makePipeline(id: string, title: string): JobPipeline {
  return {
    job: { id, title, company: "Acme", location: "NYC", remote: false, description: "", skills: [], applyUrl: "https://x.com", source: "test" },
    status: "DISCOVERED"
  };
}

describe("JobSearch", () => {
  it("shows results counter and job list after a search", () => {
    vi.mocked(useJobSearch).mockReturnValue({
      result: { total: 1, resumesGenerated: 0, referralsReady: 1, applied: 0, jobs: [pipeline], page: 1, limit: 20, totalMatches: 1 },
      loading: false, error: null, search: vi.fn()
    });
    render(<MemoryRouter><JobSearch /></MemoryRouter>);

    expect(screen.getByText(/1 jobs/)).toBeInTheDocument();
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
  });

  it("links each job result to its detail page", () => {
    vi.mocked(useJobSearch).mockReturnValue({
      result: { total: 1, resumesGenerated: 0, referralsReady: 1, applied: 0, jobs: [pipeline], page: 1, limit: 20, totalMatches: 1 },
      loading: false, error: null, search: vi.fn()
    });
    render(<MemoryRouter><JobSearch /></MemoryRouter>);

    expect(screen.getByText("Senior Engineer").closest("a")).toHaveAttribute("href", "/jobs/1");
  });

  it("submitting the filter form triggers a search with page reset to 1", () => {
    const search = vi.fn();
    vi.mocked(useJobSearch).mockReturnValue({ result: null, loading: false, error: null, search });
    render(<MemoryRouter><JobSearch /></MemoryRouter>);

    fireEvent.change(screen.getByPlaceholderText("e.g. Software Engineer"), { target: { value: "Engineer" } });
    fireEvent.click(screen.getByText("Search"));

    expect(search).toHaveBeenCalledWith(expect.objectContaining({ title: "Engineer", page: 1, limit: 20 }));
  });

  it("shows pagination and advancing the page keeps the current filters", () => {
    const search = vi.fn();
    vi.mocked(useJobSearch).mockReturnValue({
      result: { total: 1, resumesGenerated: 0, referralsReady: 1, applied: 0, jobs: [pipeline], page: 1, limit: 20, totalMatches: 45 },
      loading: false, error: null, search
    });
    render(<MemoryRouter><JobSearch /></MemoryRouter>);

    fireEvent.change(screen.getByPlaceholderText("e.g. Software Engineer"), { target: { value: "Engineer" } });
    fireEvent.click(screen.getByText("Search"));
    fireEvent.click(screen.getByText("2"));

    expect(search).toHaveBeenLastCalledWith(expect.objectContaining({ title: "Engineer", page: 2, limit: 20 }));
  });

  describe("pipeline selection (up to 5)", () => {
    const sixJobs = Array.from({ length: 6 }, (_, i) => makePipeline(String(i), `Job ${i}`));

    afterEach(() => {
      vi.mocked(resumeService.generate).mockReset();
      vi.mocked(referralService.generateDrafts).mockReset();
    });

    it("disables the 6th checkbox once 5 are selected", () => {
      vi.mocked(useJobSearch).mockReturnValue({
        result: { total: 6, resumesGenerated: 0, referralsReady: 0, applied: 6, jobs: sixJobs, page: 1, limit: 20, totalMatches: 6 },
        loading: false, error: null, search: vi.fn()
      });
      render(<MemoryRouter><JobSearch /></MemoryRouter>);

      const checkboxes = screen.getAllByRole("checkbox", { name: /Select .* for pipeline/ });
      checkboxes.slice(0, 5).forEach(cb => fireEvent.click(cb));

      expect(screen.getByText("5/5 job(s) selected")).toBeInTheDocument();
      // base-ui's Checkbox isn't a native <input>/<button disabled>, so it signals
      // disabled state via a data-disabled attribute rather than the standard
      // disabled/aria-disabled jest-dom's toBeDisabled() checks for.
      expect(checkboxes[5]).toHaveAttribute("data-disabled");
    });

    it("runs resume generation then referral drafting for each selected job, in order", async () => {
      vi.mocked(useJobSearch).mockReturnValue({
        result: { total: 2, resumesGenerated: 0, referralsReady: 0, applied: 2, jobs: sixJobs.slice(0, 2), page: 1, limit: 20, totalMatches: 2 },
        loading: false, error: null, search: vi.fn()
      });
      vi.mocked(resumeService.generate).mockResolvedValue({ pdfPath: "a.pdf" });
      vi.mocked(referralService.generateDrafts).mockResolvedValue([]);

      render(<MemoryRouter><JobSearch /></MemoryRouter>);

      fireEvent.click(screen.getAllByRole("checkbox", { name: /Select .* for pipeline/ })[0]);
      fireEvent.click(screen.getByText("Run Pipeline"));

      await waitFor(() => expect(screen.getByText(/1 succeeded, 0 failed/)).toBeInTheDocument());

      expect(resumeService.generate).toHaveBeenCalledWith("0");
      expect(referralService.generateDrafts).toHaveBeenCalledWith("0");
    });
  });
});
