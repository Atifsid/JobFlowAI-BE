import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import SearchPage from "./pages/SearchPage";
import JobsPage from "./pages/JobsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/jobs" replace />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/:id" element={<div>Job detail (Task 7)</div>} />
        <Route path="jobs/:id/employees" element={<div>Employees (Task 8)</div>} />
        <Route path="jobs/:id/referral" element={<div>Referral (Task 9)</div>} />
      </Route>
    </Routes>
  );
}
