import type { ApplicationEvent, DashboardApplication, Interview } from "@/types/application";

const now = "2026-06-27T09:00:00.000Z";

export const seedApplications: DashboardApplication[] = [
  { id: "tokopedia", companyName: "Tokopedia", roleTitle: "Product Analyst Intern", source: "MagangKareer", jobType: "internship", workSystem: "hybrid", location: "Jakarta", status: "applied", appliedAt: "2026-06-25T09:00:00.000Z", followUpAt: "2026-06-29T09:00:00.000Z", nextAction: "Follow-up in 2 days", notes: "Role product analytics untuk entry-level.", isArchived: false, createdAt: now, updatedAt: now },
  { id: "mandiri", companyName: "Bank Mandiri", roleTitle: "ODP Technology", source: "LinkedIn", jobType: "mt_odp", workSystem: "onsite", location: "Jakarta", status: "interview", appliedAt: "2026-06-15T09:00:00.000Z", nextAction: "Prepare STAR answers", notes: "Fokus pada pengalaman organisasi dan problem solving.", isArchived: false, createdAt: now, updatedAt: now },
  { id: "traveloka", companyName: "Traveloka", roleTitle: "Frontend Engineer", source: "Company Website", jobType: "full_time", workSystem: "hybrid", location: "Tangerang", status: "saved", deadlineAt: "2026-07-03T16:59:00.000Z", nextAction: "Review requirements", notes: "Interested in product scale and frontend performance challenges.", isArchived: false, createdAt: now, updatedAt: now },
  { id: "shopee", companyName: "Shopee", roleTitle: "Business Analyst Intern", source: "Glints", jobType: "internship", workSystem: "onsite", location: "Jakarta", status: "waiting_response", attentionStatus: "follow_up_needed", appliedAt: "2026-06-19T09:00:00.000Z", followUpAt: "2026-06-27T09:00:00.000Z", nextAction: "Follow-up today", isArchived: false, createdAt: now, updatedAt: now },
  { id: "bca", companyName: "BCA", roleTitle: "Management Trainee", source: "Kalibrr", jobType: "mt_odp", workSystem: "onsite", location: "Jakarta", status: "technical_test", deadlineAt: "2026-07-03T09:00:00.000Z", attentionStatus: "deadline_soon", nextAction: "Complete test by Friday", isArchived: false, createdAt: now, updatedAt: now },
  { id: "astra", companyName: "Astra", roleTitle: "Graduate Trainee", source: "JobStreet", jobType: "mt_odp", workSystem: "onsite", location: "Jakarta", status: "offering", nextAction: "Review offering", isArchived: false, createdAt: now, updatedAt: now },
  { id: "gojek", companyName: "Gojek", roleTitle: "Data Analyst Intern", source: "Referral", jobType: "internship", workSystem: "hybrid", location: "Jakarta", status: "rejected", result: "rejected", reflectionNotes: "Perlu memperkuat SQL case study.", nextAction: "Write reflection notes", isArchived: false, createdAt: now, updatedAt: now },
];

export const seedEvents: ApplicationEvent[] = [
  { id: "e1", applicationId: "mandiri", type: "interview_created", title: "Interview scheduled", description: "HR Interview · 28 Juni, 10:00", createdAt: "2026-06-27T08:00:00.000Z" },
  { id: "e2", applicationId: "shopee", type: "follow_up_scheduled", title: "Follow-up scheduled", description: "Follow-up melalui email hari ini", createdAt: "2026-06-26T12:00:00.000Z" },
  { id: "e3", applicationId: "tokopedia", type: "status_changed", title: "Status changed to applied", description: "Lamaran berhasil dikirim.", createdAt: "2026-06-25T09:00:00.000Z" },
  { id: "e4", applicationId: "astra", type: "status_changed", title: "Status changed to offering", description: "Offering diterima untuk ditinjau.", createdAt: "2026-06-24T09:00:00.000Z" },
];

export const seedInterviews: Interview[] = [
  { id: "int-mandiri", applicationId: "mandiri", stage: "hr_interview", scheduledAt: "2026-06-28T10:00:00.000Z", locationType: "online", interviewerName: "Recruitment Team", preparationNotes: "Prepare STAR answers tonight.", questionsToPrepare: ["Ceritakan pengalaman organisasi.", "Kenapa tertarik ODP Technology?", "Contoh problem solving."], nextStep: "Review company values", status: "needs_preparation" },
];

export const documents = [
  { id: "doc1", name: "CV ATS — Product Analyst", type: "CV ATS", status: "ready", linked: 3 },
  { id: "doc2", name: "Portfolio 2026", type: "Portfolio", status: "needs review", linked: 2 },
  { id: "doc3", name: "Cover Letter — Bank Mandiri", type: "Cover Letter", status: "draft", linked: 1 },
];
