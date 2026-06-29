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
};
