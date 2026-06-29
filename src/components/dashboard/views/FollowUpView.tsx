"use client";

import { Check, Clock3, ExternalLink, RefreshCw } from "lucide-react";
import { useDashboard } from "../DashboardProvider";
import { EmptyState, PageHeader, SectionTitle } from "../layout/DashboardUI";
import { AttentionBadge, StatusPill } from "../status/StatusPill";

const dayMs = 24 * 60 * 60 * 1000;

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
}

export function FollowUpView() {
  const { applications, followUps, completeFollowUp, setFollowUp, selectApplication } = useDashboard();
  const activeFollowUps = followUps.filter((item) => !["completed", "cancelled", "rescheduled"].includes(item.status));
  const dueApplications = activeFollowUps.flatMap((followUp) => {
    const application = applications.find((item) => item.id === followUp.applicationId);
    return application && !application.isArchived ? [{ followUp, application }] : [];
  });
  const today = startOfDay(new Date());
  const groups = [
    ["OVERDUE", dueApplications.filter(({ followUp }) => startOfDay(new Date(followUp.dueAt)) < today)],
    ["DUE TODAY", dueApplications.filter(({ followUp }) => startOfDay(new Date(followUp.dueAt)) === today)],
    ["THIS WEEK", dueApplications.filter(({ followUp }) => {
      const due = startOfDay(new Date(followUp.dueAt));
      return due > today && due <= today + 7 * dayMs;
    })],
    ["WAITING TOO LONG", applications.filter((item) => !item.isArchived && item.status === "waiting_response" && !activeFollowUps.some((followUp) => followUp.applicationId === item.id)).map((application) => ({ application, followUp: null }))],
  ] as const;

  return (
    <div className="app-page">
      <PageHeader title="Follow-Up" description="Pantau lamaran yang perlu ditindaklanjuti agar tidak hilang begitu saja." meta={<span>{dueApplications.length} applications need attention</span>} />
      <div className="app-metric-grid app-metric-grid-three">{[["Due today", groups[1][1].length], ["This week", groups[2][1].length], ["Waiting too long", groups[3][1].length]].map(([label, count]) => <section className="app-card" key={label}><p className="app-metric-label">{label}</p><strong className="app-metric-value">{count}</strong></section>)}</div>
      {!dueApplications.length && !groups[3][1].length ? <EmptyState title="Belum ada follow-up hari ini." description="Semua aman untuk sekarang. Lamaran yang perlu ditindaklanjuti akan muncul di sini." /> : (
        <div className="app-follow-groups">{groups.map(([label, items]) => items.length > 0 && <section key={label}><SectionTitle>{label}</SectionTitle><div className="app-follow-list">{items.map(({ application, followUp }) => <article key={`${label}-${application.id}`}><span className="app-action-icon amber"><Clock3 size={18} /></span><div><b>{application.companyName}</b><p>{application.roleTitle}</p><span><StatusPill status={application.status} /><AttentionBadge /></span></div><p className="app-follow-meta">{application.nextAction}<small>{followUp ? new Date(followUp.dueAt).toLocaleDateString("id-ID", { dateStyle: "medium" }) : "Waiting response without scheduled follow-up"}</small></p><div className="app-row-actions"><button type="button" onClick={() => completeFollowUp(application.id)}><Check size={15} />Mark followed up</button><button type="button" onClick={() => setFollowUp(application.id, new Date(Date.now() + 2 * dayMs).toISOString())}><RefreshCw size={15} />Reschedule</button><button type="button" aria-label="Open application" onClick={() => selectApplication(application.id)}><ExternalLink size={15} /></button></div></article>)}</div></section>)}</div>
      )}
    </div>
  );
}
