import linkedinProvider from "./providers/linkedin.provider";

class EmployeeService {
  async find(company: string) {
    return linkedinProvider.find(company);
  }
}

export default new EmployeeService();
