import type { FormEvent } from "react";
import Button from "../common/Button";
import type { JobSearchParams } from "../../types";

const SENIORITY_LEVELS = ["internship", "entry", "mid", "senior", "lead", "staff", "principal"] as const;

const FRESHNESS_OPTIONS: Array<{ label: string; value: number | undefined }> = [
  { label: "Any time", value: undefined },
  { label: "Last 24 hours", value: 1 },
  { label: "Last 3 days", value: 3 },
  { label: "Last 7 days", value: 7 },
  { label: "Last 14 days", value: 14 },
  { label: "Last 30 days", value: 30 }
];

interface JobFiltersProps {
  filters: JobSearchParams;
  onChange: (filters: JobSearchParams) => void;
  onSubmit: (e: FormEvent) => void;
  loading: boolean;
}

export default function JobFilters({ filters, onChange, onSubmit, loading }: JobFiltersProps) {
  const set = <K extends keyof JobSearchParams>(key: K, value: JobSearchParams[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleSeniority = (level: string) => {
    const current = filters.seniority ?? [];
    const next = current.includes(level) ? current.filter(l => l !== level) : [...current, level];
    set("seniority", next.length > 0 ? next : undefined);
  };

  return (
    <form onSubmit={onSubmit} className="job-search-filters">
      <label className="filter-field">
        Title
        <input
          value={filters.title ?? ""}
          onChange={e => set("title", e.target.value || undefined)}
          placeholder="e.g. Software Engineer"
        />
      </label>

      <label className="filter-field">
        Keywords
        <input
          value={filters.keywords?.join(", ") ?? ""}
          onChange={e =>
            set(
              "keywords",
              e.target.value ? e.target.value.split(",").map(k => k.trim()).filter(Boolean) : undefined
            )
          }
          placeholder="e.g. python, aws"
        />
      </label>

      <label className="filter-field">
        Company
        <input
          value={filters.company ?? ""}
          onChange={e => set("company", e.target.value || undefined)}
          placeholder="e.g. Acme"
        />
      </label>

      <fieldset className="filter-field">
        <legend>Location</legend>
        <input value={filters.city ?? ""} onChange={e => set("city", e.target.value || undefined)} placeholder="City" />
        <input value={filters.region ?? ""} onChange={e => set("region", e.target.value || undefined)} placeholder="Region/State" />
        <input value={filters.country ?? ""} onChange={e => set("country", e.target.value || undefined)} placeholder="Country" />
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.remote ?? false}
            onChange={e => set("remote", e.target.checked || undefined)}
          />
          Remote only
        </label>
      </fieldset>

      <fieldset className="filter-field">
        <legend>Seniority</legend>
        {SENIORITY_LEVELS.map(level => (
          <label key={level} className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.seniority?.includes(level) ?? false}
              onChange={() => toggleSeniority(level)}
            />
            {level}
          </label>
        ))}
      </fieldset>

      <fieldset className="filter-field">
        <legend>Salary (min / max)</legend>
        <input
          type="number"
          value={filters.minSalary ?? ""}
          onChange={e => set("minSalary", e.target.value ? Number(e.target.value) : undefined)}
          placeholder="Min"
        />
        <input
          type="number"
          value={filters.maxSalary ?? ""}
          onChange={e => set("maxSalary", e.target.value ? Number(e.target.value) : undefined)}
          placeholder="Max"
        />
      </fieldset>

      <label className="filter-field">
        Posted within
        <select
          value={filters.daysAgo ?? ""}
          onChange={e => set("daysAgo", e.target.value ? Number(e.target.value) : undefined)}
        >
          {FRESHNESS_OPTIONS.map(opt => (
            <option key={opt.label} value={opt.value ?? ""}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <Button type="submit" disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </Button>
    </form>
  );
}
