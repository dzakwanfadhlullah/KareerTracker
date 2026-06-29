"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, BriefcaseBusiness, Building2, CalendarDays, FileText, LayoutDashboard,
  ListTodo, LogOut, MoreHorizontal, Settings, Target, UserRound,
} from "lucide-react";
import { logoutAction } from "@/app/(auth)/auth-actions";
import type { DashboardData } from "@/lib/dashboard/data";
import { DashboardProvider, useDashboard } from "../DashboardProvider";
import { AddApplicationDialog, ApplicationDetailDrawer } from "../applications/ApplicationOverlays";

const navItems = [
  { label: "Today", href: "/dashboard", icon: LayoutDashboard },
  { label: "Applications", href: "/applications", icon: BriefcaseBusiness },
  { label: "Pipeline", href: "/pipeline", icon: Target },
  { label: "Follow-Up", href: "/follow-up", icon: ListTodo },
  { label: "Interviews", href: "/interviews", icon: CalendarDays },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Insights", href: "/insights", icon: BarChart3 },
];

function ShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { followUps, profile, setAddOpen, toast, actionError } = useDashboard();
  const followUpCount = followUps.filter((item) => !["completed", "cancelled", "rescheduled"].includes(item.status)).length;

  return (
    <div className="kt-dashboard app-shell">
      <aside className="app-sidebar">
        <Link href="/" className="app-brand"><span>K</span><p>KareerTrack<small>by MagangKareer</small></p></Link>
        <p className="app-workspace-label">PERSONAL WORKSPACE</p>
        <nav aria-label="Dashboard navigation">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href} data-active={pathname === href || (href !== "/dashboard" && pathname.startsWith(href))}>
              <Icon size={18} /><span>{label}</span>{label === "Follow-Up" && followUpCount > 0 && <b>{followUpCount}</b>}
            </Link>
          ))}
        </nav>
        <div className="app-sidebar-bottom">
          <Link href="/settings" data-active={pathname === "/settings"}><Settings size={18} /><span>Settings</span></Link>
          <div className="app-user"><span><UserRound size={16} /></span><p>{profile.name || "KareerTrack User"}<small>{profile.email}</small></p></div>
          <form action={logoutAction}><button className="app-logout" type="submit"><LogOut size={16} />Logout</button></form>
        </div>
      </aside>
      <main className="app-main">
        <div className="app-mobile-topbar">
          <Link href="/" className="app-mobile-brand">K</Link>
          <details className="app-mobile-more">
            <summary aria-label="More dashboard links"><MoreHorizontal size={19} /></summary>
            <div>
              <Link href="/follow-up">Follow-Up</Link>
              <Link href="/companies">Companies</Link>
              <Link href="/documents">Documents</Link>
              <Link href="/settings">Settings</Link>
            </div>
          </details>
          <button type="button" aria-label="Tambah lamaran" onClick={() => setAddOpen(true)}>+</button>
        </div>
        {children}
      </main>
      <nav className="app-bottom-nav" aria-label="Mobile dashboard navigation">
        {[
          ["Today", "/dashboard", LayoutDashboard],
          ["Track", "/applications", BriefcaseBusiness],
          ["Pipeline", "/pipeline", Target],
          ["Interview", "/interviews", CalendarDays],
          ["Insights", "/insights", BarChart3],
        ].map(([label, href, Icon]) => (
          <Link key={String(href)} href={String(href)} data-active={pathname === href}><Icon size={19} /><span>{String(label)}</span></Link>
        ))}
      </nav>
      <AddApplicationDialog />
      <ApplicationDetailDrawer />
      {actionError && <div className="app-toast app-toast-error" role="alert">{actionError}</div>}
      {toast && <div className="app-toast" role="status">{toast}</div>}
    </div>
  );
}

export function DashboardShell({ children, initialData }: { children: React.ReactNode; initialData: DashboardData }) {
  return <DashboardProvider initialData={initialData}><ShellContent>{children}</ShellContent></DashboardProvider>;
}
