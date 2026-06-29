"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { seedApplications, seedEvents, seedInterviews } from "@/content/dashboard-data";
import { applicationStatusLabels } from "@/lib/status";
import type { ApplicationEvent, DashboardApplication, Interview } from "@/types/application";
import type { ApplicationStatus } from "@/types/status";

type NewApplication = Pick<DashboardApplication, "companyName" | "roleTitle" | "source" | "status"> &
  Partial<Pick<DashboardApplication, "jobUrl" | "deadlineAt" | "appliedAt" | "followUpAt" | "nextAction" | "notes">>;

type DashboardContextValue = {
  applications: DashboardApplication[];
  events: ApplicationEvent[];
  interviews: Interview[];
  selectedId: string | null;
  addOpen: boolean;
  toast: string | null;
  selectApplication: (id: string | null) => void;
  setAddOpen: (open: boolean) => void;
  addApplication: (input: NewApplication) => void;
  updateStatus: (id: string, status: ApplicationStatus) => void;
  setFollowUp: (id: string, date: string) => void;
  completeFollowUp: (id: string) => void;
  archiveApplication: (id: string) => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);
const STORAGE_KEY = "kareertrack-dashboard-applications";

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [applications, setApplications] = useState(seedApplications);
  const [events, setEvents] = useState(seedEvents);
  const [interviews] = useState(seedInterviews);
  const [selectedId, selectApplication] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  }, [applications]);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  }, []);

  const addEvent = useCallback((event: Omit<ApplicationEvent, "id" | "createdAt">) => {
    setEvents((current) => [{ ...event, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...current]);
  }, []);

  const addApplication = useCallback((input: NewApplication) => {
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    setApplications((current) => [{
      ...input,
      id,
      jobUrl: input.jobUrl || null,
      deadlineAt: input.deadlineAt || null,
      appliedAt: input.appliedAt || null,
      followUpAt: input.followUpAt || null,
      nextAction: input.nextAction || "Review requirements",
      notes: input.notes || null,
      isArchived: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    }, ...current]);
    addEvent({ applicationId: id, type: "application_created", title: "Application created", description: `${input.companyName} · ${input.roleTitle}` });
    setAddOpen(false);
    notify("Lamaran berhasil ditambahkan.");
  }, [addEvent, notify]);

  const updateStatus = useCallback((id: string, status: ApplicationStatus) => {
    let previous: ApplicationStatus = "saved";
    setApplications((current) => current.map((item) => {
      if (item.id !== id) return item;
      previous = item.status;
      return {
        ...item,
        status,
        result: ["accepted", "rejected", "ghosted"].includes(status) ? status as "accepted" | "rejected" | "ghosted" : item.result,
        followUpAt: ["accepted", "rejected", "ghosted"].includes(status) ? null : item.followUpAt,
        attentionStatus: status === "follow_up_needed" ? "follow_up_needed" : status === "waiting_response" ? item.attentionStatus : null,
        updatedAt: new Date().toISOString(),
      };
    }));
    addEvent({ applicationId: id, type: "status_changed", title: `Status changed to ${applicationStatusLabels[status]}`, description: `${applicationStatusLabels[previous]} → ${applicationStatusLabels[status]}` });
    notify("Status lamaran berhasil diperbarui.");
  }, [addEvent, notify]);

  const setFollowUp = useCallback((id: string, date: string) => {
    setApplications((current) => current.map((item) => item.id === id ? { ...item, followUpAt: date, nextAction: "Follow-up scheduled", attentionStatus: "follow_up_needed", updatedAt: new Date().toISOString() } : item));
    addEvent({ applicationId: id, type: "follow_up_scheduled", title: "Follow-up scheduled", description: new Date(date).toLocaleDateString("id-ID", { dateStyle: "medium" }) });
    notify("Follow-up berhasil dijadwalkan.");
  }, [addEvent, notify]);

  const completeFollowUp = useCallback((id: string) => {
    setApplications((current) => current.map((item) => item.id === id ? { ...item, followUpAt: null, lastFollowedUpAt: new Date().toISOString(), attentionStatus: null, nextAction: "Wait for response", updatedAt: new Date().toISOString() } : item));
    addEvent({ applicationId: id, type: "follow_up_completed", title: "Follow-up completed", description: "Menunggu respon berikutnya." });
    notify("Follow-up ditandai selesai.");
  }, [addEvent, notify]);

  const archiveApplication = useCallback((id: string) => {
    setApplications((current) => current.map((item) => item.id === id ? { ...item, isArchived: true, updatedAt: new Date().toISOString() } : item));
    addEvent({ applicationId: id, type: "application_archived", title: "Application archived" });
    selectApplication(null);
    notify("Lamaran dipindahkan ke arsip.");
  }, [addEvent, notify]);

  const value = useMemo(() => ({
    applications, events, interviews, selectedId, addOpen, toast, selectApplication, setAddOpen,
    addApplication, updateStatus, setFollowUp, completeFollowUp, archiveApplication,
  }), [applications, events, interviews, selectedId, addOpen, toast, addApplication, updateStatus, setFollowUp, completeFollowUp, archiveApplication]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used inside DashboardProvider");
  return context;
}
