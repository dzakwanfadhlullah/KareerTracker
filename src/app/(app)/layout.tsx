import { DashboardShell } from "@/components/dashboard/shell/DashboardShell";
import "./dashboard.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
