import { useParams } from "react-router-dom";
import { useEmployees } from "../hooks/useEmployees";
import EmployeeCard from "../components/features/EmployeeCard";
import Button from "../components/common/Button";

export default function EmployeeSearch() {
  const { id } = useParams<{ id: string }>();
  const { employees, loading, error, find } = useEmployees(id);

  return (
    <div className="page">
      <h1 className="text-display">Employee Search</h1>
      <Button onClick={find} disabled={loading}>
        {loading ? "Searching LinkedIn..." : "Find Employees"}
      </Button>

      {error && <p role="alert">{error}</p>}

      {employees && (
        <div className="employee-grid">
          {employees.map(employee => (
            <EmployeeCard key={employee.linkedin} employee={employee} jobId={id!} />
          ))}
        </div>
      )}
    </div>
  );
}
