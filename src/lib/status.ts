import type { ApplicationStatus, ApplicationStatusCategory } from "@/types/status";

export const applicationStatuses: ApplicationStatus[] = [
  "saved",
  "preparing",
  "applied",
  "waiting_response",
  "hr_screening",
  "interview",
  "technical_test",
  "offering",
  "accepted",
  "rejected",
  "ghosted",
  "follow_up_needed",
];

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  saved: "saved",
  preparing: "preparing",
  applied: "applied",
  waiting_response: "waiting response",
  hr_screening: "hr screening",
  interview: "interview",
  technical_test: "technical test",
  offering: "offering",
  accepted: "accepted",
  rejected: "rejected",
  ghosted: "ghosted",
  follow_up_needed: "follow-up needed",
};

export const applicationStatusCategory: Record<ApplicationStatus, ApplicationStatusCategory> = {
  saved: "pre_apply",
  preparing: "pre_apply",
  applied: "active",
  waiting_response: "active",
  hr_screening: "active",
  interview: "active",
  technical_test: "active",
  offering: "active",
  accepted: "final",
  rejected: "final",
  ghosted: "final",
  follow_up_needed: "attention",
};

export const finalStatuses: ApplicationStatus[] = ["accepted", "rejected", "ghosted"];
