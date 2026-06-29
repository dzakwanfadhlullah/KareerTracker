import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
import type { ApplicationStatus, AttentionType } from "@/types/status";

export type DashboardData = {
  profile: UserProfile;
  preferences: UserPreferences;
  applications: DashboardApplication[];
  events: ApplicationEvent[];
  followUps: FollowUp[];
  interviews: Interview[];
  companies: Company[];
  documents: DashboardDocument[];
  weeklyReviews: WeeklyReview[];
};

type User = { id: string; email?: string };

type ApplicationRow = {
  id: string;
  company_id: string | null;
  company_name: string;
  role_title: string;
  source: string | null;
  job_url: string | null;
  job_type: DashboardApplication["jobType"] | null;
  work_system: DashboardApplication["workSystem"] | null;
  location: string | null;
  status: ApplicationStatus;
  attention_status: AttentionType | null;
  priority: DashboardApplication["priority"] | null;
  deadline_at: string | null;
  applied_at: string | null;
  follow_up_at: string | null;
  last_followed_up_at: string | null;
  next_action: string | null;
  notes: string | null;
  result: DashboardApplication["result"] | null;
  reflection_notes: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

type EventRow = {
  id: string;
  application_id: string;
  event_type: ApplicationEvent["type"];
  title: string;
  description: string | null;
  created_at: string;
};

type FollowUpRow = {
  id: string;
  application_id: string;
  due_at: string;
  completed_at: string | null;
  status: FollowUp["status"];
  channel: string | null;
  message: string | null;
  outcome: FollowUp["outcome"];
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type InterviewRow = {
  id: string;
  application_id: string;
  stage: Interview["stage"];
  scheduled_at: string | null;
  location_type: Interview["locationType"] | null;
  interviewer_name: string | null;
  preparation_notes: string | null;
  questions_to_prepare: string[] | null;
  feedback: string | null;
  next_step: string | null;
  status: Interview["status"];
  created_at: string;
  updated_at: string;
};

type CompanyRow = {
  id: string;
  name: string;
  industry: string | null;
  website_url: string | null;
  source: string | null;
  why_i_apply: string | null;
  company_notes: string | null;
  culture_notes: string | null;
  products_services: string | null;
  red_flags: string | null;
  questions_for_interviewer: string | null;
  recruitment_process_notes: string | null;
  created_at: string;
  updated_at: string;
};

type DocumentRow = {
  id: string;
  name: string;
  type: DashboardDocument["type"];
  status: DashboardDocument["status"];
  url: string | null;
  version_label: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type ApplicationDocumentRow = {
  application_id: string;
  document_id: string;
};

type WeeklyReviewRow = {
  id: string;
  week_start: string;
  week_end: string;
  insight: string | null;
  next_week_focus: string | null;
  reflection_notes: string | null;
};

function rows<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function mapApplication(row: ApplicationRow): DashboardApplication {
  return {
    id: row.id,
    companyName: row.company_name,
    roleTitle: row.role_title,
    source: row.source || "Other",
    jobUrl: row.job_url,
    jobType: row.job_type || undefined,
    workSystem: row.work_system || undefined,
    location: row.location,
    status: row.status,
    attentionStatus: row.attention_status,
    priority: row.priority || undefined,
    deadlineAt: row.deadline_at,
    appliedAt: row.applied_at,
    followUpAt: row.follow_up_at,
    lastFollowedUpAt: row.last_followed_up_at,
    nextAction: row.next_action,
    notes: row.notes,
    result: row.result,
    reflectionNotes: row.reflection_notes,
    isArchived: row.is_archived,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapEvent(row: EventRow): ApplicationEvent {
  return {
    id: row.id,
    applicationId: row.application_id,
    type: row.event_type,
    title: row.title,
    description: row.description || undefined,
    createdAt: row.created_at,
  };
}

function mapFollowUp(row: FollowUpRow): FollowUp {
  return {
    id: row.id,
    applicationId: row.application_id,
    dueAt: row.due_at,
    completedAt: row.completed_at,
    status: row.status,
    channel: row.channel,
    message: row.message,
    outcome: row.outcome,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapInterview(row: InterviewRow): Interview {
  return {
    id: row.id,
    applicationId: row.application_id,
    stage: row.stage,
    scheduledAt: row.scheduled_at,
    locationType: row.location_type || "unknown",
    interviewerName: row.interviewer_name,
    preparationNotes: row.preparation_notes,
    questionsToPrepare: row.questions_to_prepare || [],
    feedback: row.feedback,
    nextStep: row.next_step,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCompany(row: CompanyRow): Company {
  return {
    id: row.id,
    name: row.name,
    industry: row.industry,
    websiteUrl: row.website_url,
    source: row.source,
    whyIApply: row.why_i_apply,
    companyNotes: row.company_notes,
    cultureNotes: row.culture_notes,
    productsServices: row.products_services,
    redFlags: row.red_flags,
    questionsForInterviewer: row.questions_for_interviewer,
    recruitmentProcessNotes: row.recruitment_process_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDocument(row: DocumentRow, links: ApplicationDocumentRow[]): DashboardDocument {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    status: row.status,
    url: row.url,
    versionLabel: row.version_label,
    notes: row.notes,
    linkedApplicationIds: links.filter((link) => link.document_id === row.id).map((link) => link.application_id),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function requireUser(): Promise<User> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return { id: user.id, email: user.email || undefined };
}

export async function ensureUserRecords(user: User) {
  const supabase = await createSupabaseServerClient();
  const email = user.email || "";

  const { data: profile } = await supabase
    .from("profiles")
    .select("name,email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.from("profiles").insert({
      user_id: user.id,
      name: email ? email.split("@")[0] : "KareerTrack User",
      email,
    });
  }

  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!preferences) {
    await supabase.from("user_preferences").insert({
      user_id: user.id,
      timezone: "Asia/Jakarta",
      follow_up_after_days: 7,
      ghosted_after_days: 21,
      default_view: "today",
    });
  }
}

export async function loadDashboardData(): Promise<DashboardData> {
  const user = await requireUser();
  await ensureUserRecords(user);

  const supabase = await createSupabaseServerClient();
  const [
    profileResult,
    preferencesResult,
    applicationsResult,
    eventsResult,
    followUpsResult,
    interviewsResult,
    companiesResult,
    documentsResult,
    applicationDocumentsResult,
    weeklyReviewsResult,
  ] = await Promise.all([
    supabase.from("profiles").select("name,email").eq("user_id", user.id).maybeSingle(),
    supabase.from("user_preferences").select("follow_up_after_days,ghosted_after_days,timezone,notification_email_enabled").eq("user_id", user.id).maybeSingle(),
    supabase.from("applications").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
    supabase.from("application_events").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("follow_ups").select("*").eq("user_id", user.id).order("due_at", { ascending: true }),
    supabase.from("interviews").select("*").eq("user_id", user.id).order("scheduled_at", { ascending: true, nullsFirst: false }),
    supabase.from("companies").select("*").eq("user_id", user.id).is("archived_at", null).order("updated_at", { ascending: false }),
    supabase.from("documents").select("*").eq("user_id", user.id).is("archived_at", null).order("updated_at", { ascending: false }),
    supabase.from("application_documents").select("application_id,document_id").eq("user_id", user.id),
    supabase.from("weekly_reviews").select("*").eq("user_id", user.id).order("week_start", { ascending: false }),
  ]);

  if (applicationsResult.error) throw new Error(applicationsResult.error.message);
  if (eventsResult.error) throw new Error(eventsResult.error.message);

  const profileRow = profileResult.data as { name: string | null; email: string } | null;
  const preferencesRow = preferencesResult.data as {
    follow_up_after_days: number;
    ghosted_after_days: number;
    timezone: string;
    notification_email_enabled: boolean;
  } | null;
  const links = rows<ApplicationDocumentRow>(applicationDocumentsResult.data);

  return {
    profile: {
      name: profileRow?.name || (user.email ? user.email.split("@")[0] : "KareerTrack User"),
      email: profileRow?.email || user.email || "",
    },
    preferences: {
      followUpAfterDays: preferencesRow?.follow_up_after_days ?? 7,
      ghostedAfterDays: preferencesRow?.ghosted_after_days ?? 21,
      timezone: preferencesRow?.timezone || "Asia/Jakarta",
      notificationEmailEnabled: preferencesRow?.notification_email_enabled ?? true,
    },
    applications: rows<ApplicationRow>(applicationsResult.data).map(mapApplication),
    events: rows<EventRow>(eventsResult.data).map(mapEvent),
    followUps: rows<FollowUpRow>(followUpsResult.data).map(mapFollowUp),
    interviews: rows<InterviewRow>(interviewsResult.data).map(mapInterview),
    companies: rows<CompanyRow>(companiesResult.data).map(mapCompany),
    documents: rows<DocumentRow>(documentsResult.data).map((document) => mapDocument(document, links)),
    weeklyReviews: rows<WeeklyReviewRow>(weeklyReviewsResult.data).map((review) => ({
      id: review.id,
      weekStart: review.week_start,
      weekEnd: review.week_end,
      insight: review.insight,
      nextWeekFocus: review.next_week_focus,
      reflectionNotes: review.reflection_notes,
    })),
  };
}
