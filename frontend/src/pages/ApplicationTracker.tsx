import { useState } from "react";
import { Link } from "react-router-dom";
import { useTracker } from "../hooks/useTracker";
import { runSequentiallyWithDelay, runWithConcurrency } from "../lib/bulk";
import { resumeService } from "../services/resumeService";
import { referralService } from "../services/referralService";
import DataTable, { type Column } from "@/components/shared/DataTable";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ALL_STATUSES, labelForStatus, toneForStatus } from "../lib/jobLabels";
import type { JobPipeline, JobStatus } from "../types";

type BulkStatus = "idle" | "pending" | "success" | "error";
type StatusTab = "ALL" | JobStatus;

const TABS: StatusTab[] = ["ALL", "DISCOVERED", "REFERRAL_READY", "APPLIED", "REJECTED"];

export default function ApplicationTracker() {
  const { dashboard, loading, error, updateStatus } = useTracker();
  const [tab, setTab] = useState<StatusTab>("ALL");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [bulkStatus, setBulkStatus] = useState<Record<string, BulkStatus>>({});
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkSummary, setBulkSummary] = useState<string | null>(null);

  if (error) return <p role="alert">{error}</p>;
  if (loading || !dashboard) return <p className="text-sm text-muted-foreground">Loading...</p>;

  const jobs = dashboard.jobs.filter(p => tab === "ALL" || p.status === tab);
  const selectedIds = Object.keys(selected).filter(id => selected[id]);
  const toggle = (id: string) => setSelected(prev => ({ ...prev, [id]: !prev[id] }));

  const runBulk = async (mode: "resumes" | "employees-referrals") => {
    setBulkRunning(true);
    setBulkSummary(null);
    setBulkStatus(Object.fromEntries(selectedIds.map(id => [id, "pending"])));

    let successCount = 0;
    const failures: string[] = [];
    const onResult = (id: string, result: { status: "success" | "error"; error?: unknown }) => {
      setBulkStatus(prev => ({ ...prev, [id]: result.status }));
      if (result.status === "success") {
        successCount++;
      } else {
        const jobName = dashboard.jobs.find(j => j.job.id === id)?.job.company ?? id;
        const message = result.error instanceof Error ? result.error.message : "unknown error";
        failures.push(`${jobName}: ${message}`);
      }
    };

    if (mode === "resumes") {
      await runWithConcurrency(selectedIds, 3, id => resumeService.generate(id), onResult);
    } else {
      await runSequentiallyWithDelay(selectedIds, id => referralService.generateDrafts(id), onResult, [3000, 5000]);
    }

    setBulkRunning(false);
    setBulkSummary(
      `${successCount} succeeded, ${failures.length} failed` + (failures.length ? ` — ${failures.join("; ")}` : "")
    );
  };

  const columns: Column<JobPipeline>[] = [
    {
      key: "select",
      label: "",
      render: row => (
        <Checkbox
          checked={!!selected[row.job.id]}
          onCheckedChange={() => toggle(row.job.id)}
          aria-label={`Select ${row.job.title}`}
        />
      )
    },
    { key: "title", label: "Job", render: row => <Link to={`/jobs/${row.job.id}`} className="hover:underline">{row.job.title}</Link> },
    { key: "company", label: "Company", render: row => row.job.company },
    { key: "status", label: "Status", render: row => <StatusBadge tone={toneForStatus(row.status)}>{labelForStatus(row.status)}</StatusBadge> },
    {
      key: "action",
      label: "Action",
      hideOnTablet: true,
      render: row => (
        <select
          className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          value={row.status}
          onChange={e => updateStatus(row.job.id, e.target.value as JobStatus)}
        >
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{labelForStatus(s)}</option>
          ))}
        </select>
      )
    },
    { key: "bulk", label: "Bulk", render: row => bulkStatus[row.job.id] ?? "" }
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Application Tracker" />

      <Tabs value={tab} onValueChange={value => setTab(value as StatusTab)}>
        <TabsList>
          {TABS.map(t => (
            <TabsTrigger key={t} value={t}>
              {t} ({t === "ALL" ? dashboard.total : dashboard.jobs.filter(j => j.status === t).length})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {selectedIds.length > 0 && (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-foreground">{selectedIds.length} job(s) selected</p>
            <Button size="sm" disabled={bulkRunning} onClick={() => runBulk("resumes")}>
              Generate Resumes for Selected
            </Button>
            <Button size="sm" variant="outline" disabled={bulkRunning} onClick={() => runBulk("employees-referrals")}>
              Find Employees & Draft Referrals for Selected
            </Button>
            {bulkSummary && <p className="w-full text-xs text-muted-foreground">{bulkSummary}</p>}
          </CardContent>
        </Card>
      )}

      <DataTable columns={columns} rows={jobs} rowKey={row => row.job.id} />
    </div>
  );
}
