import employeeService from "../services/employees/employee.service";

class FindEmployeesAdhocWorkflow {
  async run(company: string) {
    return employeeService.find(company);
  }
}

export default new FindEmployeesAdhocWorkflow();
