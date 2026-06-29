"use client";

import { Building2, Check, ChevronRight, FileText, Plus, Search, Settings2, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { applicationStatuses, applicationStatusLabels } from "@/lib/status";
import type { ApplicationStatus } from "@/types/status";
import { useDashboard } from "../DashboardProvider";
import { EmptyState, PageHeader, SectionTitle } from "../layout/DashboardUI";
import { StatusPill } from "../status/StatusPill";

const pipelineColumns: { title: string; statuses: ApplicationStatus[] }[] = [
  { title: "Saved", statuses: ["saved"] },
  { title: "Preparing", statuses: ["preparing"] },
  { title: "Applied", statuses: ["applied"] },
  { title: "Waiting", statuses: ["waiting_response", "follow_up_needed"] },
  { title: "Interview / Test", statuses: ["hr_screening", "interview", "technical_test"] },
  { title: "Result", statuses: ["offering", "accepted", "rejected", "ghosted"] },
];

export function PipelineView() {
  const { applications, selectApplication, updateStatus } = useDashboard();
  const active = applications.filter((item) => !item.isArchived);
  return (
    <div className="app-page app-page-wide">
      <PageHeader title="Pipeline" description="Lihat posisi setiap lamaran dari saved opportunity sampai final result." />
      <div className="app-pipeline-summary">{pipelineColumns.map((column) => <span key={column.title}><b>{active.filter((item) => column.statuses.includes(item.status)).length}</b>{column.title}</span>)}</div>
      <div className="app-pipeline-board">
        {pipelineColumns.map((column) => {
          const items = active.filter((item) => column.statuses.includes(item.status));
          return <section className="app-pipeline-column" key={column.title}><header><h2>{column.title}</h2><span>{items.length}</span></header><div>{items.map((item) => <article className="app-pipeline-card" key={item.id}><button type="button" onClick={() => selectApplication(item.id)}><span className="app-company-avatar">{item.companyName[0]}</span><p><b>{item.companyName}</b><small>{item.roleTitle}</small></p><ChevronRight size={15} /></button><StatusPill status={item.status} /><p>{item.nextAction}</p><select value={item.status} onChange={(event) => updateStatus(item.id, event.target.value as ApplicationStatus)} aria-label={`Update status ${item.companyName}`}>{applicationStatuses.map((status) => <option key={status} value={status}>{applicationStatusLabels[status]}</option>)}</select></article>)}</div></section>;
        })}
      </div>
    </div>
  );
}

export function CompaniesView() {
  const { applications, companies, selectApplication, setAddOpen } = useDashboard();
  const [query, setQuery] = useState("");
  const derivedCompanies = useMemo(() => {
    const byName = new Map<string, { id: string; name: string; roleTitle: string; status: ApplicationStatus; notes?: string | null; linked: number }>();
    applications.filter((item) => !item.isArchived).forEach((application) => {
      const company = companies.find((item) => item.name === application.companyName);
      const current = byName.get(application.companyName);
      byName.set(application.companyName, {
        id: application.id,
        name: application.companyName,
        roleTitle: application.roleTitle,
        status: application.status,
        notes: company?.whyIApply || company?.companyNotes || application.notes,
        linked: (current?.linked || 0) + 1,
      });
    });
    return Array.from(byName.values()).filter((item) => `${item.name} ${item.roleTitle} ${item.notes || ""}`.toLowerCase().includes(query.toLowerCase()));
  }, [applications, companies, query]);

  return (
    <div className="app-page">
      <PageHeader title="Companies" description="Simpan riset perusahaan, alasan apply, red flags, dan pertanyaan untuk interviewer." action={applications.length ? <button type="button" className="app-button app-button-primary" onClick={() => selectApplication(applications[0].id)}><Plus size={17} />Add Research</button> : <button type="button" className="app-button app-button-primary" onClick={() => setAddOpen(true)}><Plus size={17} />Add Application First</button>} />
      <label className="app-search app-page-search"><Search size={17} /><input placeholder="Cari perusahaan" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      {derivedCompanies.length ? <div className="app-company-grid">{derivedCompanies.map((company) => <button type="button" className="app-company-card" key={company.name} onClick={() => selectApplication(company.id)}><span className="app-company-logo"><Building2 size={20} /></span><div><h2>{company.name}</h2><p>{company.roleTitle}</p></div><StatusPill status={company.status} /><section><b>Why I apply</b><p>{company.notes || "Belum ada catatan riset."}</p></section><small>{company.linked} linked application <ChevronRight size={14} /></small></button>)}</div> : <EmptyState title="Belum ada company research." description="Tambahkan lamaran dulu, lalu simpan riset perusahaan dari application detail." />}
    </div>
  );
}

export function DocumentsView() {
  const { applications, documents, selectApplication, setAddOpen } = useDashboard();
  return (
    <div className="app-page">
      <PageHeader title="Documents" description="Rapikan CV, portfolio, cover letter, sertifikat, dan dokumen yang sering kamu pakai untuk apply." action={applications.length ? <button type="button" className="app-button app-button-primary" onClick={() => selectApplication(applications[0].id)}><Plus size={17} />Add Document</button> : <button type="button" className="app-button app-button-primary" onClick={() => setAddOpen(true)}><Plus size={17} />Add Application First</button>} />
      {documents.length ? <div className="app-document-grid">{documents.map((document) => <article className="app-document-card" key={document.id}><span className="app-document-icon"><FileText size={21} /></span><div><h2>{document.name}</h2><p>{document.type.replaceAll("_", " ")}</p></div><span className={`app-document-status ${document.status.replace("_", "-")}`}>{document.status.replace("_", " ")}</span><footer><span>{document.linkedApplicationIds.length} linked applications</span>{document.url ? <a href={document.url} target="_blank" rel="noreferrer">Open <ChevronRight size={14} /></a> : <button type="button" onClick={() => document.linkedApplicationIds[0] && selectApplication(document.linkedApplicationIds[0])}>Open <ChevronRight size={14} /></button>}</footer></article>)}</div> : <EmptyState title="Belum ada dokumen." description="Dokumen bisa ditautkan dari application detail agar konteks apply tetap rapi." />}
    </div>
  );
}

export function InsightsView() {
  const { applications, events, followUps, interviews, weeklyReviews, saveWeeklyReview, actionPending } = useDashboard();
  const [reflectionNotes, setReflectionNotes] = useState(weeklyReviews[0]?.reflectionNotes || "");
  const [nextWeekFocus, setNextWeekFocus] = useState(weeklyReviews[0]?.nextWeekFocus || "");
  const active = applications.filter((item) => !item.isArchived);
  const sources = Object.entries(active.reduce<Record<string, number>>((acc, item) => { acc[item.source] = (acc[item.source] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]);
  const statusCounts = Object.entries(active.reduce<Record<string, number>>((acc, item) => { const label = applicationStatusLabels[item.status]; acc[label] = (acc[label] || 0) + 1; return acc; }, {}));
  const responses = new Set([
    ...active.filter((item) => ["hr_screening", "interview", "technical_test", "offering", "accepted", "rejected"].includes(item.status)).map((item) => item.id),
    ...events.filter((event) => event.type === "status_changed" && /hr screening|interview|technical test|offering|accepted|rejected/i.test(`${event.title} ${event.description || ""}`)).map((event) => event.applicationId),
  ]).size;
  const followUpsNeeded = followUps.filter((item) => !["completed", "cancelled", "rescheduled"].includes(item.status)).length;
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return (
    <div className="app-page">
      <PageHeader title="Weekly Review" description="Lihat progress apply mingguan dan evaluasi strategi cari kerja kamu." meta={<span>{weekStart.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}–{weekEnd.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>} />
      <div className="app-metric-grid">{[["Applications sent", active.filter((item) => item.appliedAt).length, "tracked"], ["Responses received", responses, "from active process"], ["Interviews scheduled", interviews.length, "total"], ["Follow-ups needed", followUpsNeeded, "need action"]].map(([label, value, helper]) => <section className="app-card" key={label}><p className="app-metric-label">{label}</p><strong className="app-metric-value">{value}</strong><small>{helper}</small></section>)}</div>
      <div className="app-insights-grid">
        <section className="app-card"><SectionTitle>Source Performance</SectionTitle><div className="app-bar-list">{sources.map(([source, count]) => <div key={source}><p><span>{source}</span><b>{count}</b></p><i><span style={{ width: `${Math.min(100, count * 28)}%` }} /></i></div>)}</div></section>
        <section className="app-card"><SectionTitle>Status Distribution</SectionTitle><div className="app-distribution">{statusCounts.map(([status, count]) => <div key={status}><span>{status}</span><b>{count}</b></div>)}</div></section>
        <section className="app-card app-reflection"><p className="app-eyebrow">INSIGHT</p><h2>{responses ? `${responses} applications have received responses.` : "Belum ada response yang tercatat."}</h2><p>Insight ini dihitung dari status dan timeline event, bukan angka hardcoded.</p></section>
        <section className="app-card app-reflection"><p className="app-eyebrow">NEXT WEEK FOCUS</p><h2>Save your weekly review.</h2><textarea rows={3} placeholder="Reflection notes" value={reflectionNotes} onChange={(event) => setReflectionNotes(event.target.value)} /><textarea rows={3} placeholder="Next week focus" value={nextWeekFocus} onChange={(event) => setNextWeekFocus(event.target.value)} /><button type="button" className="app-button app-button-secondary" disabled={actionPending} onClick={() => saveWeeklyReview({ weekStart: weekStart.toISOString().slice(0, 10), weekEnd: weekEnd.toISOString().slice(0, 10), reflectionNotes, nextWeekFocus, insight: responses ? `${responses} responses received.` : "No response yet." })}><Check size={16} />Save Weekly Review</button></section>
      </div>
    </div>
  );
}

export function SettingsView() {
  const { profile, preferences, saveSettings, actionPending } = useDashboard();
  const [name, setName] = useState(profile.name || "");
  const [followUpAfterDays, setFollowUpAfterDays] = useState(preferences.followUpAfterDays);
  const [ghostedAfterDays, setGhostedAfterDays] = useState(preferences.ghostedAfterDays);
  const [notificationEmailEnabled, setNotificationEmailEnabled] = useState(preferences.notificationEmailEnabled);

  return (
    <div className="app-page app-page-settings">
      <PageHeader title="Settings" description="Atur profil, preferensi tracking, dan data akun KareerTrack." />
      <section className="app-settings-group"><header><Settings2 size={18} /><div><h2>Profile</h2><p>Informasi dasar akun kamu.</p></div></header><label><span>Name</span><input value={name} onChange={(event) => setName(event.target.value)} /></label><label><span>Email</span><input type="email" value={profile.email} disabled /></label><button type="button" className="app-button app-button-primary" disabled={actionPending} onClick={() => saveSettings({ name, followUpAfterDays, ghostedAfterDays, notificationEmailEnabled })}>{actionPending ? "Saving..." : "Save Changes"}</button></section>
      <section className="app-settings-group"><header><Target size={18} /><div><h2>Tracking preferences</h2><p>Default untuk follow-up dan tampilan aplikasi.</p></div></header><label><span>Follow up after</span><select value={followUpAfterDays} onChange={(event) => setFollowUpAfterDays(Number(event.target.value))}><option value="5">5 days</option><option value="7">7 days</option><option value="10">10 days</option></select></label><label><span>Ghosted after</span><select value={ghostedAfterDays} onChange={(event) => setGhostedAfterDays(Number(event.target.value))}><option value="14">14 days</option><option value="21">21 days</option><option value="30">30 days</option></select></label><label className="app-toggle-row"><span><b>Email notification</b><small>Siapkan preferensi notifikasi follow-up.</small></span><input type="checkbox" checked={notificationEmailEnabled} onChange={(event) => setNotificationEmailEnabled(event.target.checked)} /></label></section>
    </div>
  );
}
