import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import JobDetail from "./JobDetail";
import { useJobDetail } from "../hooks/useJobDetail";

vi.mock("../hooks/useJobDetail");

const pipeline = {
  job: { id: "1", title: "Senior Engineer", company: "Acme", location: "NYC", remote: false, description: "desc", skills: [], applyUrl: "https://x.com", source: "test" },
  score: { score: 68, missingSkills: [], strengths: [], weaknesses: [], recommendation: "Apply" },
  decision: "DIRECT_APPLY" as const, actions: [], status: "ANALYZED" as const
};

describe("JobDetail", () => {
  it("renders the pipeline via JobDetailPanel", () => {
    vi.mocked(useJobDetail).mockReturnValue({ pipeline, loading: false, error: null, updateStatus: vi.fn() });

    render(
      <MemoryRouter initialEntries={["/jobs/1"]}>
        <Routes>
          <Route path="/jobs/:id" element={<JobDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
  });

  it("shows the error message on failure", () => {
    vi.mocked(useJobDetail).mockReturnValue({ pipeline: null, loading: false, error: "Job not found in dashboard", updateStatus: vi.fn() });

    render(
      <MemoryRouter initialEntries={["/jobs/1"]}>
        <Routes>
          <Route path="/jobs/:id" element={<JobDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Job not found in dashboard");
  });
});
