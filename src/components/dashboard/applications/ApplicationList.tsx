"use client";

import { ChevronRight, Clock3, ExternalLink } from "lucide-react";
import type { DashboardApplication } from "@/types/application";
import { applicationStatusLabels } from "@/lib/status";
import { useDashboard } from "../DashboardProvider";
import { AttentionBadge, StatusPill } from "../status/StatusPill";

export function ApplicationList({ applications, compact = false }: { applications: DashboardApplication[]; compact?: boolean }) {
  const { selectApplication } = useDashboard();

  return (
    <div className={`app-application-list${compact ? " compact" : ""}`}>
      <div className="app-table-head">
        <span>Company & role</span><span>Status</span><span>Next action</span><span>Source</span><span>Updated</span>
      </div>
      {applications.map((application) => (
        <button className="app-application-row" type="button" key={application.id} onClick={() => selectApplication(application.id)}>
          <span className="app-company-cell"><i>{application.companyName[0]}</i><span><b>{application.companyName}</b><small>{application.roleTitle}</small></span></span>
          <span className="app-status-cell"><StatusPill status={application.status} />{application.attentionStatus === "follow_up_needed" && <AttentionBadge />}</span>
          <span className="app-next-cell">{application.nextAction || "Belum ada next action"}{application.followUpAt && <small><Clock3 size={12} />{new Date(application.followUpAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</small>}</span>
          <span className="app-source-cell">{application.source}</span>
          <span className="app-updated-cell">today<ChevronRight size={15} /></span>
        </button>
      ))}
    </div>
  );
}

export function ApplicationCard({ application }: { application: DashboardApplication }) {
  const { selectApplication } = useDashboard();
  return (
    <button className="app-application-card" type="button" onClick={() => selectApplication(application.id)}>
      <div><span className="app-company-avatar">{application.companyName[0]}</span><p><b>{application.companyName}</b><small>{application.roleTitle}</small></p><ChevronRight size={17} /></div>
      <div><StatusPill status={application.status} />{application.attentionStatus === "follow_up_needed" && <AttentionBadge />}</div>
      <p>{application.nextAction}</p>
      <small>{application.source}{application.jobUrl && <ExternalLink size={12} />}</small>
    </button>
  );
}

export function StatusSummary({ applications }: { applications: DashboardApplication[] }) {
  const grouped = applications.reduce<Record<string, number>>((acc, item) => {
    const label = applicationStatusLabels[item.status];
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
  return <div className="app-status-summary">{Object.entries(grouped).map(([label, value]) => <span key={label}><b>{value}</b>{label}</span>)}</div>;
}
