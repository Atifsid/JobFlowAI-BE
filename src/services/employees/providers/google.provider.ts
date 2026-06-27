import { Employee, EmployeeProvider } from "../employee.types";

class GoogleProvider implements EmployeeProvider {
  async find(company: string): Promise<Employee[]> {
    return [
      {
        name: "John Doe",
        title: "Senior Software Engineer",
        company,
        linkedin: "https://linkedin.com/in/johndoe"
      }
    ];
  }
}

export default new GoogleProvider();