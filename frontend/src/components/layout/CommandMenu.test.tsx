import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { dashboardService } from "@/services/dashboardService";
import CommandMenu from "./CommandMenu";

vi.mock("@/services/dashboardService", () => ({
  dashboardService: { getDashboard: vi.fn() },
}));

function Harness({ open }: { open: boolean }) {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<CommandMenu open={open} onOpenChange={() => {}} />} />
        <Route path="/jobs/:id" element={<p>Job detail page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("CommandMenu", () => {
  afterEach(() => {
    vi.mocked(dashboardService.getDashboard).mockReset();
  });

  it("does not fetch the dashboard while closed", () => {
    render(<Harness open={false} />);
    expect(dashboardService.getDashboard).not.toHaveBeenCalled();
  });

  it("fetches and lists tracked jobs once opened", async () => {
    vi.mocked(dashboardService.getDashboard).mockResolvedValue({
      total: 1, referral: 0, directApply: 1, skip: 0,
      jobs: [{ job: { id: "job-1", title: "Senior Engineer", company: "Acme" }, status: "DISCOVERED" } as never],
    });

    render(<Harness open={true} />);

    await waitFor(() => expect(screen.getByText(/Senior Engineer/)).toBeInTheDocument());
  });

  it("shows an empty message when there are no tracked jobs", async () => {
    vi.mocked(dashboardService.getDashboard).mockResolvedValue({ total: 0, referral: 0, directApply: 0, skip: 0, jobs: [] });

    render(<Harness open={true} />);

    await waitFor(() => expect(screen.getByText("No tracked jobs found.")).toBeInTheDocument());
  });

  it("navigates to the job on selection", async () => {
    vi.mocked(dashboardService.getDashboard).mockResolvedValue({
      total: 1, referral: 0, directApply: 1, skip: 0,
      jobs: [{ job: { id: "job-1", title: "Senior Engineer", company: "Acme" }, status: "DISCOVERED" } as never],
    });

    render(<Harness open={true} />);

    const item = await screen.findByText(/Senior Engineer/);
    fireEvent.click(item);

    await waitFor(() => expect(screen.getByText("Job detail page")).toBeInTheDocument());
  });
});
