import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SkillBadges from "./SkillBadges";

describe("SkillBadges", () => {
  it("shows matched keywords", () => {
    render(<SkillBadges matched={["React", "TypeScript"]} missing={[]} />);
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("shows missing keywords", () => {
    render(<SkillBadges matched={[]} missing={["Go", "Kubernetes"]} />);
    expect(screen.getByText("Go")).toBeInTheDocument();
    expect(screen.getByText("Kubernetes")).toBeInTheDocument();
  });
});
