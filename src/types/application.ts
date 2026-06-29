import type { ApplicationStatus } from "./status";

export type ApplicationPreviewItem = {
  id: string;
  company: string;
  role: string;
  source: string;
  status: ApplicationStatus;
  meta: string;
  nextAction: string;
};

export type DashboardApplication = {
  id: string;
  companyName: string;
  roleTitle: string;
  source: string;
  jobUrl?: string | null;
  jobType?: "internship" | "full_time" | "mt_odp" | "contract" | "freelance" | "part_time" | "other";
  workSystem?: "onsite" | "hybrid" | "remote" | "unknown";
  location?: string | null;
  status: ApplicationStatus;
  attentionStatus?: "follow_up_needed" | "deadline_soon" | "interview_soon" | null;
  priority?: "low" | "medium" | "high" | "dream";
  deadlineAt?: string | null;
  appliedAt?: string | null;
  followUpAt?: string | null;
  lastFollowedUpAt?: string | null;
  nextAction?: string | null;
  notes?: string | null;
  result?: "accepted" | "rejected" | "ghosted" | "withdrawn" | null;
  reflectionNotes?: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FollowUp = {
  id: string;
  applicationId: string;
  dueAt: string;
  completedAt?: string | null;
  status: "scheduled" | "due" | "overdue" | "completed" | "cancelled" | "rescheduled";
  channel?: string | null;
  message?: string | null;
  outcome?: "no_response_yet" | "recruiter_replied" | "interview_scheduled" | "test_scheduled" | "rejected" | "rescheduled" | "marked_ghosted" | "other" | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationEvent = {
  id: string;
  applicationId: string;
  type:
    | "application_created"
    | "application_updated"
    | "status_changed"
    | "follow_up_scheduled"
    | "follow_up_completed"
    | "follow_up_rescheduled"
    | "interview_created"
    | "interview_updated"
    | "interview_completed"
    | "document_attached"
    | "company_research_updated"
    | "result_marked"
    | "application_archived";
  title: string;
  description?: string;
  createdAt: string;
};

export type Interview = {
  id: string;
  applicationId: string;
  stage: "hr_interview" | "user_interview" | "technical_interview" | "case_study" | "group_discussion" | "final_interview" | "offering_discussion" | "other";
  scheduledAt?: string | null;
  locationType?: "online" | "onsite" | "phone" | "unknown";
  interviewerName?: string | null;
  preparationNotes?: string | null;
  questionsToPrepare: string[];
  feedback?: string | null;
  nextStep?: string | null;
  status: "scheduled" | "needs_preparation" | "completed" | "waiting_result" | "cancelled" | "rescheduled";
  createdAt?: string;
  updatedAt?: string;
};

export type Company = {
  id: string;
  name: string;
  industry?: string | null;
  websiteUrl?: string | null;
  source?: string | null;
  whyIApply?: string | null;
  companyNotes?: string | null;
  cultureNotes?: string | null;
  productsServices?: string | null;
  redFlags?: string | null;
  questionsForInterviewer?: string | null;
  recruitmentProcessNotes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DashboardDocument = {
  id: string;
  name: string;
  type: "cv_ats" | "cv_creative" | "portfolio" | "cover_letter" | "transcript" | "certificate" | "linkedin_url" | "github_url" | "behance_url" | "personal_website" | "other";
  status: "ready" | "needs_review" | "draft" | "old_version";
  url?: string | null;
  versionLabel?: string | null;
  notes?: string | null;
  linkedApplicationIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type UserProfile = {
  name: string | null;
  email: string;
};

export type UserPreferences = {
  followUpAfterDays: number;
  ghostedAfterDays: number;
  timezone: string;
  notificationEmailEnabled: boolean;
};

export type WeeklyReview = {
  id: string;
  weekStart: string;
  weekEnd: string;
  insight?: string | null;
  nextWeekFocus?: string | null;
  reflectionNotes?: string | null;
};
