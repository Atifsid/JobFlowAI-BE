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
  it("always renders the full action set with Tailor Resume as primary", () => {
    render(
      <MemoryRouter>
        <JobActionList job={job} onSkip={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText("Tailor Resume").closest("a")).toHaveAttribute("href", "/jobs/1/resume");
    expect(screen.getByText("Tailor Resume").closest("a")).toHaveClass("bg-primary");
    expect(screen.getByText("Find Contacts").closest("a")).toHaveAttribute("href", "/jobs/1/employees");
    expect(screen.getByText("Draft Referral").closest("a")).toHaveAttribute("href", "/jobs/1/referral");
    expect(screen.getByText("Open Listing").closest("a")).toHaveAttribute("href", "https://acme.example/apply");
    expect(screen.getByText("Skip")).toBeInTheDocument();
  });

  it("calls onSkip when the Skip action is clicked", async () => {
    const onSkip = vi.fn().mockResolvedValue(undefined);
    render(
      <MemoryRouter>
        <JobActionList job={job} onSkip={onSkip} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Skip"));
    await waitFor(() => expect(onSkip).toHaveBeenCalled());
  });

  it("shows an error message when skipping fails", async () => {
    const onSkip = vi.fn().mockRejectedValue(new Error("Failed to skip job"));
    render(
      <MemoryRouter>
        <JobActionList job={job} onSkip={onSkip} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Skip"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to skip job");
  });
});
