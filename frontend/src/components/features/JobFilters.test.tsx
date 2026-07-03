import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import JobFilters from "./JobFilters";
import type { JobSearchParams } from "../../types";

describe("JobFilters", () => {
  it("calls onChange with an updated title when typed", () => {
    const onChange = vi.fn();
    render(<JobFilters filters={{}} onChange={onChange} onSubmit={vi.fn()} loading={false} />);

    fireEvent.change(screen.getByPlaceholderText("e.g. Software Engineer"), {
      target: { value: "Backend Engineer" }
    });

    expect(onChange).toHaveBeenCalledWith({ title: "Backend Engineer" });
  });

  it("splits comma-separated keywords into an array", () => {
    const onChange = vi.fn();
    render(<JobFilters filters={{}} onChange={onChange} onSubmit={vi.fn()} loading={false} />);

    fireEvent.change(screen.getByPlaceholderText("e.g. python, aws"), {
      target: { value: "python, aws" }
    });

    expect(onChange).toHaveBeenCalledWith({ keywords: ["python", "aws"] });
  });

  it("toggles a seniority level on and off", () => {
    const onChange = vi.fn();
    const filters: JobSearchParams = {};
    const { rerender } = render(
      <JobFilters filters={filters} onChange={onChange} onSubmit={vi.fn()} loading={false} />
    );

    fireEvent.click(screen.getByLabelText("senior"));
    expect(onChange).toHaveBeenCalledWith({ seniority: ["senior"] });

    rerender(
      <JobFilters filters={{ seniority: ["senior"] }} onChange={onChange} onSubmit={vi.fn()} loading={false} />
    );
    fireEvent.click(screen.getByLabelText("senior"));
    expect(onChange).toHaveBeenCalledWith({ seniority: undefined });
  });

  it("shows Searching... and disables the submit button while loading", () => {
    render(<JobFilters filters={{}} onChange={vi.fn()} onSubmit={vi.fn()} loading={true} />);
    expect(screen.getByText("Searching...")).toBeDisabled();
  });

  it("calls onSubmit when the form is submitted", () => {
    const onSubmit = vi.fn(e => e.preventDefault());
    render(<JobFilters filters={{}} onChange={vi.fn()} onSubmit={onSubmit} loading={false} />);
    fireEvent.click(screen.getByText("Search"));
    expect(onSubmit).toHaveBeenCalled();
  });
});
