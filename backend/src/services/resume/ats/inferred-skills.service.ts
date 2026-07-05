import { aliasesOf, sameSkill } from "./skill-aliases";
import { InferredSkill } from "../../../models/ats-report.model";

interface ImplicationRule {
  parent: string;
  implies: string;
  confidence: number;
  reason: string;
}

// Foundational technologies implied by a stronger one the candidate already
// demonstrates, at high confidence only - deliberately never advanced or
// unrelated technologies. A JD asking for "HTML" from a candidate who ships
// production React should not be scored as a gap just because the master
// resume never spells out the foundations React is built on.
const RULES: ImplicationRule[] = [
  { parent: "React", implies: "HTML", confidence: 0.99, reason: "React development fundamentally requires HTML through JSX." },
  { parent: "React", implies: "CSS", confidence: 0.97, reason: "Production frontend React applications require styling technologies." },
  { parent: "React", implies: "JavaScript", confidence: 1.0, reason: "React is a JavaScript library." },
  { parent: "React", implies: "JSX", confidence: 0.95, reason: "React components are conventionally authored in JSX." },
  { parent: "React", implies: "DOM", confidence: 0.95, reason: "React's core abstraction is a virtual DOM layered over the browser DOM." },
  { parent: "React", implies: "npm", confidence: 0.9, reason: "React projects are conventionally installed and managed via npm." },
  { parent: "React", implies: "Responsive Design", confidence: 0.85, reason: "Production React frontends are built to work across device sizes." },
  { parent: "React", implies: "Component-based architecture", confidence: 0.95, reason: "Components are React's fundamental unit of composition." },
  { parent: "React", implies: "Hooks", confidence: 0.9, reason: "Modern React is written with function components and hooks." },
  { parent: "React", implies: "Context", confidence: 0.8, reason: "Context is React's built-in mechanism for sharing state across a component tree." },
  { parent: "React", implies: "Component Lifecycle", confidence: 0.85, reason: "Every React component has lifecycle or effect-driven behavior, class-based or hook-based." },

  { parent: "Next.js", implies: "React", confidence: 1.0, reason: "Next.js is a framework built on top of React." },
  { parent: "Next.js", implies: "SSR", confidence: 0.9, reason: "Server-side rendering is one of Next.js's core rendering modes." },
  { parent: "Next.js", implies: "SSG", confidence: 0.85, reason: "Static-site generation is a core Next.js rendering mode." },
  { parent: "Next.js", implies: "Routing", confidence: 0.9, reason: "Next.js ships a file-system-based router." },
  { parent: "Next.js", implies: "API Routes", confidence: 0.85, reason: "Next.js includes API routes as part of the framework." },

  { parent: "TypeScript", implies: "JavaScript", confidence: 1.0, reason: "TypeScript is a typed superset of JavaScript." },
  { parent: "TypeScript", implies: "ES6+", confidence: 0.9, reason: "TypeScript compiles through modern ECMAScript features." },

  { parent: "Node.js", implies: "JavaScript", confidence: 1.0, reason: "Node.js is a JavaScript runtime." },
  { parent: "Node.js", implies: "npm", confidence: 0.95, reason: "npm is Node.js's standard package manager." },
  { parent: "Node.js", implies: "REST APIs", confidence: 0.75, reason: "Node.js is commonly used to build REST APIs." },

  { parent: "Express", implies: "Node.js", confidence: 1.0, reason: "Express is a Node.js web framework." },
  { parent: "Express", implies: "REST APIs", confidence: 0.9, reason: "Express is commonly used to build REST APIs." },
  { parent: "Express", implies: "Middleware", confidence: 0.9, reason: "Express's core abstraction is the middleware chain." },

  { parent: "Redux", implies: "State Management", confidence: 0.95, reason: "Redux is a state management library." },
  { parent: "Zustand", implies: "State Management", confidence: 0.9, reason: "Zustand is a state management library." },

  { parent: "GraphQL", implies: "API Development", confidence: 0.85, reason: "GraphQL is a query language for APIs." },

  { parent: "PostgreSQL", implies: "SQL", confidence: 0.95, reason: "PostgreSQL is a SQL database." },
  { parent: "MySQL", implies: "SQL", confidence: 0.95, reason: "MySQL is a SQL database." },

  { parent: "GitHub", implies: "Git", confidence: 0.95, reason: "GitHub is a hosting platform for Git repositories." },

  { parent: "Docker", implies: "Containers", confidence: 0.9, reason: "Docker is a containerization platform." },

  { parent: "CI/CD", implies: "Version Control", confidence: 0.7, reason: "CI/CD pipelines are triggered from a version-controlled repository." },
  { parent: "CI/CD", implies: "Deployment workflows", confidence: 0.7, reason: "CI/CD pipelines automate build and deployment workflows." }
];

function containsTerm(text: string, term: string): boolean {
  return aliasesOf(term).some(alias => {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?<![A-Za-z0-9])${escaped}(?![A-Za-z0-9])`, "i").test(text);
  });
}

class InferredSkillsService {
  // Every foundational skill implied by something the master resume already
  // demonstrates - independent of any specific job, so the same list can be
  // reused across every job's ATS check. Skips anything already explicit in
  // the resume (nothing to infer) and keeps the highest-confidence rule
  // when more than one parent implies the same foundational skill.
  fromMasterResume(masterResume: string): InferredSkill[] {
    const inferred = new Map<string, InferredSkill>();

    for (const rule of RULES) {
      if (!containsTerm(masterResume, rule.parent)) continue;
      if (containsTerm(masterResume, rule.implies)) continue;

      const key = rule.implies.toLowerCase();
      const existing = inferred.get(key);
      if (existing && existing.confidence >= rule.confidence) continue;

      inferred.set(key, {
        skill: rule.implies,
        parent: rule.parent,
        confidence: rule.confidence,
        reason: rule.reason
      });
    }

    return [...inferred.values()];
  }

  // The inferred skill (if any) that covers a specific JD keyword - the
  // keyword may be phrased slightly differently ("HTML5" vs "HTML"), so
  // this compares via the same alias table used for direct matching.
  findCovering(keyword: string, inferredSkills: InferredSkill[]): InferredSkill | undefined {
    return inferredSkills.find(i => sameSkill(i.skill, keyword));
  }
}

export default new InferredSkillsService();
