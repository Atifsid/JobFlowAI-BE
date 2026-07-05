import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ApplicationTracker from "./ApplicationTracker";
import { useTracker } from "../hooks/useTracker";

vi.mock("../hooks/useTracker");
vi.mock("../services/resumeService", () => ({ resumeService: { generate: vi.fn().mockResolvedValue({}) } }));
vi.mock("../services/referralService", () => ({ referralService: { generateDrafts: vi.fn().mockResolvedValue([]) } }));

const jobs = [
  { job: { id: "1", title: "Senior Engineer", company: "Acme", location: "NYC", remote: false, description: "", skills: [], applyUrl: "https://x.com", source: "test" }, score: { score: 68, missingSkills: [], strengths: [], weaknesses: [], recommendation: "Apply" }, decision: "DIRECT_APPLY" as const, actions: [], status: "DISCOVERED" as const },
  { job: { id: "2", title: "Frontend Dev", company: "Beta", location: "SF", remote: true, description: "", skills: [], applyUrl: "https://x.com", source: "test" }, score: { score: 90, missingSkills: [], strengths: [], weaknesses: [], recommendation: "Apply" }, decision: "REFERRAL" as const, actions: [], status: "APPLIED" as const }
];

describe("ApplicationTracker", () => {
  it("renders a row per job and filters by status tab", () => {
    vi.mocked(useTracker).mockReturnValue({ dashboard: { total: 2, referral: 1, directApply: 1, skip: 0, jobs }, loading: false, error: null, updateStatus: vi.fn(), reload: vi.fn() });

    render(<MemoryRouter><ApplicationTracker /></MemoryRouter>);

    expect(screen.getAllByText("Senior Engineer")).toHaveLength(2); // table row + card row
    expect(screen.getAllByText("Frontend Dev")).toHaveLength(2);

    fireEvent.click(screen.getByRole("tab", { name: /^APPLIED/ }));
    expect(screen.queryAllByText("Senior Engineer")).toHaveLength(0);
  });

  it("shows bulk action buttons when a job is selected", () => {
    const updateStatus = vi.fn();
    vi.mocked(useTracker).mockReturnValue({ dashboard: { total: 2, referral: 1, directApply: 1, skip: 0, jobs }, loading: false, error: null, updateStatus, reload: vi.fn() });

    render(<MemoryRouter><ApplicationTracker /></MemoryRouter>);

    const [firstCheckbox] = screen.getAllByRole("checkbox");
    fireEvent.click(firstCheckbox);

    expect(screen.getByText("Generate Resumes for Selected")).toBeInTheDocument();
  });
});
