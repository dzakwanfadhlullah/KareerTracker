export type ApplicationStatus =
  | "saved"
  | "preparing"
  | "applied"
  | "waiting_response"
  | "hr_screening"
  | "interview"
  | "technical_test"
  | "offering"
  | "accepted"
  | "rejected"
  | "ghosted"
  | "follow_up_needed";

export type ApplicationStatusCategory = "pre_apply" | "active" | "attention" | "final";

export type AttentionType = "follow_up_needed" | "deadline_soon" | "interview_soon";
