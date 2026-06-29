import { applicationStatusLabels } from "@/lib/status";
import type { ApplicationStatus } from "@/types/status";

export function StatusPill({ status }: { status: ApplicationStatus }) {
  return <span className={`app-status app-status-${status}`}><span />{applicationStatusLabels[status]}</span>;
}

export function AttentionBadge({ label = "follow-up needed" }: { label?: string }) {
  return <span className="app-attention"><span />{label}</span>;
}
