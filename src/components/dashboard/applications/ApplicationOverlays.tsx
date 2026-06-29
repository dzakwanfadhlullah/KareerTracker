"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Archive, CalendarPlus, ExternalLink, FilePlus, MessageSquareText, Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { applicationStatuses, applicationStatusLabels } from "@/lib/status";
import type { ApplicationStatus } from "@/types/status";
import { useDashboard } from "../DashboardProvider";
import { StatusPill } from "../status/StatusPill";

const applicationSchema = z.object({
  companyName: z.string().min(1, "Nama perusahaan perlu diisi."),
  roleTitle: z.string().min(1, "Posisi perlu diisi."),
  source: z.string().min(1, "Sumber lowongan perlu dipilih."),
  status: z.enum(applicationStatuses as [ApplicationStatus, ...ApplicationStatus[]]),
  jobUrl: z.union([z.url("Link lowongan belum valid."), z.literal("")]).optional(),
  followUpAt: z.string().optional(),
  nextAction: z.string().optional(),
  notes: z.string().optional(),
});
type ApplicationForm = z.infer<typeof applicationSchema>;

export function AddApplicationDialog() {
  const { addOpen, setAddOpen, addApplication, actionPending } = useDashboard();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { status: "saved", source: "MagangKareer" },
  });

  useEffect(() => {
    if (!addOpen) reset({ status: "saved", source: "MagangKareer" });
  }, [addOpen, reset]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && setAddOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [setAddOpen]);
  if (!addOpen) return null;

  return (
    <div className="app-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setAddOpen(false)}>
      <section className="app-modal" role="dialog" aria-modal="true" aria-labelledby="add-application-title">
        <header><div><h2 id="add-application-title">Add Application</h2><p>Tambahkan saved opportunity atau lamaran yang sedang berjalan.</p></div><button type="button" aria-label="Tutup" onClick={() => setAddOpen(false)}><X size={19} /></button></header>
        <form onSubmit={handleSubmit(addApplication)}>
          <div className="app-form-grid">
            <label><span>Company</span><input autoFocus placeholder="Tokopedia" {...register("companyName")} />{errors.companyName && <small>{errors.companyName.message}</small>}</label>
            <label><span>Role</span><input placeholder="Product Analyst Intern" {...register("roleTitle")} />{errors.roleTitle && <small>{errors.roleTitle.message}</small>}</label>
            <label><span>Source</span><select {...register("source")}>{["MagangKareer", "LinkedIn", "Glints", "Kalibrr", "JobStreet", "Company Website", "Instagram", "Referral", "Campus Career Center", "Other"].map((source) => <option key={source}>{source}</option>)}</select></label>
            <label><span>Status</span><select {...register("status")}>{applicationStatuses.map((status) => <option value={status} key={status}>{applicationStatusLabels[status]}</option>)}</select></label>
            <label className="app-form-full"><span>Job Link</span><input placeholder="https://..." {...register("jobUrl")} />{errors.jobUrl && <small>{errors.jobUrl.message}</small>}</label>
            <label><span>Follow-Up Date</span><input type="date" {...register("followUpAt")} /></label>
            <label className="app-form-full"><span>Next Action</span><input placeholder="Review requirements" {...register("nextAction")} /></label>
            <label className="app-form-full"><span>Notes</span><textarea rows={3} placeholder="Catatan penting tentang role ini..." {...register("notes")} /></label>
          </div>
          <footer><button type="button" className="app-button app-button-secondary" onClick={() => setAddOpen(false)}>Cancel</button><button type="submit" className="app-button app-button-primary" disabled={actionPending}>{actionPending ? "Saving..." : "Save Application"}</button></footer>
        </form>
      </section>
    </div>
  );
}

export function ApplicationDetailDrawer() {
  const {
    applications,
    events,
    followUps,
    interviews,
    companies,
    documents,
    selectedId,
    selectApplication,
    updateStatus,
    setFollowUp,
    archiveApplication,
    createInterview,
    updateCompanyResearch,
    attachDocument,
    markFinalResult,
    actionPending,
  } = useDashboard();
  const application = applications.find((item) => item.id === selectedId);
  const timeline = useMemo(() => events.filter((item) => item.applicationId === selectedId), [events, selectedId]);
  const applicationInterviews = interviews.filter((item) => item.applicationId === selectedId);
  const activeFollowUp = followUps.find((item) => item.applicationId === selectedId && !["completed", "cancelled", "rescheduled"].includes(item.status));
  const company = companies.find((item) => item.name === application?.companyName);
  const linkedDocuments = documents.filter((document) => document.linkedApplicationIds.includes(selectedId || ""));
  const [followDate, setFollowDate] = useState("");
  const [researchNotes, setResearchNotes] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [finalResult, setFinalResult] = useState<"accepted" | "rejected" | "ghosted">("rejected");
  const [reflectionNotes, setReflectionNotes] = useState("");

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && selectApplication(null);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [selectApplication]);
  if (!application) return null;

  return (
    <div className="app-drawer-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && selectApplication(null)}>
      <aside className="app-drawer" role="dialog" aria-modal="true" aria-labelledby="application-detail-title">
        <header className="app-drawer-header"><div><p>{application.source}</p><h2 id="application-detail-title">{application.companyName}</h2><span>{application.roleTitle}</span></div><button type="button" aria-label="Tutup detail" onClick={() => selectApplication(null)}><X size={20} /></button></header>
        <div className="app-drawer-body">
          <section className="app-detail-highlight">
            <div><StatusPill status={application.status} /><select aria-label="Update status" value={application.status} onChange={(event) => updateStatus(application.id, event.target.value as ApplicationStatus)}>{applicationStatuses.map((status) => <option key={status} value={status}>{applicationStatusLabels[status]}</option>)}</select></div>
            <p><b>Next action</b>{application.nextAction || "Belum ada next action"}</p>
          </section>
          <DetailSection title="Job Details">
            <dl className="app-detail-grid"><div><dt>Source</dt><dd>{application.source}</dd></div><div><dt>Work system</dt><dd>{application.workSystem || "Unknown"}</dd></div><div><dt>Location</dt><dd>{application.location || "Belum diisi"}</dd></div><div><dt>Deadline</dt><dd>{application.deadlineAt ? new Date(application.deadlineAt).toLocaleDateString("id-ID", { dateStyle: "medium" }) : "Belum diatur"}</dd></div></dl>
            {application.jobUrl && <a href={application.jobUrl} target="_blank" rel="noreferrer">Buka job link <ExternalLink size={14} /></a>}
          </DetailSection>
          <DetailSection title="Follow-Up">
            <div className="app-inline-form"><CalendarPlus size={17} /><input type="date" value={followDate} onChange={(event) => setFollowDate(event.target.value)} /><button type="button" onClick={() => followDate && setFollowUp(application.id, new Date(`${followDate}T09:00:00`).toISOString())}>Save Follow-Up</button></div>
            {(activeFollowUp || application.followUpAt) && <p className="app-detail-note">Dijadwalkan {new Date(activeFollowUp?.dueAt || application.followUpAt || "").toLocaleDateString("id-ID", { dateStyle: "full" })}</p>}
          </DetailSection>
          <DetailSection title="Interview Notes">
            {applicationInterviews.length ? applicationInterviews.map((interview) => <div className="app-detail-note" key={interview.id}><b>{interview.stage.replaceAll("_", " ")}</b><p>{interview.preparationNotes || "Belum ada catatan persiapan."}</p>{interview.questionsToPrepare.length > 0 && <ul>{interview.questionsToPrepare.map((question) => <li key={question}>{question}</li>)}</ul>}</div>) : <p className="app-muted">Belum ada catatan interview.</p>}
            <button type="button" className="app-button app-button-secondary" disabled={actionPending} onClick={() => createInterview({ applicationId: application.id, stage: "hr_interview", scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), preparationNotes: "Prepare STAR answers and company context.", questionsToPrepare: ["Ceritakan pengalaman paling relevan.", "Kenapa tertarik role ini?", "Apa pertanyaan untuk interviewer?"], nextStep: "Review company research" })}><MessageSquareText size={16} />Add Interview</button>
          </DetailSection>
          <DetailSection title="Company Research">
            <div className="app-detail-note"><b>Why I apply</b><p>{company?.whyIApply || application.notes || "Belum ada riset perusahaan."}</p></div>
            <div className="app-inline-form app-inline-form-stack"><textarea rows={3} placeholder="Tambahkan alasan apply, catatan culture, red flags, atau pertanyaan..." value={researchNotes} onChange={(event) => setResearchNotes(event.target.value)} /><button type="button" disabled={actionPending || !researchNotes.trim()} onClick={() => updateCompanyResearch({ applicationId: application.id, name: application.companyName, whyIApply: researchNotes, companyNotes: researchNotes })}><Save size={15} />Save Research</button></div>
          </DetailSection>
          <DetailSection title="Documents Used">
            {linkedDocuments.length ? <div className="app-detail-note">{linkedDocuments.map((document) => <p key={document.id}><b>{document.name}</b> {document.url && <a href={document.url} target="_blank" rel="noreferrer">Open</a>}</p>)}</div> : <p className="app-muted">Belum ada dokumen yang ditautkan.</p>}
            <div className="app-inline-form app-inline-form-stack"><input placeholder="Nama dokumen, contoh: CV ATS Product" value={documentName} onChange={(event) => setDocumentName(event.target.value)} /><input placeholder="https://..." value={documentUrl} onChange={(event) => setDocumentUrl(event.target.value)} /><button type="button" disabled={actionPending || !documentName.trim()} onClick={() => { attachDocument({ applicationId: application.id, name: documentName, url: documentUrl, type: "cv_ats", status: "ready" }); setDocumentName(""); setDocumentUrl(""); }}><FilePlus size={15} />Attach Document</button></div>
          </DetailSection>
          <DetailSection title="Activity Timeline">
            <div className="app-timeline">{timeline.length ? timeline.map((event) => <div key={event.id}><i /><p><b>{event.title}</b><span>{event.description}</span><small>{new Date(event.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}</small></p></div>) : <p className="app-muted">Belum ada aktivitas.</p>}</div>
          </DetailSection>
          <DetailSection title="Result and Reflection">
            {application.reflectionNotes && <p className="app-detail-note">{application.reflectionNotes}</p>}
            <div className="app-inline-form app-inline-form-stack"><select value={finalResult} onChange={(event) => setFinalResult(event.target.value as "accepted" | "rejected" | "ghosted")}><option value="accepted">accepted</option><option value="rejected">rejected</option><option value="ghosted">ghosted</option></select><textarea rows={3} placeholder="Refleksi singkat: apa yang bisa diperbaiki?" value={reflectionNotes} onChange={(event) => setReflectionNotes(event.target.value)} /><button type="button" disabled={actionPending} onClick={() => markFinalResult({ applicationId: application.id, result: finalResult, reflectionNotes })}>Mark Final Result</button></div>
          </DetailSection>
        </div>
        <footer className="app-drawer-footer"><button type="button" className="app-button app-button-secondary" disabled={actionPending} onClick={() => createInterview({ applicationId: application.id, stage: "hr_interview", scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), preparationNotes: "Prepare interview notes." })}><MessageSquareText size={16} />Add Interview</button><button type="button" className="app-button app-button-ghost" disabled={actionPending} onClick={() => archiveApplication(application.id)}><Archive size={16} />Archive</button></footer>
      </aside>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="app-detail-section"><h3>{title}</h3>{children}</section>;
}
