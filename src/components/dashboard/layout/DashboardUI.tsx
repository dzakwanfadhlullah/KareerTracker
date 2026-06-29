import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function PageHeader({ title, description, action, meta }: { title: string; description?: string; action?: ReactNode; meta?: ReactNode }) {
  return <header className="app-page-header"><div>{meta && <div className="app-page-meta">{meta}</div>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="app-page-actions">{action}</div>}</header>;
}

export function CardShell({ children, className = "", variant = "default" }: { children: ReactNode; className?: string; variant?: "default" | "attention" | "muted" }) {
  return <section className={`app-card app-card-${variant} ${className}`}>{children}</section>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className="app-section-title"><h2>{children}</h2>{action}</div>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="app-empty"><span><Inbox size={22} /></span><h3>{title}</h3><p>{description}</p>{action}</div>;
}
