import { describe, it, expect } from "vitest";
import { aliasesOf, sameSkill } from "../../../../src/services/resume/ats/skill-aliases";

describe("skill-aliases", () => {
  describe("aliasesOf", () => {
    it("returns every known spelling for a term in an alias group", () => {
      expect(aliasesOf("React.js")).toEqual(expect.arrayContaining(["React", "React.js", "ReactJS"]));
    });

    it("is case-insensitive when looking up a group", () => {
      expect(aliasesOf("react.js")).toEqual(expect.arrayContaining(["React", "React.js", "ReactJS"]));
    });

    it("returns just the term itself when it has no known aliases", () => {
      expect(aliasesOf("GraphQL")).toEqual(["GraphQL"]);
    });
  });

  describe("sameSkill", () => {
    it("treats known aliases as the same skill regardless of which side is queried", () => {
      expect(sameSkill("React.js", "React")).toBe(true);
      expect(sameSkill("React", "React.js")).toBe(true);
      expect(sameSkill("Postgres", "PostgreSQL")).toBe(true);
    });

    it("does not treat unrelated terms as the same skill", () => {
      expect(sameSkill("React", "Angular")).toBe(false);
    });
  });
});
