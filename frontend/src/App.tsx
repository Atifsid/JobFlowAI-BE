import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const JobSearch = lazy(() => import("./pages/JobSearch"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
const ResumeTailor = lazy(() => import("./pages/ResumeTailor"));
const EmployeeSearch = lazy(() => import("./pages/EmployeeSearch"));
const ReferralDraft = lazy(() => import("./pages/ReferralDraft"));
const ApplicationTracker = lazy(() => import("./pages/ApplicationTracker"));
const QuickApply = lazy(() => import("./pages/QuickApply"));

export default function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="search" element={<JobSearch />} />
          <Route path="quick-apply" element={<QuickApply />} />
          <Route path="jobs" element={<ApplicationTracker />} />
          <Route path="jobs/:id" element={<JobDetail />} />
          <Route path="jobs/:id/resume" element={<ResumeTailor />} />
          <Route path="jobs/:id/employees" element={<EmployeeSearch />} />
          <Route path="jobs/:id/referral" element={<ReferralDraft />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
