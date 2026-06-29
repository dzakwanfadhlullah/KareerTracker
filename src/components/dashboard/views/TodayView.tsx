"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Plus, Sparkles } from "lucide-react";
import { finalStatuses } from "@/lib/status";
import { useDashboard } from "../DashboardProvider";
import { ApplicationCard, ApplicationList } from "../applications/ApplicationList";
import { CardShell, EmptyState, PageHeader, SectionTitle } from "../layout/DashboardUI";

export function TodayView() {
  const { applications, events, followUps, interviews, setAddOpen, completeFollowUp } = useDashboard();
  const active = applications.filter((item) => !item.isArchived && !finalStatuses.includes(item.status));
  const activeFollowUps = followUps.filter((item) => !["completed", "cancelled", "rescheduled"].includes(item.status));
  const activeFollowUpIds = new Set(activeFollowUps.map((item) => item.applicationId));
  const followUpApplications = active.filter((item) => activeFollowUpIds.has(item.id) || item.attentionStatus === "follow_up_needed");
  const attention = active.filter((item) => item.attentionStatus || item.status === "technical_test" || item.status === "interview").slice(0, 3);
  const upcoming = interviews.filter((item) => item.status === "scheduled" || item.status === "needs_preparation");
  const responseCount = new Set([
    ...active.filter((item) => ["hr_screening", "interview", "technical_test", "offering", "accepted", "rejected"].includes(item.status)).map((item) => item.id),
    ...events.filter((event) => event.type === "status_changed" && /hr screening|interview|technical test|offering|accepted|rejected/i.test(`${event.title} ${event.description || ""}`)).map((event) => event.applicationId),
  ]).size;
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="app-page app-page-today">
      <PageHeader
        title="Today"
        description="Lihat lamaran yang perlu follow-up, interview yang harus disiapkan, dan progress apply yang sedang berjalan."
        meta={<span>{today}</span>}
        action={<button type="button" className="app-button app-button-primary" onClick={() => setAddOpen(true)}><Plus size={17} />Add Application</button>}
      />
      {applications.length === 0 ? (
        <EmptyState title="Mulai tracking apply kerja kamu." description="Tambahkan lamaran pertama agar status, follow-up, interview, dan progress kamu bisa dipantau di sini." action={<button type="button" className="app-button app-button-primary" onClick={() => setAddOpen(true)}>Tambah Lamaran</button>} />
      ) : (
        <>
          <div className="app-metric-grid">
            {[["Active", active.length, "applications"], ["Follow-Up", followUpApplications.length, "need action"], ["Interview", upcoming.length, "upcoming"], ["Response", responseCount, "received"]].map(([label, value, helper]) => (
              <CardShell key={label}><p className="app-metric-label">{label}</p><strong className="app-metric-value">{value}</strong><small>{helper}</small></CardShell>
            ))}
          </div>
          <div className="app-today-grid">
            <div className="app-today-column">
              <CardShell variant="attention">
                <SectionTitle action={<Link href="/follow-up">View all <ArrowRight size={14} /></Link>}>Needs Attention</SectionTitle>
                {attention.length ? <div className="app-card-stack">{attention.map((item) => <ApplicationCard application={item} key={item.id} />)}</div> : <p className="app-muted">Belum ada lamaran yang perlu perhatian khusus.</p>}
              </CardShell>
              <CardShell>
                <SectionTitle action={<Link href="/applications">All applications <ArrowRight size={14} /></Link>}>Active Applications</SectionTitle>
                <ApplicationList applications={active.slice(0, 4)} compact />
              </CardShell>
              <CardShell>
                <SectionTitle>Recent Updates</SectionTitle>
                <div className="app-recent-list">{events.slice(0, 4).map((event) => <div key={event.id}><span><CheckCircle2 size={15} /></span><p><b>{event.title}</b><small>{event.description}</small></p><time>{new Date(event.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</time></div>)}</div>
              </CardShell>
            </div>
            <div className="app-today-column">
              <CardShell>
                <SectionTitle action={<Link href="/follow-up">Open queue <ArrowRight size={14} /></Link>}>Follow-Up Due</SectionTitle>
                {followUpApplications.length ? <div className="app-action-list">{followUpApplications.slice(0, 3).map((item) => <div key={item.id}><span className="app-action-icon amber"><Clock3 size={17} /></span><p><b>{item.companyName}</b><small>{item.roleTitle} · {item.nextAction}</small></p><button type="button" onClick={() => completeFollowUp(item.id)}>Done</button></div>)}</div> : <p className="app-muted">Belum ada follow-up hari ini.</p>}
              </CardShell>
              <CardShell>
                <SectionTitle action={<Link href="/interviews">Prepare <ArrowRight size={14} /></Link>}>Upcoming Interviews</SectionTitle>
                {upcoming.length ? upcoming.map((interview) => {
                  const application = applications.find((item) => item.id === interview.applicationId);
                  return <div className="app-upcoming" key={interview.id}><span><CalendarDays size={18} /></span><p><b>{application?.companyName}</b><small>{application?.roleTitle}</small><em>{interview.stage.replaceAll("_", " ")} · {interview.scheduledAt ? new Date(interview.scheduledAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "Belum dijadwalkan"}</em></p></div>;
                }) : <p className="app-muted">Belum ada interview terjadwal.</p>}
              </CardShell>
              <CardShell className="app-weekly-card">
                <SectionTitle action={<Link href="/insights">Review <ArrowRight size={14} /></Link>}>Weekly Review</SectionTitle>
                <div className="app-weekly-summary"><Sparkles size={18} /><p><b>This week</b><span>{applications.filter((item) => item.appliedAt).length} applied · {responseCount} responses · {upcoming.length} interviews</span></p></div>
                <div className="app-next-focus"><b>Next focus</b><p>{followUpApplications.length ? `Follow up ${followUpApplications.length} waiting applications.` : "Keep applications updated after every response."}</p></div>
              </CardShell>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
