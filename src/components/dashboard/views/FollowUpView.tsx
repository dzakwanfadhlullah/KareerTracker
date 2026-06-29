"use client";

import { Check, Clock3, ExternalLink, RefreshCw } from "lucide-react";
import { useDashboard } from "../DashboardProvider";
import { EmptyState, PageHeader, SectionTitle } from "../layout/DashboardUI";
import { AttentionBadge, StatusPill } from "../status/StatusPill";

export function FollowUpView() {
  const { applications, completeFollowUp, setFollowUp, selectApplication } = useDashboard();
  const due = applications.filter((item) => !item.isArchived && (item.followUpAt || item.attentionStatus === "follow_up_needed"));
  const groups = [
    ["DUE TODAY", due.filter((item) => item.followUpAt?.startsWith("2026-06-27") || item.attentionStatus === "follow_up_needed")],
    ["THIS WEEK", due.filter((item) => !item.followUpAt?.startsWith("2026-06-27"))],
    ["WAITING TOO LONG", applications.filter((item) => item.status === "waiting_response" && !due.some((dueItem) => dueItem.id === item.id))],
  ] as const;

  return (
    <div className="app-page">
      <PageHeader title="Follow-Up" description="Pantau lamaran yang perlu ditindaklanjuti agar tidak hilang begitu saja." meta={<span>{due.length} applications need attention</span>} />
      <div className="app-metric-grid app-metric-grid-three">{[["Due today", groups[0][1].length], ["This week", groups[1][1].length], ["Waiting too long", groups[2][1].length]].map(([label, count]) => <section className="app-card" key={label}><p className="app-metric-label">{label}</p><strong className="app-metric-value">{count}</strong></section>)}</div>
      {!due.length ? <EmptyState title="Belum ada follow-up hari ini." description="Semua aman untuk sekarang. Lamaran yang perlu ditindaklanjuti akan muncul di sini." /> : (
        <div className="app-follow-groups">{groups.map(([label, items]) => items.length > 0 && <section key={label}><SectionTitle>{label}</SectionTitle><div className="app-follow-list">{items.map((item) => <article key={item.id}><span className="app-action-icon amber"><Clock3 size={18} /></span><div><b>{item.companyName}</b><p>{item.roleTitle}</p><span><StatusPill status={item.status} /><AttentionBadge /></span></div><p className="app-follow-meta">{item.nextAction}<small>{item.followUpAt ? new Date(item.followUpAt).toLocaleDateString("id-ID", { dateStyle: "medium" }) : "Applied 7+ days ago"}</small></p><div className="app-row-actions"><button type="button" onClick={() => completeFollowUp(item.id)}><Check size={15} />Mark followed up</button><button type="button" onClick={() => setFollowUp(item.id, "2026-06-29T09:00:00.000Z")}><RefreshCw size={15} />Reschedule</button><button type="button" aria-label="Open application" onClick={() => selectApplication(item.id)}><ExternalLink size={15} /></button></div></article>)}</div></section>)}</div>
      )}
    </div>
  );
}
