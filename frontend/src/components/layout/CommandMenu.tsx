import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { dashboardService } from "@/services/dashboardService";
import type { JobPipeline } from "@/types";

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const [jobs, setJobs] = useState<JobPipeline[]>([]);
  const [fetched, setFetched] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open || fetched) return;
    dashboardService.getDashboard().then(dashboard => {
      setJobs(dashboard.jobs);
      setFetched(true);
    });
  }, [open, fetched]);

  const select = (jobId: string) => {
    onOpenChange(false);
    navigate(`/jobs/${jobId}`);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Jump to a tracked job"
      description="Search tracked jobs by title or company"
    >
      <CommandInput placeholder="Search tracked jobs..." />
      <CommandList>
        <CommandEmpty>No tracked jobs found.</CommandEmpty>
        <CommandGroup heading="Tracked jobs">
          {jobs.map(({ job }) => (
            <CommandItem key={job.id} value={`${job.title} ${job.company}`} onSelect={() => select(job.id)}>
              {job.title} — {job.company}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
