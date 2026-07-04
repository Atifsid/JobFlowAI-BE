import { Link, useLocation, useParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useJobDetail } from "@/hooks/useJobDetail";

const STATIC_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/search": "Job Search",
  "/jobs": "Tracker",
};

const JOB_SUBPAGE_LABELS: Record<string, string> = {
  resume: "Resume Tailor",
  employees: "Employee Search",
  referral: "Referral Draft",
};

export default function AppBreadcrumbs() {
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const { pipeline } = useJobDetail(params.id);

  const segments = location.pathname.split("/").filter(Boolean);
  const isJobRoute = segments[0] === "jobs" && Boolean(segments[1]);

  if (!isJobRoute) {
    const label = STATIC_LABELS[location.pathname] ?? "Dashboard";
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{label}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const subpage = segments[2] ? JOB_SUBPAGE_LABELS[segments[2]] : undefined;
  const jobLabel = pipeline ? `${pipeline.job.title} @ ${pipeline.job.company}` : "Job";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link to="/jobs" />}>Tracker</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {subpage ? (
            <BreadcrumbLink render={<Link to={`/jobs/${params.id}`} />}>{jobLabel}</BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{jobLabel}</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {subpage && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{subpage}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
