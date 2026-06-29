import type { ReactNode } from "react";

export function Container({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return <div className={wide ? "container container-wide" : "container"}>{children}</div>;
}

export function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
}) {
  return (
    <header className="section-header">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {body && <p className="section-body">{body}</p>}
    </header>
  );
}

export function Annotation({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <span className={`annotation${active ? " annotation-active" : ""}`}>
      <span className="annotation-dot" />
      {children}
    </span>
  );
}
