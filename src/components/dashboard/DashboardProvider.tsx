"use client";

import { createContext, useCallback, useContext, useMemo, useState, useTransition } from "react";
import {
  archiveApplicationAction,
  attachDocumentAction,
  completeFollowUpAction,
  createApplicationAction,
  createInterviewAction,
  markFinalResultAction,
  saveSettingsAction,
  saveWeeklyReviewAction,
  setFollowUpAction,
  updateApplicationStatusAction,
  updateCompanyResearchAction,
  type DashboardActionResult,
} from "@/lib/dashboard/actions";
import type { DashboardData } from "@/lib/dashboard/data";
import type {
  ApplicationEvent,
  Company,
  DashboardApplication,
  DashboardDocument,
  FollowUp,
  Interview,
  UserPreferences,
  UserProfile,
  WeeklyReview,
} from "@/types/application";
import type { ApplicationStatus } from "@/types/status";

type NewApplication = Pick<DashboardApplication, "companyName" | "roleTitle" | "source" | "status"> &
  Partial<Pick<DashboardApplication, "jobUrl" | "deadlineAt" | "appliedAt" | "followUpAt" | "nextAction" | "notes">>;

type NewInterview = {
  applicationId: string;
  stage?: Interview["stage"];
  scheduledAt?: string;
  locationType?: Interview["locationType"];
  interviewerName?: string;
  preparationNotes?: string;
  questionsToPrepare?: string[];
  nextStep?: string;
};

type CompanyResearchInput = {
  applicationId: string;
  name?: string;
  industry?: string;
  websiteUrl?: string;
  whyIApply?: string;
  companyNotes?: string;
  cultureNotes?: string;
  redFlags?: string;
  questionsForInterviewer?: string;
};

type DocumentInput = {
  applicationId: string;
  name: string;
  type?: DashboardDocument["type"];
  status?: DashboardDocument["status"];
  url?: string;
  notes?: string;
};

type SettingsInput = {
  name: string;
  followUpAfterDays: number;
  ghostedAfterDays: number;
  notificationEmailEnabled: boolean;
};

type WeeklyReviewInput = {
  weekStart: string;
  weekEnd: string;
  insight?: string;
  nextWeekFocus?: string;
  reflectionNotes?: string;
};

type DashboardContextValue = DashboardData & {
  selectedId: string | null;
  addOpen: boolean;
  toast: string | null;
  actionError: string | null;
  actionPending: boolean;
  selectApplication: (id: string | null) => void;
  setAddOpen: (open: boolean) => void;
  addApplication: (input: NewApplication) => void;
  updateStatus: (id: string, status: ApplicationStatus) => void;
  setFollowUp: (id: string, date: string) => void;
  completeFollowUp: (id: string, outcome?: "no_response_yet" | "recruiter_replied" | "interview_scheduled" | "test_scheduled" | "rejected" | "rescheduled" | "marked_ghosted" | "other") => void;
  archiveApplication: (id: string) => void;
  createInterview: (input: NewInterview) => void;
  updateCompanyResearch: (input: CompanyResearchInput) => void;
  attachDocument: (input: DocumentInput) => void;
  markFinalResult: (input: { applicationId: string; result: "accepted" | "rejected" | "ghosted"; reflectionNotes?: string }) => void;
  saveSettings: (input: SettingsInput) => void;
  saveWeeklyReview: (input: WeeklyReviewInput) => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children, initialData }: { children: React.ReactNode; initialData: DashboardData }) {
  const [profile, setProfile] = useState<UserProfile>(initialData.profile);
  const [preferences, setPreferences] = useState<UserPreferences>(initialData.preferences);
  const [applications, setApplications] = useState<DashboardApplication[]>(initialData.applications);
  const [events, setEvents] = useState<ApplicationEvent[]>(initialData.events);
  const [followUps, setFollowUps] = useState<FollowUp[]>(initialData.followUps);
  const [interviews, setInterviews] = useState<Interview[]>(initialData.interviews);
  const [companies, setCompanies] = useState<Company[]>(initialData.companies);
  const [documents, setDocuments] = useState<DashboardDocument[]>(initialData.documents);
  const [weeklyReviews, setWeeklyReviews] = useState<WeeklyReview[]>(initialData.weeklyReviews);
  const [selectedId, selectApplication] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionPending, startTransition] = useTransition();

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  }, []);

  const applyResult = useCallback((result: DashboardActionResult, options?: { closeAdd?: boolean; closeDetail?: boolean }) => {
    if (!result.ok || !result.data) {
      setActionError(result.message);
      notify(result.message);
      return;
    }

    setActionError(null);
    setProfile(result.data.profile);
    setPreferences(result.data.preferences);
    setApplications(result.data.applications);
    setEvents(result.data.events);
    setFollowUps(result.data.followUps);
    setInterviews(result.data.interviews);
    setCompanies(result.data.companies);
    setDocuments(result.data.documents);
    setWeeklyReviews(result.data.weeklyReviews);
    if (options?.closeAdd) setAddOpen(false);
    if (options?.closeDetail) selectApplication(null);
    notify(result.message);
  }, [notify]);

  const runAction = useCallback((action: () => Promise<DashboardActionResult>, options?: { closeAdd?: boolean; closeDetail?: boolean }) => {
    startTransition(() => {
      action().then((result) => applyResult(result, options)).catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Aksi gagal diproses.";
        setActionError(message);
        notify(message);
      });
    });
  }, [applyResult, notify]);

  const addApplication = useCallback((input: NewApplication) => {
    runAction(() => createApplicationAction(input), { closeAdd: true });
  }, [runAction]);

  const updateStatus = useCallback((id: string, status: ApplicationStatus) => {
    runAction(() => updateApplicationStatusAction(id, status));
  }, [runAction]);

  const setFollowUp = useCallback((id: string, date: string) => {
    runAction(() => setFollowUpAction({ applicationId: id, dueAt: date }));
  }, [runAction]);

  const completeFollowUp = useCallback((id: string, outcome = "no_response_yet") => {
    runAction(() => completeFollowUpAction({ applicationId: id, outcome }));
  }, [runAction]);

  const archiveApplication = useCallback((id: string) => {
    runAction(() => archiveApplicationAction(id), { closeDetail: true });
  }, [runAction]);

  const createInterview = useCallback((input: NewInterview) => {
    runAction(() => createInterviewAction(input));
  }, [runAction]);

  const updateCompanyResearch = useCallback((input: CompanyResearchInput) => {
    runAction(() => updateCompanyResearchAction(input));
  }, [runAction]);

  const attachDocument = useCallback((input: DocumentInput) => {
    runAction(() => attachDocumentAction(input));
  }, [runAction]);

  const markFinalResult = useCallback((input: { applicationId: string; result: "accepted" | "rejected" | "ghosted"; reflectionNotes?: string }) => {
    runAction(() => markFinalResultAction(input));
  }, [runAction]);

  const saveSettings = useCallback((input: SettingsInput) => {
    runAction(() => saveSettingsAction(input));
  }, [runAction]);

  const saveWeeklyReview = useCallback((input: WeeklyReviewInput) => {
    runAction(() => saveWeeklyReviewAction(input));
  }, [runAction]);

  const value = useMemo(() => ({
    profile,
    preferences,
    applications,
    events,
    followUps,
    interviews,
    companies,
    documents,
    weeklyReviews,
    selectedId,
    addOpen,
    toast,
    actionError,
    actionPending,
    selectApplication,
    setAddOpen,
    addApplication,
    updateStatus,
    setFollowUp,
    completeFollowUp,
    archiveApplication,
    createInterview,
    updateCompanyResearch,
    attachDocument,
    markFinalResult,
    saveSettings,
    saveWeeklyReview,
  }), [
    profile,
    preferences,
    applications,
    events,
    followUps,
    interviews,
    companies,
    documents,
    weeklyReviews,
    selectedId,
    addOpen,
    toast,
    actionError,
    actionPending,
    addApplication,
    updateStatus,
    setFollowUp,
    completeFollowUp,
    archiveApplication,
    createInterview,
    updateCompanyResearch,
    attachDocument,
    markFinalResult,
    saveSettings,
    saveWeeklyReview,
  ]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used inside DashboardProvider");
  return context;
}
