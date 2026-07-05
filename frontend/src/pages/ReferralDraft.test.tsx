import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ReferralDraft from "./ReferralDraft";
import { useReferral } from "../hooks/useReferral";
import { referralService } from "../services/referralService";

vi.mock("../hooks/useReferral");
vi.mock("../services/referralService", () => ({
  referralService: { markSent: vi.fn() }
}));

Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });

const employee = { name: "Sarah Chen", title: "Engineer", company: "Acme", linkedin: "https://linkedin.com/in/sarah" };

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/jobs/1/referral"]}>
      <Routes>
        <Route path="/jobs/:id/referral" element={<ReferralDraft />} />
      </Routes>
    </MemoryRouter>
  );

describe("ReferralDraft", () => {
  afterEach(() => {
    vi.mocked(referralService.markSent).mockReset();
  });

  it("triggers generate() when the button is clicked", () => {
    const generate = vi.fn();
    vi.mocked(useReferral).mockReturnValue({ drafts: null, loading: false, error: null, generate });
    renderPage();
    fireEvent.click(screen.getByText("Find Employees & Draft Referrals"));
    expect(generate).toHaveBeenCalled();
  });

  it("renders a draft with a character count and copies it to the clipboard", async () => {
    vi.mocked(useReferral).mockReturnValue({
      drafts: [{ employee, message: "Hi Sarah" }],
      loading: false, error: null, generate: vi.fn()
    });
    renderPage();

    expect(screen.getByText("8/200")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Copy to Clipboard"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Hi Sarah");
  });

  it("marks a draft as sent and locks the button once recorded", async () => {
    vi.mocked(useReferral).mockReturnValue({
      drafts: [{ employee, message: "Hi Sarah" }],
      loading: false, error: null, generate: vi.fn()
    });
    vi.mocked(referralService.markSent).mockResolvedValue({ tracked: true });
    renderPage();

    fireEvent.click(screen.getByText("Mark as sent"));

    await waitFor(() => expect(screen.getByText("Sent ✓")).toBeInTheDocument());
    expect(referralService.markSent).toHaveBeenCalledWith("1", employee);
    expect(screen.getByText("Sent ✓").closest("button")).toBeDisabled();
  });

  it("shows an error and allows retry when recording the send fails", async () => {
    vi.mocked(useReferral).mockReturnValue({
      drafts: [{ employee, message: "Hi Sarah" }],
      loading: false, error: null, generate: vi.fn()
    });
    vi.mocked(referralService.markSent).mockRejectedValue(new Error("sheet down"));
    renderPage();

    fireEvent.click(screen.getByText("Mark as sent"));

    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't record the send");
    expect(screen.getByText("Mark as sent").closest("button")).not.toBeDisabled();
  });
});
