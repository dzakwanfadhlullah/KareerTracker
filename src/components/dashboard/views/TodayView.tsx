"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Plus, Sparkles } from "lucide-react";
import { finalStatuses } from "@/lib/status";
import { useDashboard } from "../DashboardProvider";
import { ApplicationCard, ApplicationList } from "../applications/ApplicationList";
import { CardShell, EmptyState, PageHeader, SectionTitle } from "../layout/DashboardUI";

export function TodayView() {
  const { applications, events, interviews, setAddOpen, completeFollowUp } = useDashboard();
  const active = applications.filter((item) => !item.isArchived && !finalStatuses.includes(item.status));
  const followUps = active.filter((item) => item.followUpAt || item.attentionStatus === "follow_up_needed");
  const attention = active.filter((item) => item.attentionStatus || item.status === "technical_test" || item.status === "interview").slice(0, 3);
  const upcoming = interviews.filter((item) => item.status === "scheduled" || item.status === "needs_preparation");

  return (
    <div className="app-page app-page-today">
      <PageHeader
        title="Today"
        description="Lihat lamaran yang perlu follow-up, interview yang harus disiapkan, dan progress apply yang sedang berjalan."
        meta={<span>Sabtu, 27 Juni 2026</span>}
        action={<button type="button" className="app-button app-button-primary" onClick={() => setAddOpen(true)}><Plus size={17} />Add Application</button>}
      />
      {applications.length === 0 ? (
        <EmptyState title="Mulai tracking apply kerja kamu." description="Tambahkan lamaran pertama agar status, follow-up, interview, dan progress kamu bisa dipantau di sini." action={<button type="button" className="app-button app-button-primary" onClick={() => setAddOpen(true)}>Tambah Lamaran</button>} />
      ) : (
        <>
          <div className="app-metric-grid">
            {[["Active", active.length, "applications"], ["Follow-Up", followUps.length, "today"], ["Interview", upcoming.length, "this week"], ["Response", 4, "received"]].map(([label, value, helper]) => (
              <CardShell key={label}><p className="app-metric-label">{label}</p><strong className="app-metric-value">{value}</strong><small>{helper}</small></CardShell>
            ))}
          </div>
          <div className="app-today-grid">
            <div className="app-today-column">
              <CardShell variant="attention">
                <SectionTitle action={<Link href="/follow-up">View all <ArrowRight size={14} /></Link>}>Needs Attention</SectionTitle>
                <div className="app-card-stack">{attention.map((item) => <ApplicationCard application={item} key={item.id} />)}</div>
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
                {followUps.length ? <div className="app-action-list">{followUps.slice(0, 3).map((item) => <div key={item.id}><span className="app-action-icon amber"><Clock3 size={17} /></span><p><b>{item.companyName}</b><small>{item.roleTitle} · {item.nextAction}</small></p><button type="button" onClick={() => completeFollowUp(item.id)}>Done</button></div>)}</div> : <p className="app-muted">Belum ada follow-up hari ini.</p>}
              </CardShell>
              <CardShell>
                <SectionTitle action={<Link href="/interviews">Prepare <ArrowRight size={14} /></Link>}>Upcoming Interviews</SectionTitle>
                {upcoming.map((interview) => {
                  const application = applications.find((item) => item.id === interview.applicationId);
                  return <div className="app-upcoming" key={interview.id}><span><CalendarDays size={18} /></span><p><b>{application?.companyName}</b><small>{application?.roleTitle}</small><em>HR Interview · Tomorrow 10:00</em></p></div>;
                })}
              </CardShell>
              <CardShell className="app-weekly-card">
                <SectionTitle action={<Link href="/insights">Review <ArrowRight size={14} /></Link>}>Weekly Review</SectionTitle>
                <div className="app-weekly-summary"><Sparkles size={18} /><p><b>This week</b><span>12 applied · 4 responses · 2 interviews</span></p></div>
                <div className="app-next-focus"><b>Next focus</b><p>Follow up 3 waiting applications.</p></div>
              </CardShell>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
