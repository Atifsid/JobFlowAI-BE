import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useJobDetail } from "../hooks/useJobDetail";
import { resumeService } from "../services/resumeService";
import { referralService } from "../services/referralService";
import JobDetailPanel from "../components/features/JobDetailPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type PipelineStatus = "idle" | "pending" | "success" | "error";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pipeline, loading, error, updateStatus } = useJobDetail(id);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>("idle");
  const [pipelineMessage, setPipelineMessage] = useState<string | null>(null);

  const runPipeline = async () => {
    if (!id) return;
    setPipelineStatus("pending");
    setPipelineMessage(null);
    try {
      await resumeService.generate(id);
      await referralService.generateDrafts(id);
      setPipelineStatus("success");
      setPipelineMessage("Resume generated and referral drafted.");
    } catch (err) {
      setPipelineStatus("error");
      setPipelineMessage(err instanceof Error ? err.message : "Pipeline failed");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Button variant="ghost" size="sm" className="self-start" onClick={() => navigate(-1)}>
        ← Back
      </Button>

      {error && <p role="alert">{error}</p>}

      {!error && (loading || !pipeline) && (
        <Card aria-busy="true" aria-label="Loading job">
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-7 w-80" />
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-60" />
              </div>
              <Skeleton className="h-8 w-36" />
            </div>
            <div className="flex items-center gap-6">
              <Skeleton className="size-[120px] rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-[70%]" />
                <Skeleton className="h-4 w-[90%]" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-36" />
              <Skeleton className="h-9 w-36" />
            </div>
          </CardContent>
        </Card>
      )}

      {!error && !loading && pipeline && (
        <JobDetailPanel
          pipeline={pipeline}
          onStatusChange={updateStatus}
          onRunPipeline={runPipeline}
          pipelineStatus={pipelineStatus}
          pipelineMessage={pipelineMessage}
        />
      )}
    </div>
  );
}
