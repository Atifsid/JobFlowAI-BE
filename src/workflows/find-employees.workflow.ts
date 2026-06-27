import cache from "../services/jobs/job-cache.service";
import employeeService from "../services/employees/employee.service";

class FindEmployeesWorkflow {
  async run(jobId: string) {
    const job = await cache.get(jobId);

    if (!job)
      throw new Error("Job not found");

    return employeeService.find(job.company);
  }
}

export default new FindEmployeesWorkflow();