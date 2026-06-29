"use client";

import { Building2, Check, ChevronRight, FileText, Plus, Search, Settings2, Target } from "lucide-react";
import { documents } from "@/content/dashboard-data";
import { applicationStatuses, applicationStatusLabels } from "@/lib/status";
import type { ApplicationStatus } from "@/types/status";
import { useDashboard } from "../DashboardProvider";
import { PageHeader, SectionTitle } from "../layout/DashboardUI";
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
  const { applications, selectApplication } = useDashboard();
  const companies = Array.from(new Map(applications.map((item) => [item.companyName, item])).values());
  return (
    <div className="app-page">
      <PageHeader title="Companies" description="Simpan riset perusahaan, alasan apply, red flags, dan pertanyaan untuk interviewer." action={<button type="button" className="app-button app-button-primary"><Plus size={17} />Add Research</button>} />
      <label className="app-search app-page-search"><Search size={17} /><input placeholder="Cari perusahaan" /></label>
      <div className="app-company-grid">{companies.map((company) => <button type="button" className="app-company-card" key={company.id} onClick={() => selectApplication(company.id)}><span className="app-company-logo"><Building2 size={20} /></span><div><h2>{company.companyName}</h2><p>{company.roleTitle}</p></div><StatusPill status={company.status} /><section><b>Why I apply</b><p>{company.notes || "Belum ada catatan riset."}</p></section><small>{applications.filter((item) => item.companyName === company.companyName).length} linked application <ChevronRight size={14} /></small></button>)}</div>
    </div>
  );
}

export function DocumentsView() {
  return (
    <div className="app-page">
      <PageHeader title="Documents" description="Rapikan CV, portfolio, cover letter, sertifikat, dan dokumen yang sering kamu pakai untuk apply." action={<button type="button" className="app-button app-button-primary"><Plus size={17} />Add Document</button>} />
      <div className="app-document-grid">{documents.map((document) => <article className="app-document-card" key={document.id}><span className="app-document-icon"><FileText size={21} /></span><div><h2>{document.name}</h2><p>{document.type}</p></div><span className={`app-document-status ${document.status.replace(" ", "-")}`}>{document.status}</span><footer><span>{document.linked} linked applications</span><button type="button">Open <ChevronRight size={14} /></button></footer></article>)}</div>
    </div>
  );
}

export function InsightsView() {
  const { applications } = useDashboard();
  const active = applications.filter((item) => !item.isArchived);
  const sources = Object.entries(active.reduce<Record<string, number>>((acc, item) => { acc[item.source] = (acc[item.source] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]);
  const statusCounts = Object.entries(active.reduce<Record<string, number>>((acc, item) => { const label = applicationStatusLabels[item.status]; acc[label] = (acc[label] || 0) + 1; return acc; }, {}));
  return (
    <div className="app-page">
      <PageHeader title="Weekly Review" description="Lihat progress apply mingguan dan evaluasi strategi cari kerja kamu." meta={<span>22–28 Juni 2026</span>} />
      <div className="app-metric-grid">{[["Applications sent", 12, "this week"], ["Responses received", 4, "from active process"], ["Interviews scheduled", 2, "this week"], ["Follow-ups needed", active.filter((item) => item.attentionStatus).length, "need action"]].map(([label, value, helper]) => <section className="app-card" key={label}><p className="app-metric-label">{label}</p><strong className="app-metric-value">{value}</strong><small>{helper}</small></section>)}</div>
      <div className="app-insights-grid">
        <section className="app-card"><SectionTitle>Source Performance</SectionTitle><div className="app-bar-list">{sources.map(([source, count]) => <div key={source}><p><span>{source}</span><b>{count}</b></p><i><span style={{ width: `${Math.min(100, count * 28)}%` }} /></i></div>)}</div></section>
        <section className="app-card"><SectionTitle>Status Distribution</SectionTitle><div className="app-distribution">{statusCounts.map(([status, count]) => <div key={status}><span>{status}</span><b>{count}</b></div>)}</div></section>
        <section className="app-card app-reflection"><p className="app-eyebrow">INSIGHT</p><h2>Most responses came from LinkedIn and referrals.</h2><p>Lamaran dengan dokumen yang disesuaikan mendapat respon lebih cepat minggu ini.</p></section>
        <section className="app-card app-reflection"><p className="app-eyebrow">NEXT WEEK FOCUS</p><h2>Update CV untuk role product dan data.</h2><p>Follow up 3 waiting applications sebelum menambah lamaran baru.</p><button type="button" className="app-button app-button-secondary"><Check size={16} />Save Weekly Review</button></section>
      </div>
    </div>
  );
}

export function SettingsView() {
  return (
    <div className="app-page app-page-settings">
      <PageHeader title="Settings" description="Atur profil, preferensi tracking, dan data akun KareerTrack." />
      <section className="app-settings-group"><header><Settings2 size={18} /><div><h2>Profile</h2><p>Informasi dasar akun kamu.</p></div></header><label><span>Name</span><input defaultValue="Mara" /></label><label><span>Email</span><input type="email" defaultValue="mara@email.com" disabled /></label><button type="button" className="app-button app-button-primary">Save Changes</button></section>
      <section className="app-settings-group"><header><Target size={18} /><div><h2>Tracking preferences</h2><p>Default untuk follow-up dan tampilan aplikasi.</p></div></header><label><span>Follow up after</span><select defaultValue="7"><option value="5">5 days</option><option value="7">7 days</option><option value="10">10 days</option></select></label><label className="app-toggle-row"><span><b>Show archived applications</b><small>Tampilkan lamaran yang sudah diarsipkan.</small></span><input type="checkbox" /></label></section>
    </div>
  );
}
