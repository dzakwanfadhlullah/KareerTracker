"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { applicationStatuses, applicationStatusLabels, finalStatuses } from "@/lib/status";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DashboardData } from "./data";
import { loadDashboardData, requireUser } from "./data";
import type { ApplicationEvent, DashboardDocument, Interview } from "@/types/application";
import type { ApplicationStatus } from "@/types/status";

export type DashboardActionResult = {
  ok: boolean;
  message: string;
  data?: DashboardData;
};

const applicationStatusSchema = z.enum(applicationStatuses as [ApplicationStatus, ...ApplicationStatus[]]);
const uuidSchema = z.string().uuid("ID tidak valid.");
const optionalUrl = z.union([z.url("URL belum valid."), z.literal("")]).optional();

const createApplicationSchema = z.object({
  companyName: z.string().trim().min(1, "Nama perusahaan perlu diisi.").max(120),
  roleTitle: z.string().trim().min(1, "Posisi perlu diisi.").max(160),
  source: z.string().trim().min(1, "Sumber lowongan perlu dipilih.").max(80),
  status: applicationStatusSchema.default("saved"),
  jobUrl: optionalUrl,
  deadlineAt: z.string().optional(),
  appliedAt: z.string().optional(),
  followUpAt: z.string().optional(),
  nextAction: z.string().max(240).optional(),
  notes: z.string().max(5000).optional(),
});

const setFollowUpSchema = z.object({
  applicationId: uuidSchema,
  dueAt: z.string().min(1, "Tanggal follow-up perlu diisi."),
  channel: z.string().max(80).optional(),
  message: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
});

const completeFollowUpSchema = z.object({
  applicationId: uuidSchema,
  followUpId: z.string().uuid().optional(),
  outcome: z.enum(["no_response_yet", "recruiter_replied", "interview_scheduled", "test_scheduled", "rejected", "rescheduled", "marked_ghosted", "other"]).default("no_response_yet"),
  notes: z.string().max(2000).optional(),
});

const createInterviewSchema = z.object({
  applicationId: uuidSchema,
  stage: z.enum(["hr_interview", "user_interview", "technical_interview", "case_study", "group_discussion", "final_interview", "offering_discussion", "other"]).default("hr_interview"),
  scheduledAt: z.string().optional(),
  locationType: z.enum(["online", "onsite", "phone", "unknown"]).default("online"),
  interviewerName: z.string().max(120).optional(),
  preparationNotes: z.string().max(5000).optional(),
  questionsToPrepare: z.array(z.string().max(300)).optional(),
  nextStep: z.string().max(500).optional(),
});

const companyResearchSchema = z.object({
  applicationId: uuidSchema,
  name: z.string().trim().min(1).max(120).optional(),
  industry: z.string().max(120).optional(),
  websiteUrl: optionalUrl,
  whyIApply: z.string().max(3000).optional(),
  companyNotes: z.string().max(10000).optional(),
  cultureNotes: z.string().max(5000).optional(),
  redFlags: z.string().max(5000).optional(),
  questionsForInterviewer: z.string().max(5000).optional(),
});

const documentSchema = z.object({
  applicationId: uuidSchema,
  name: z.string().trim().min(1, "Nama dokumen perlu diisi.").max(160),
  type: z.enum(["cv_ats", "cv_creative", "portfolio", "cover_letter", "transcript", "certificate", "linkedin_url", "github_url", "behance_url", "personal_website", "other"]).default("cv_ats"),
  status: z.enum(["ready", "needs_review", "draft", "old_version"]).default("ready"),
  url: optionalUrl,
  notes: z.string().max(2000).optional(),
});

const preferencesSchema = z.object({
  name: z.string().trim().min(1, "Nama perlu diisi.").max(120),
  followUpAfterDays: z.coerce.number().int().min(1).max(60),
  ghostedAfterDays: z.coerce.number().int().min(7).max(180),
  notificationEmailEnabled: z.boolean().default(false),
});

const weeklyReviewSchema = z.object({
  weekStart: z.string().min(1),
  weekEnd: z.string().min(1),
  insight: z.string().max(2000).optional(),
  nextWeekFocus: z.string().max(2000).optional(),
  reflectionNotes: z.string().max(4000).optional(),
});

const finalResultSchema = z.object({
  applicationId: uuidSchema,
  result: z.enum(["accepted", "rejected", "ghosted"]),
  reflectionNotes: z.string().max(4000).optional(),
});

function nullable(value?: string | null) {
  return value && value.trim() ? value.trim() : null;
}

function toIso(value?: string | null) {
  if (!value) return null;
  if (value.includes("T")) return new Date(value).toISOString();
  return new Date(`${value}T09:00:00+07:00`).toISOString();
}

function finalResult(status: ApplicationStatus) {
  return finalStatuses.includes(status) ? status as "accepted" | "rejected" | "ghosted" : null;
}

function revalidateDashboard() {
  ["/dashboard", "/applications", "/pipeline", "/follow-up", "/interviews", "/companies", "/documents", "/insights", "/settings"].forEach((path) => revalidatePath(path));
}

async function success(message: string): Promise<DashboardActionResult> {
  revalidateDashboard();
  return { ok: true, message, data: await loadDashboardData() };
}

function failure(error: unknown): DashboardActionResult {
  return { ok: false, message: error instanceof Error ? error.message : "Aksi gagal diproses." };
}

async function insertEvent(input: {
  userId: string;
  applicationId: string;
  type: ApplicationEvent["type"];
  title: string;
  description?: string | null;
  fromStatus?: ApplicationStatus | null;
  toStatus?: ApplicationStatus | null;
}) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("application_events").insert({
    user_id: input.userId,
    application_id: input.applicationId,
    event_type: input.type,
    title: input.title,
    description: input.description || null,
    from_status: input.fromStatus || null,
    to_status: input.toStatus || null,
  });

  if (error) throw new Error(error.message);
}

async function requireApplication(applicationId: string, userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("applications")
    .select("id,status,company_name,role_title,company_id")
    .eq("id", applicationId)
    .eq("user_id", userId)
    .single();

  if (error || !data) throw new Error("Lamaran tidak ditemukan atau bukan milik akun ini.");
  return data as { id: string; status: ApplicationStatus; company_name: string; role_title: string; company_id: string | null };
}

async function cancelActiveFollowUps(applicationId: string, userId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("follow_ups")
    .update({ status: "cancelled" })
    .eq("user_id", userId)
    .eq("application_id", applicationId)
    .in("status", ["scheduled", "due", "overdue"]);

  if (error) throw new Error(error.message);
}

export async function createApplicationAction(input: unknown): Promise<DashboardActionResult> {
  try {
    const user = await requireUser();
    const parsed = createApplicationSchema.parse(input);
    const supabase = await createSupabaseServerClient();

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({
        user_id: user.id,
        name: parsed.companyName,
        source: parsed.source,
        why_i_apply: nullable(parsed.notes),
      })
      .select("id")
      .single();

    if (companyError) throw new Error(companyError.message);
    const result = finalResult(parsed.status);

    const { data: application, error } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        company_id: (company as { id: string }).id,
        company_name: parsed.companyName,
        role_title: parsed.roleTitle,
        source: parsed.source,
        job_url: nullable(parsed.jobUrl),
        status: parsed.status,
        deadline_at: toIso(parsed.deadlineAt),
        applied_at: toIso(parsed.appliedAt) || (["applied", "waiting_response", "hr_screening", "interview", "technical_test", "offering"].includes(parsed.status) ? new Date().toISOString() : null),
        follow_up_at: toIso(parsed.followUpAt),
        next_action: nullable(parsed.nextAction) || "Review requirements",
        notes: nullable(parsed.notes),
        result,
        result_at: result ? new Date().toISOString() : null,
        attention_status: parsed.followUpAt ? "follow_up_needed" : null,
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    const applicationId = (application as { id: string }).id;

    await insertEvent({
      userId: user.id,
      applicationId,
      type: "application_created",
      title: "Application created",
      description: `${parsed.companyName} · ${parsed.roleTitle}`,
      toStatus: parsed.status,
    });

    if (parsed.followUpAt) {
      const dueAt = toIso(parsed.followUpAt);
      const { error: followUpError } = await supabase.from("follow_ups").insert({
        user_id: user.id,
        application_id: applicationId,
        due_at: dueAt,
        status: "scheduled",
      });
      if (followUpError) throw new Error(followUpError.message);
    }

    return success("Lamaran berhasil ditambahkan.");
  } catch (error) {
    return failure(error);
  }
}

export async function updateApplicationStatusAction(applicationId: string, status: ApplicationStatus): Promise<DashboardActionResult> {
  try {
    const user = await requireUser();
    const parsedStatus = applicationStatusSchema.parse(status);
    const application = await requireApplication(applicationId, user.id);
    const supabase = await createSupabaseServerClient();
    const result = finalResult(parsedStatus);

    if (result) await cancelActiveFollowUps(applicationId, user.id);

    const { error } = await supabase
      .from("applications")
      .update({
        status: parsedStatus,
        result,
        result_at: result ? new Date().toISOString() : null,
        follow_up_at: result ? null : undefined,
        attention_status: result || parsedStatus !== "waiting_response" ? null : undefined,
      })
      .eq("id", applicationId)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    await insertEvent({
      userId: user.id,
      applicationId,
      type: result ? "result_marked" : "status_changed",
      title: result ? `Application marked as ${result}` : `Status changed to ${applicationStatusLabels[parsedStatus]}`,
      description: `${applicationStatusLabels[application.status]} → ${applicationStatusLabels[parsedStatus]}`,
      fromStatus: application.status,
      toStatus: parsedStatus,
    });

    return success("Status lamaran berhasil diperbarui.");
  } catch (error) {
    return failure(error);
  }
}

export async function setFollowUpAction(input: unknown): Promise<DashboardActionResult> {
  try {
    const user = await requireUser();
    const parsed = setFollowUpSchema.parse(input);
    await requireApplication(parsed.applicationId, user.id);
    const supabase = await createSupabaseServerClient();
    const dueAt = toIso(parsed.dueAt);

    const { error } = await supabase.from("follow_ups").insert({
      user_id: user.id,
      application_id: parsed.applicationId,
      due_at: dueAt,
      channel: nullable(parsed.channel),
      message: nullable(parsed.message),
      notes: nullable(parsed.notes),
      status: "scheduled",
    });
    if (error) throw new Error(error.message);

    const { error: applicationError } = await supabase
      .from("applications")
      .update({ follow_up_at: dueAt, attention_status: "follow_up_needed", next_action: "Follow-up scheduled" })
      .eq("id", parsed.applicationId)
      .eq("user_id", user.id);
    if (applicationError) throw new Error(applicationError.message);

    await insertEvent({
      userId: user.id,
      applicationId: parsed.applicationId,
      type: "follow_up_scheduled",
      title: "Follow-up scheduled",
      description: dueAt ? new Date(dueAt).toLocaleDateString("id-ID", { dateStyle: "medium" }) : null,
    });

    return success("Follow-up berhasil dijadwalkan.");
  } catch (error) {
    return failure(error);
  }
}

export async function completeFollowUpAction(input: unknown): Promise<DashboardActionResult> {
  try {
    const user = await requireUser();
    const parsed = completeFollowUpSchema.parse(input);
    await requireApplication(parsed.applicationId, user.id);
    const supabase = await createSupabaseServerClient();

    let followUpId = parsed.followUpId;
    if (!followUpId) {
      const { data } = await supabase
        .from("follow_ups")
        .select("id")
        .eq("user_id", user.id)
        .eq("application_id", parsed.applicationId)
        .in("status", ["scheduled", "due", "overdue"])
        .order("due_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      followUpId = (data as { id: string } | null)?.id;
    }

    if (followUpId) {
      const { error } = await supabase
        .from("follow_ups")
        .update({ status: "completed", completed_at: new Date().toISOString(), outcome: parsed.outcome, notes: nullable(parsed.notes) })
        .eq("id", followUpId)
        .eq("user_id", user.id);
      if (error) throw new Error(error.message);
    }

    const statusByOutcome: Partial<Record<typeof parsed.outcome, ApplicationStatus>> = {
      interview_scheduled: "interview",
      test_scheduled: "technical_test",
      rejected: "rejected",
      marked_ghosted: "ghosted",
    };
    const nextStatus = statusByOutcome[parsed.outcome];
    const result = nextStatus ? finalResult(nextStatus) : null;

    const { error: applicationError } = await supabase
      .from("applications")
      .update({
        ...(nextStatus ? { status: nextStatus, result, result_at: result ? new Date().toISOString() : null } : {}),
        follow_up_at: null,
        last_followed_up_at: new Date().toISOString(),
        attention_status: null,
        next_action: parsed.outcome === "no_response_yet" ? "Wait for response" : "Review next step",
      })
      .eq("id", parsed.applicationId)
      .eq("user_id", user.id);
    if (applicationError) throw new Error(applicationError.message);

    await insertEvent({
      userId: user.id,
      applicationId: parsed.applicationId,
      type: "follow_up_completed",
      title: "Follow-up completed",
      description: parsed.outcome.replaceAll("_", " "),
      toStatus: nextStatus || null,
    });

    return success("Follow-up ditandai selesai.");
  } catch (error) {
    return failure(error);
  }
}

export async function createInterviewAction(input: unknown): Promise<DashboardActionResult> {
  try {
    const user = await requireUser();
    const parsed = createInterviewSchema.parse(input);
    const application = await requireApplication(parsed.applicationId, user.id);
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from("interviews").insert({
      user_id: user.id,
      application_id: parsed.applicationId,
      stage: parsed.stage,
      scheduled_at: toIso(parsed.scheduledAt),
      location_type: parsed.locationType,
      interviewer_name: nullable(parsed.interviewerName),
      preparation_notes: nullable(parsed.preparationNotes),
      questions_to_prepare: parsed.questionsToPrepare || [],
      next_step: nullable(parsed.nextStep),
      status: parsed.scheduledAt ? "needs_preparation" : "scheduled",
    });
    if (error) throw new Error(error.message);

    if (!finalStatuses.includes(application.status) && application.status !== "interview") {
      const { error: updateError } = await supabase
        .from("applications")
        .update({ status: "interview", attention_status: null, next_action: "Prepare interview" })
        .eq("id", parsed.applicationId)
        .eq("user_id", user.id);
      if (updateError) throw new Error(updateError.message);
    }

    await insertEvent({
      userId: user.id,
      applicationId: parsed.applicationId,
      type: "interview_created",
      title: "Interview scheduled",
      description: parsed.stage.replaceAll("_", " "),
      fromStatus: application.status,
      toStatus: "interview",
    });

    return success("Interview berhasil ditambahkan.");
  } catch (error) {
    return failure(error);
  }
}

export async function updateCompanyResearchAction(input: unknown): Promise<DashboardActionResult> {
  try {
    const user = await requireUser();
    const parsed = companyResearchSchema.parse(input);
    const application = await requireApplication(parsed.applicationId, user.id);
    const supabase = await createSupabaseServerClient();

    const payload = {
      user_id: user.id,
      name: parsed.name || application.company_name,
      industry: nullable(parsed.industry),
      website_url: nullable(parsed.websiteUrl),
      why_i_apply: nullable(parsed.whyIApply),
      company_notes: nullable(parsed.companyNotes),
      culture_notes: nullable(parsed.cultureNotes),
      red_flags: nullable(parsed.redFlags),
      questions_for_interviewer: nullable(parsed.questionsForInterviewer),
    };

    if (application.company_id) {
      const { error } = await supabase.from("companies").update(payload).eq("id", application.company_id).eq("user_id", user.id);
      if (error) throw new Error(error.message);
    } else {
      const { data, error } = await supabase.from("companies").insert(payload).select("id").single();
      if (error) throw new Error(error.message);
      await supabase.from("applications").update({ company_id: (data as { id: string }).id }).eq("id", parsed.applicationId).eq("user_id", user.id);
    }

    await insertEvent({
      userId: user.id,
      applicationId: parsed.applicationId,
      type: "company_research_updated",
      title: "Company research updated",
      description: parsed.name || application.company_name,
    });

    return success("Riset perusahaan berhasil disimpan.");
  } catch (error) {
    return failure(error);
  }
}

export async function attachDocumentAction(input: unknown): Promise<DashboardActionResult> {
  try {
    const user = await requireUser();
    const parsed = documentSchema.parse(input);
    await requireApplication(parsed.applicationId, user.id);
    const supabase = await createSupabaseServerClient();

    const { data: document, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        name: parsed.name,
        type: parsed.type,
        status: parsed.status,
        url: nullable(parsed.url),
        notes: nullable(parsed.notes),
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    const documentId = (document as { id: string }).id;

    const { error: linkError } = await supabase.from("application_documents").insert({
      user_id: user.id,
      application_id: parsed.applicationId,
      document_id: documentId,
    });
    if (linkError) throw new Error(linkError.message);

    await insertEvent({
      userId: user.id,
      applicationId: parsed.applicationId,
      type: "document_attached",
      title: "Document attached",
      description: parsed.name,
    });

    return success("Dokumen berhasil ditautkan.");
  } catch (error) {
    return failure(error);
  }
}

export async function archiveApplicationAction(applicationId: string): Promise<DashboardActionResult> {
  try {
    const user = await requireUser();
    await requireApplication(applicationId, user.id);
    await cancelActiveFollowUps(applicationId, user.id);
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("applications")
      .update({ is_archived: true, archived_at: new Date().toISOString(), attention_status: null, follow_up_at: null })
      .eq("id", applicationId)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    await insertEvent({ userId: user.id, applicationId, type: "application_archived", title: "Application archived" });

    return success("Lamaran dipindahkan ke arsip.");
  } catch (error) {
    return failure(error);
  }
}

export async function markFinalResultAction(input: unknown): Promise<DashboardActionResult> {
  try {
    const user = await requireUser();
    const parsed = finalResultSchema.parse(input);
    const application = await requireApplication(parsed.applicationId, user.id);
    await cancelActiveFollowUps(parsed.applicationId, user.id);
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from("applications")
      .update({
        status: parsed.result,
        result: parsed.result,
        result_at: new Date().toISOString(),
        reflection_notes: nullable(parsed.reflectionNotes),
        follow_up_at: null,
        attention_status: null,
        next_action: "Write reflection notes",
      })
      .eq("id", parsed.applicationId)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    await insertEvent({
      userId: user.id,
      applicationId: parsed.applicationId,
      type: "result_marked",
      title: `Application marked as ${parsed.result}`,
      description: nullable(parsed.reflectionNotes),
      fromStatus: application.status,
      toStatus: parsed.result,
    });

    return success(`Application marked as ${parsed.result}.`);
  } catch (error) {
    return failure(error);
  }
}

export async function saveSettingsAction(input: unknown): Promise<DashboardActionResult> {
  try {
    const user = await requireUser();
    const parsed = preferencesSchema.parse(input);
    const supabase = await createSupabaseServerClient();

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ name: parsed.name })
      .eq("user_id", user.id);
    if (profileError) throw new Error(profileError.message);

    const { error } = await supabase
      .from("user_preferences")
      .update({
        follow_up_after_days: parsed.followUpAfterDays,
        ghosted_after_days: parsed.ghostedAfterDays,
        notification_email_enabled: parsed.notificationEmailEnabled,
      })
      .eq("user_id", user.id);
    if (error) throw new Error(error.message);

    return success("Settings berhasil disimpan.");
  } catch (error) {
    return failure(error);
  }
}

export async function saveWeeklyReviewAction(input: unknown): Promise<DashboardActionResult> {
  try {
    const user = await requireUser();
    const parsed = weeklyReviewSchema.parse(input);
    const data = await loadDashboardData();
    const active = data.applications.filter((item) => !item.isArchived);
    const countStatus = (status: ApplicationStatus) => active.filter((item) => item.status === status).length;
    const supabase = await createSupabaseServerClient();

    const snapshot = {
      user_id: user.id,
      week_start: parsed.weekStart,
      week_end: parsed.weekEnd,
      applications_sent: active.filter((item) => Boolean(item.appliedAt)).length,
      responses_received: active.filter((item) => ["hr_screening", "interview", "technical_test", "offering", "accepted", "rejected"].includes(item.status)).length,
      interviews_scheduled: data.interviews.length,
      follow_ups_completed: data.followUps.filter((item) => item.status === "completed").length,
      follow_ups_needed: data.followUps.filter((item) => !["completed", "cancelled", "rescheduled"].includes(item.status)).length,
      accepted_count: countStatus("accepted"),
      rejected_count: countStatus("rejected"),
      ghosted_count: countStatus("ghosted"),
      offering_count: countStatus("offering"),
      saved_count: countStatus("saved"),
      insight: nullable(parsed.insight),
      next_week_focus: nullable(parsed.nextWeekFocus),
      reflection_notes: nullable(parsed.reflectionNotes),
    };

    const { error } = await supabase
      .from("weekly_reviews")
      .upsert(snapshot, { onConflict: "user_id,week_start,week_end" });
    if (error) throw new Error(error.message);

    return success("Weekly review berhasil disimpan.");
  } catch (error) {
    return failure(error);
  }
}

export type { DashboardDocument, Interview };
