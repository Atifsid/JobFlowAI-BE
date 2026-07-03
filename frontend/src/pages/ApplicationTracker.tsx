import { useState } from "react";
import { Link } from "react-router-dom";
import { useTracker } from "../hooks/useTracker";
import { runSequentiallyWithDelay, runWithConcurrency } from "../lib/bulk";
import { resumeService } from "../services/resumeService";
import { referralService } from "../services/referralService";
import DataTable, { type Column } from "../components/common/DataTable";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
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
  if (loading || !dashboard) return <p>Loading...</p>;

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
        <input type="checkbox" checked={!!selected[row.job.id]} onChange={() => toggle(row.job.id)} />
      )
    },
    { key: "title", label: "Job", render: row => <Link to={`/jobs/${row.job.id}`}>{row.job.title}</Link> },
    { key: "company", label: "Company", render: row => row.job.company },
    { key: "status", label: "Status", render: row => <Badge tone={toneForStatus(row.status)}>{labelForStatus(row.status)}</Badge> },
    {
      key: "action",
      label: "Action",
      hideOnTablet: true,
      render: row => (
        <select value={row.status} onChange={e => updateStatus(row.job.id, e.target.value as JobStatus)}>
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>{labelForStatus(s)}</option>
          ))}
        </select>
      )
    },
    { key: "bulk", label: "Bulk", render: row => bulkStatus[row.job.id] ?? "" }
  ];

  return (
    <div className="page">
      <h1 className="text-display">Application Tracker</h1>

      <div className="tracker-tabs">
        {TABS.map(t => (
          <button key={t} className={t === tab ? "tracker-tab--active" : ""} onClick={() => setTab(t)}>
            {t} ({t === "ALL" ? dashboard.total : dashboard.jobs.filter(j => j.status === t).length})
          </button>
        ))}
      </div>

      {selectedIds.length > 0 && (
        <div className="tracker-bulk">
          <p>{selectedIds.length} job(s) selected</p>
          <Button disabled={bulkRunning} onClick={() => runBulk("resumes")}>
            Generate Resumes for Selected
          </Button>
          <Button disabled={bulkRunning} onClick={() => runBulk("employees-referrals")}>
            Find Employees & Draft Referrals for Selected
          </Button>
          {bulkSummary && <p>{bulkSummary}</p>}
        </div>
      )}

      <DataTable columns={columns} rows={jobs} rowKey={row => row.job.id} />
    </div>
  );
}
