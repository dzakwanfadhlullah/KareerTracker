"use client";

import { CalendarDays, CheckCircle2, Circle, Plus, Video } from "lucide-react";
import { useDashboard } from "../DashboardProvider";
import { EmptyState, PageHeader, SectionTitle } from "../layout/DashboardUI";
import { StatusPill } from "../status/StatusPill";

export function InterviewsView() {
  const { applications, interviews, selectApplication } = useDashboard();

  return (
    <div className="app-page">
      <PageHeader title="Interviews" description="Simpan catatan interview, pertanyaan, feedback, dan next step sesuai lamaran yang terkait." action={<button type="button" className="app-button app-button-primary"><Plus size={17} />Add Interview</button>} />
      {!interviews.length ? <EmptyState title="Belum ada jadwal interview." description="Saat lamaran masuk tahap interview, jadwal dan catatannya akan muncul di sini." /> : (
        <div className="app-interview-layout">
          <section><SectionTitle>Upcoming</SectionTitle>{interviews.map((interview) => {
            const application = applications.find((item) => item.id === interview.applicationId);
            return <button className="app-interview-card" type="button" key={interview.id} onClick={() => application && selectApplication(application.id)}><span className="app-date-tile"><b>28</b>JUN</span><div><p><b>{application?.companyName}</b><StatusPill status="interview" /></p><h3>{application?.roleTitle}</h3><span><CalendarDays size={14} />Tomorrow · 10:00</span><span><Video size={14} />Online interview</span></div></button>;
          })}</section>
          <aside className="app-card app-interview-prep"><p className="app-eyebrow">PREPARE</p><h2>Bank Mandiri · ODP Technology</h2><p>Gunakan checklist ini sebelum interview dimulai.</p><div>{interviews[0].questionsToPrepare.map((question, index) => <label key={question}>{index === 0 ? <CheckCircle2 size={18} /> : <Circle size={18} />}<span>{question}</span></label>)}</div><div className="app-next-focus"><b>Next step</b><p>{interviews[0].nextStep}</p></div></aside>
        </div>
      )}
    </div>
  );
}
