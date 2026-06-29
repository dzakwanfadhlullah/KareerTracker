"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Archive, CalendarPlus, ExternalLink, MessageSquareText, X } from "lucide-react";
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
  nextAction: z.string().optional(),
  notes: z.string().optional(),
});
type ApplicationForm = z.infer<typeof applicationSchema>;

export function AddApplicationDialog() {
  const { addOpen, setAddOpen, addApplication } = useDashboard();
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
            <label className="app-form-full"><span>Next Action</span><input placeholder="Review requirements" {...register("nextAction")} /></label>
            <label className="app-form-full"><span>Notes</span><textarea rows={3} placeholder="Catatan penting tentang role ini..." {...register("notes")} /></label>
          </div>
          <footer><button type="button" className="app-button app-button-secondary" onClick={() => setAddOpen(false)}>Cancel</button><button type="submit" className="app-button app-button-primary">Save Application</button></footer>
        </form>
      </section>
    </div>
  );
}

export function ApplicationDetailDrawer() {
  const { applications, events, interviews, selectedId, selectApplication, updateStatus, setFollowUp, archiveApplication } = useDashboard();
  const application = applications.find((item) => item.id === selectedId);
  const timeline = useMemo(() => events.filter((item) => item.applicationId === selectedId), [events, selectedId]);
  const interview = interviews.find((item) => item.applicationId === selectedId);
  const [followDate, setFollowDate] = useState("");

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
            {application.followUpAt && <p className="app-detail-note">Dijadwalkan {new Date(application.followUpAt).toLocaleDateString("id-ID", { dateStyle: "full" })}</p>}
          </DetailSection>
          <DetailSection title="Interview Notes">
            {interview ? <div className="app-detail-note"><b>{interview.stage.replaceAll("_", " ")}</b><p>{interview.preparationNotes}</p><ul>{interview.questionsToPrepare.map((question) => <li key={question}>{question}</li>)}</ul></div> : <p className="app-muted">Belum ada catatan interview.</p>}
          </DetailSection>
          <DetailSection title="Company Research"><div className="app-detail-note"><b>Why I apply</b><p>{application.notes || "Belum ada riset perusahaan."}</p></div></DetailSection>
          <DetailSection title="Documents Used"><p className="app-muted">Belum ada dokumen yang ditautkan.</p></DetailSection>
          <DetailSection title="Activity Timeline">
            <div className="app-timeline">{timeline.length ? timeline.map((event) => <div key={event.id}><i /><p><b>{event.title}</b><span>{event.description}</span><small>{new Date(event.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}</small></p></div>) : <p className="app-muted">Belum ada aktivitas.</p>}</div>
          </DetailSection>
          {application.reflectionNotes && <DetailSection title="Result and Reflection"><p className="app-detail-note">{application.reflectionNotes}</p></DetailSection>}
        </div>
        <footer className="app-drawer-footer"><button type="button" className="app-button app-button-secondary"><MessageSquareText size={16} />Add Interview</button><button type="button" className="app-button app-button-ghost" onClick={() => archiveApplication(application.id)}><Archive size={16} />Archive</button></footer>
      </aside>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="app-detail-section"><h3>{title}</h3>{children}</section>;
}
