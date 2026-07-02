import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ReferralDraft from "./ReferralDraft";
import { useReferral } from "../hooks/useReferral";

vi.mock("../hooks/useReferral");

Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/jobs/1/referral"]}>
      <Routes>
        <Route path="/jobs/:id/referral" element={<ReferralDraft />} />
      </Routes>
    </MemoryRouter>
  );

describe("ReferralDraft", () => {
  it("triggers generate() when the button is clicked", () => {
    const generate = vi.fn();
    vi.mocked(useReferral).mockReturnValue({ drafts: null, loading: false, error: null, generate });
    renderPage();
    fireEvent.click(screen.getByText("Find Employees & Draft Referrals"));
    expect(generate).toHaveBeenCalled();
  });

  it("renders a draft with a character count and copies it to the clipboard", async () => {
    vi.mocked(useReferral).mockReturnValue({
      drafts: [{ employee: { name: "Sarah Chen", title: "Engineer", company: "Acme", linkedin: "https://linkedin.com/in/sarah" }, message: "Hi Sarah" }],
      loading: false, error: null, generate: vi.fn()
    });
    renderPage();

    expect(screen.getByText("8/300")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Copy to Clipboard"));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Hi Sarah");
  });
});
