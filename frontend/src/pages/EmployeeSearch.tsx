import { useParams } from "react-router-dom";
import { UsersIcon } from "lucide-react";
import { useEmployees } from "../hooks/useEmployees";
import EmployeeCard from "../components/features/EmployeeCard";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function EmployeeSearch() {
  const { id } = useParams<{ id: string }>();
  const { employees, loading, error, find } = useEmployees(id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Employee Search"
        description="Find people at this company to reach out to for a referral."
        actions={
          <Button onClick={find} disabled={loading}>
            {loading ? "Searching LinkedIn..." : "Find Employees"}
          </Button>
        }
      />

      {error && <p role="alert">{error}</p>}

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!loading && employees && employees.length === 0 && (
        <EmptyState icon={UsersIcon} title="No employees found" description="Try again later, or check the company's LinkedIn page directly." />
      )}

      {!loading && employees && employees.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {employees.map(employee => (
            <EmployeeCard key={employee.linkedin} employee={employee} jobId={id!} />
          ))}
        </div>
      )}
    </div>
  );
}
