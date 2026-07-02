import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import JobCard from "./JobCard";
import type { JobPipeline } from "../../types";

const pipeline: JobPipeline = {
  job: { id: "1", title: "Senior Engineer", company: "Acme", location: "NYC", remote: false, description: "", skills: [], applyUrl: "https://x.com", source: "test" },
  score: { score: 68, missingSkills: [], strengths: [], weaknesses: [], recommendation: "Apply" },
  decision: "DIRECT_APPLY",
  actions: [],
  status: "ANALYZED"
};

describe("JobCard", () => {
  it("renders title, company, and score", () => {
    render(<JobCard pipeline={pipeline} />);
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByText("68")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<JobCard pipeline={pipeline} onClick={onClick} />);
    fireEvent.click(screen.getByText("Senior Engineer"));
    expect(onClick).toHaveBeenCalled();
  });
});
