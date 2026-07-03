import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import JobStatusSelect from "./JobStatusSelect";

describe("JobStatusSelect", () => {
  it("shows the current status as a badge", () => {
    const { container } = render(<JobStatusSelect status="REFERRAL_READY" onChange={vi.fn()} />);
    expect(container.querySelector(".badge")).toHaveTextContent("Referral Ready");
  });

  it("calls onChange with the newly selected status", async () => {
    const onChange = vi.fn().mockResolvedValue(undefined);
    render(<JobStatusSelect status="DISCOVERED" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Change status"), { target: { value: "APPLIED" } });

    await waitFor(() => expect(onChange).toHaveBeenCalledWith("APPLIED"));
  });

  it("disables the select while the update is pending and re-enables after", async () => {
    let resolveUpdate: () => void = () => {};
    const onChange = vi.fn().mockReturnValue(new Promise<void>(resolve => { resolveUpdate = resolve; }));
    render(<JobStatusSelect status="DISCOVERED" onChange={onChange} />);

    const select = screen.getByLabelText("Change status") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "APPLIED" } });

    expect(select).toBeDisabled();
    resolveUpdate();
    await waitFor(() => expect(select).not.toBeDisabled());
  });

  it("shows an error message when the update fails", async () => {
    const onChange = vi.fn().mockRejectedValue(new Error("Failed to update status"));
    render(<JobStatusSelect status="DISCOVERED" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Change status"), { target: { value: "APPLIED" } });

    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to update status");
  });
});
