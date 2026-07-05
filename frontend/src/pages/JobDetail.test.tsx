import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import JobDetail from "./JobDetail";
import { useJobDetail } from "../hooks/useJobDetail";
import { resumeService } from "../services/resumeService";
import { referralService } from "../services/referralService";

vi.mock("../hooks/useJobDetail");
vi.mock("../services/resumeService", () => ({ resumeService: { generate: vi.fn() } }));
vi.mock("../services/referralService", () => ({ referralService: { generateDrafts: vi.fn() } }));

const pipeline = {
  job: { id: "1", title: "Senior Engineer", company: "Acme", location: "NYC", remote: false, description: "desc", skills: [], applyUrl: "https://x.com", source: "test" },
  status: "DISCOVERED" as const
};

describe("JobDetail", () => {
  it("renders the pipeline via JobDetailPanel", () => {
    vi.mocked(useJobDetail).mockReturnValue({ pipeline, loading: false, error: null, updateStatus: vi.fn(), reload: vi.fn() });

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
    vi.mocked(useJobDetail).mockReturnValue({ pipeline: null, loading: false, error: "Job not found in dashboard", updateStatus: vi.fn(), reload: vi.fn() });

    render(
      <MemoryRouter initialEntries={["/jobs/1"]}>
        <Routes>
          <Route path="/jobs/:id" element={<JobDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Job not found in dashboard");
  });

  it("runs resume generation then referral drafting when Run Pipeline is clicked", async () => {
    vi.mocked(useJobDetail).mockReturnValue({ pipeline, loading: false, error: null, updateStatus: vi.fn(), reload: vi.fn() });
    vi.mocked(resumeService.generate).mockResolvedValue({ pdfPath: "a.pdf" });
    vi.mocked(referralService.generateDrafts).mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={["/jobs/1"]}>
        <Routes>
          <Route path="/jobs/:id" element={<JobDetail />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Run Pipeline"));

    await waitFor(() => expect(screen.getByText(/Resume generated and referral drafted/)).toBeInTheDocument());
    expect(resumeService.generate).toHaveBeenCalledWith("1");
    expect(referralService.generateDrafts).toHaveBeenCalledWith("1");
  });
});
