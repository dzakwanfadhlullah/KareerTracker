"use client";

import { CalendarDays, CheckCircle2, Circle, Plus, Video } from "lucide-react";
import { finalStatuses } from "@/lib/status";
import { useDashboard } from "../DashboardProvider";
import { EmptyState, PageHeader, SectionTitle } from "../layout/DashboardUI";
import { StatusPill } from "../status/StatusPill";

export function InterviewsView() {
  const { applications, interviews, selectApplication, createInterview, setAddOpen, actionPending } = useDashboard();
  const firstActiveApplication = applications.find((item) => !item.isArchived && !finalStatuses.includes(item.status));
  const featuredInterview = interviews[0];
  const featuredApplication = featuredInterview ? applications.find((item) => item.id === featuredInterview.applicationId) : null;

  return (
    <div className="app-page">
      <PageHeader
        title="Interviews"
        description="Simpan catatan interview, pertanyaan, feedback, dan next step sesuai lamaran yang terkait."
        action={firstActiveApplication ? <button type="button" className="app-button app-button-primary" disabled={actionPending} onClick={() => createInterview({ applicationId: firstActiveApplication.id, stage: "hr_interview", scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), preparationNotes: "Prepare STAR answers.", questionsToPrepare: ["Ceritakan pengalaman relevan.", "Kenapa tertarik role ini?", "Apa pertanyaan untuk interviewer?"], nextStep: "Review company research" })}><Plus size={17} />Add Interview</button> : <button type="button" className="app-button app-button-primary" onClick={() => setAddOpen(true)}><Plus size={17} />Add Application First</button>}
      />
      {!interviews.length ? <EmptyState title="Belum ada jadwal interview." description="Saat lamaran masuk tahap interview, jadwal dan catatannya akan muncul di sini." /> : (
        <div className="app-interview-layout">
          <section><SectionTitle>Upcoming</SectionTitle>{interviews.map((interview) => {
            const application = applications.find((item) => item.id === interview.applicationId);
            const date = interview.scheduledAt ? new Date(interview.scheduledAt) : null;
            return <button className="app-interview-card" type="button" key={interview.id} onClick={() => application && selectApplication(application.id)}><span className="app-date-tile"><b>{date ? date.getDate() : "--"}</b>{date ? date.toLocaleDateString("id-ID", { month: "short" }).toUpperCase() : "TBD"}</span><div><p><b>{application?.companyName}</b><StatusPill status="interview" /></p><h3>{application?.roleTitle}</h3><span><CalendarDays size={14} />{date ? date.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "Belum dijadwalkan"}</span><span><Video size={14} />{interview.locationType || "unknown"} interview</span></div></button>;
          })}</section>
          {featuredInterview && <aside className="app-card app-interview-prep"><p className="app-eyebrow">PREPARE</p><h2>{featuredApplication?.companyName} · {featuredApplication?.roleTitle}</h2><p>Gunakan checklist ini sebelum interview dimulai.</p><div>{featuredInterview.questionsToPrepare.map((question, index) => <label key={question}>{index === 0 ? <CheckCircle2 size={18} /> : <Circle size={18} />}<span>{question}</span></label>)}</div><div className="app-next-focus"><b>Next step</b><p>{featuredInterview.nextStep || "Review application detail and company research."}</p></div></aside>}
        </div>
      )}
    </div>
  );
}
