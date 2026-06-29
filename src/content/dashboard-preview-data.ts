import type { ApplicationPreviewItem } from "@/types/application";

export const applications: ApplicationPreviewItem[] = [
  {
    id: "shopee",
    company: "Shopee",
    role: "Business Analyst Intern",
    source: "LinkedIn",
    status: "waiting_response",
    meta: "Applied 7 days ago",
    nextAction: "Follow-up today",
  },
  {
    id: "tokopedia",
    company: "Tokopedia",
    role: "Product Analyst Intern",
    source: "MagangKareer",
    status: "applied",
    meta: "Applied 2 days ago",
    nextAction: "Follow-up in 2 days",
  },
  {
    id: "mandiri",
    company: "Bank Mandiri",
    role: "ODP Technology",
    source: "Website perusahaan",
    status: "interview",
    meta: "Tomorrow · 10:00",
    nextAction: "Prepare answers",
  },
  {
    id: "traveloka",
    company: "Traveloka",
    role: "Frontend Engineer",
    source: "LinkedIn",
    status: "saved",
    meta: "Saved today",
    nextAction: "Review requirements",
  },
];

export const pipeline = [
  { label: "Saved", count: 4, company: "Traveloka", role: "Frontend Engineer" },
  { label: "Applied", count: 5, company: "Tokopedia", role: "Product Analyst Intern" },
  { label: "Waiting", count: 3, company: "Shopee", role: "Business Analyst Intern" },
  { label: "Interview", count: 2, company: "Bank Mandiri", role: "ODP Technology" },
  { label: "Result", count: 1, company: "Astra", role: "Graduate Trainee" },
];

export const weeklyMetrics = [
  ["12", "Applications sent"],
  ["4", "Responses received"],
  ["2", "Interviews scheduled"],
  ["3", "Follow-ups needed"],
];
