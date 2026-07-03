import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import JobActionList from "./JobActionList";
import type { Job } from "../../types";

const job: Job = {
  id: "1",
  title: "Senior Engineer",
  company: "Acme",
  location: "NYC",
  remote: false,
  description: "desc",
  skills: [],
  applyUrl: "https://acme.example/apply",
  source: "test"
};

describe("JobActionList", () => {
  it("renders backend-computed actions with the first as primary", () => {
    render(
      <MemoryRouter>
        <JobActionList job={job} actions={["GENERATE_RESUME", "FIND_EMPLOYEES", "GENERATE_REFERRAL"]} onSkip={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText("Tailor Resume").closest("button")).toHaveClass("btn--primary");
    expect(screen.getByText("Find Contacts").closest("button")).toHaveClass("btn--secondary");
    expect(screen.getByText("Draft Referral")).toBeInTheDocument();
  });

  it("shows Open Listing when APPLY is not in the computed actions", () => {
    render(
      <MemoryRouter>
        <JobActionList job={job} actions={["GENERATE_RESUME"]} onSkip={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText("Open Listing")).toBeInTheDocument();
  });

  it("omits Open Listing when APPLY is already the computed action", () => {
    render(
      <MemoryRouter>
        <JobActionList job={job} actions={["GENERATE_RESUME", "GENERATE_COVER_LETTER", "APPLY"]} onSkip={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.queryByText("Open Listing")).not.toBeInTheDocument();
    expect(screen.getByText("Apply")).toBeInTheDocument();
  });

  it("renders not-yet-built actions as disabled", () => {
    render(
      <MemoryRouter>
        <JobActionList job={job} actions={["GENERATE_COVER_LETTER"]} onSkip={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText("Cover Letter").closest("button")).toBeDisabled();
  });

  it("shows the empty-actions message when there are no computed actions", () => {
    render(
      <MemoryRouter>
        <JobActionList job={job} actions={[]} onSkip={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText("No further action needed for this job.")).toBeInTheDocument();
  });

  it("calls onSkip when the Skip action is clicked", async () => {
    const onSkip = vi.fn().mockResolvedValue(undefined);
    render(
      <MemoryRouter>
        <JobActionList job={job} actions={["SKIP"]} onSkip={onSkip} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Skip"));
    await waitFor(() => expect(onSkip).toHaveBeenCalled());
  });

  it("shows an error message when skipping fails", async () => {
    const onSkip = vi.fn().mockRejectedValue(new Error("Failed to skip job"));
    render(
      <MemoryRouter>
        <JobActionList job={job} actions={["SKIP"]} onSkip={onSkip} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Skip"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to skip job");
  });
});
