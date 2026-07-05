import type { FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { JobSearchParams } from "@/types";

const SENIORITY_LEVELS = ["internship", "entry", "mid", "senior", "lead", "staff", "principal"] as const;

const FRESHNESS_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Any time", value: "any" },
  { label: "Last 24 hours", value: "1" },
  { label: "Last 3 days", value: "3" },
  { label: "Last 7 days", value: "7" },
  { label: "Last 14 days", value: "14" },
  { label: "Last 30 days", value: "30" },
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
    <Card size="sm" className="self-start">
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filter-title">Title</Label>
            <Input
              id="filter-title"
              value={filters.title ?? ""}
              onChange={e => set("title", e.target.value || undefined)}
              placeholder="e.g. Software Engineer"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filter-keywords">Keywords</Label>
            <Input
              id="filter-keywords"
              value={filters.keywords?.join(", ") ?? ""}
              onChange={e =>
                set(
                  "keywords",
                  e.target.value ? e.target.value.split(",").map(k => k.trim()).filter(Boolean) : undefined
                )
              }
              placeholder="e.g. python, aws"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filter-company">Company</Label>
            <Input
              id="filter-company"
              value={filters.company ?? ""}
              onChange={e => set("company", e.target.value || undefined)}
              placeholder="e.g. Acme"
            />
          </div>

          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-sm font-medium text-foreground">Location</legend>
            <Input
              aria-label="City"
              value={filters.city ?? ""}
              onChange={e => set("city", e.target.value || undefined)}
              placeholder="City"
            />
            <Input
              aria-label="Region or state"
              value={filters.region ?? ""}
              onChange={e => set("region", e.target.value || undefined)}
              placeholder="Region/State"
            />
            <Input
              aria-label="Country"
              value={filters.country ?? ""}
              onChange={e => set("country", e.target.value || undefined)}
              placeholder="Country"
            />
            <div className="mt-1 flex items-center gap-2">
              <Checkbox
                id="filter-remote"
                checked={filters.remote ?? false}
                onCheckedChange={checked => set("remote", checked === true ? true : undefined)}
              />
              <Label htmlFor="filter-remote" className="font-normal">
                Remote only
              </Label>
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-sm font-medium text-foreground">Seniority</legend>
            {SENIORITY_LEVELS.map(level => (
              <div key={level} className="flex items-center gap-2">
                <Checkbox
                  id={`filter-seniority-${level}`}
                  checked={filters.seniority?.includes(level) ?? false}
                  onCheckedChange={() => toggleSeniority(level)}
                />
                <Label htmlFor={`filter-seniority-${level}`} className="font-normal capitalize">
                  {level}
                </Label>
              </div>
            ))}
          </fieldset>

          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-sm font-medium text-foreground">Years of experience (min / max)</legend>
            <p className="mb-1 text-xs text-muted-foreground">
              More precise than Seniority above — matches years actually stated in the job description,
              rather than a title-based guess.
            </p>
            <Input
              type="number"
              min={0}
              aria-label="Minimum years of experience"
              value={filters.minYears ?? ""}
              onChange={e => set("minYears", e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Min"
            />
            <Input
              type="number"
              min={0}
              aria-label="Maximum years of experience"
              value={filters.maxYears ?? ""}
              onChange={e => set("maxYears", e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Max"
            />
          </fieldset>

          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-sm font-medium text-foreground">Salary (min / max)</legend>
            <Input
              type="number"
              aria-label="Minimum salary"
              value={filters.minSalary ?? ""}
              onChange={e => set("minSalary", e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Min"
            />
            <Input
              type="number"
              aria-label="Maximum salary"
              value={filters.maxSalary ?? ""}
              onChange={e => set("maxSalary", e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Max"
            />
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filter-freshness">Posted within</Label>
            <Select
              value={filters.daysAgo !== undefined ? String(filters.daysAgo) : "any"}
              onValueChange={value => set("daysAgo", value === "any" ? undefined : Number(value))}
            >
              <SelectTrigger id="filter-freshness" className="w-full">
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent>
                {FRESHNESS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
