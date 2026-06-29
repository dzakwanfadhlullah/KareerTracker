import { DashboardShell } from "@/components/dashboard/shell/DashboardShell";
import { loadDashboardData } from "@/lib/dashboard/data";
import "./dashboard.css";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const initialData = await loadDashboardData();
  return <DashboardShell initialData={initialData}>{children}</DashboardShell>;
}
