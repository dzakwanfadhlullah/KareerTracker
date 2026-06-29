"use client";

import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  Search,
  Target,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { applications, pipeline, weeklyMetrics } from "@/content/dashboard-preview-data";
import type { ApplicationStatus } from "@/types/status";
import { Annotation } from "./ui";

const statusClass: Record<ApplicationStatus, string> = {
  saved: "saved",
  preparing: "preparing",
  applied: "applied",
  waiting_response: "waiting",
  hr_screening: "screening",
  interview: "interview",
  technical_test: "test",
  offering: "offering",
  accepted: "accepted",
  rejected: "rejected",
  ghosted: "ghosted",
  follow_up_needed: "followup",
};

export function StatusPill({ status }: { status: ApplicationStatus }) {
  const labels: Record<ApplicationStatus, string> = {
    saved: "saved", preparing: "preparing", applied: "applied", waiting_response: "waiting response",
    hr_screening: "hr screening", interview: "interview", technical_test: "technical test",
    offering: "offering", accepted: "accepted", rejected: "rejected", ghosted: "ghosted",
    follow_up_needed: "follow-up needed",
  };
  return <span className={`status-pill status-${statusClass[status]}`}><span />{labels[status]}</span>;
}

function ApplicationRows() {
  return (
    <>
      <p className="ios-group-title">NEEDS ATTENTION</p>
      <div className="ios-group">
        {applications.slice(0, 2).map((item) => (
          <div className="application-row" key={item.id}>
            <span className="company-avatar">{item.company[0]}</span>
            <div className="application-copy">
              <strong>{item.company}</strong>
              <span>{item.role}</span>
              <small>{item.nextAction}</small>
            </div>
            <StatusPill status={item.status} />
          </div>
        ))}
      </div>
      <p className="ios-group-title">ACTIVE APPLICATIONS</p>
      <div className="ios-group">
        {applications.slice(2).map((item) => (
          <div className="application-row" key={item.id}>
            <span className="company-avatar">{item.company[0]}</span>
            <div className="application-copy">
              <strong>{item.company}</strong>
              <span>{item.role}</span>
              <small>{item.meta}</small>
            </div>
            <StatusPill status={item.status} />
          </div>
        ))}
      </div>
    </>
  );
}

function PipelineScreen() {
  return (
    <div className="pipeline-screen">
      {pipeline.map((column) => (
        <div className="pipeline-mobile-row" key={column.label}>
          <div><b>{column.label}</b><span>{column.count}</span></div>
          <strong>{column.company}</strong>
          <small>{column.role}</small>
        </div>
      ))}
    </div>
  );
}

function InterviewScreen() {
  return (
    <div className="interview-screen">
      <p className="ios-group-title">UPCOMING</p>
      <div className="ios-group upcoming-card">
        <span className="date-tile"><b>28</b>JUN</span>
        <div><strong>Bank Mandiri</strong><span>ODP Technology</span><small>Tomorrow · 10:00 · HR Interview</small></div>
      </div>
      <p className="ios-group-title">PREPARE</p>
      <div className="ios-group checklist">
        {["Ceritakan pengalaman organisasi", "Kenapa tertarik ODP Technology?", "Contoh problem solving", "Ekspektasi penempatan"].map((item) => (
          <label key={item}><span className="check-dot" />{item}</label>
        ))}
      </div>
    </div>
  );
}

function InsightsScreen() {
  return (
    <div className="insights-screen">
      <div className="metric-grid">
        {weeklyMetrics.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
      </div>
      <div className="ios-group insight-note"><b>Insight</b><p>Most responses came from LinkedIn and referrals.</p></div>
      <div className="ios-group insight-note"><b>Next focus</b><p>Update CV for product and data roles before applying next week.</p></div>
    </div>
  );
}

const tabs = [
  { label: "Track", icon: BriefcaseBusiness },
  { label: "Pipeline", icon: Target },
  { label: "Interview", icon: CalendarDays },
  { label: "Insights", icon: BarChart3 },
];

export function IPhoneMockup({ annotated = true }: { annotated?: boolean }) {
  const [active, setActive] = useState("Track");

  return (
    <div className="phone-stage">
      {annotated && <div className="phone-annotation annotation-one"><Annotation active>status: applied</Annotation></div>}
      {annotated && <div className="phone-annotation annotation-two"><Annotation>next: follow-up</Annotation></div>}
      {annotated && <div className="phone-annotation annotation-three"><Annotation>source: MagangKareer</Annotation></div>}
      {annotated && <div className="phone-annotation annotation-four"><Annotation>active: 12 applications</Annotation></div>}
      <div className="phone">
        <div className="phone-screen">
          <div className="statusbar"><span>9:41</span><span className="dynamic-island" /><span>5G&nbsp; ◒</span></div>
          <div className="ios-content">
            <div className="ios-title-row">
              <div><h3>{active === "Insights" ? "Weekly Review" : active === "Track" ? "Applications" : active}</h3><p>{active === "Track" ? "12 active applications" : "KareerTrack workspace"}</p></div>
              <CircleUserRound size={28} strokeWidth={1.6} />
            </div>
            {active === "Track" && <div className="ios-search"><Search size={15} /><span>Cari lamaran</span></div>}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.22 }}
                className="screen-content"
              >
                {active === "Track" && <ApplicationRows />}
                {active === "Pipeline" && <PipelineScreen />}
                {active === "Interview" && <InterviewScreen />}
                {active === "Insights" && <InsightsScreen />}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="tabbar">
            {tabs.map(({ label, icon: Icon }) => (
              <button key={label} type="button" className={active === label ? "active" : ""} onClick={() => setActive(label)} aria-label={`Open ${label} tab`}>
                <Icon size={18} strokeWidth={1.9} /><span>{label}</span>
              </button>
            ))}
          </div>
          <span className="home-indicator" />
        </div>
      </div>
    </div>
  );
}

export function DashboardPreview() {
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="mini-brand">K</div>
        {["Overview", "Applications", "Pipeline", "Interview", "Insights"].map((item, index) => (
          <span className={index === 1 ? "active" : ""} key={item}>{item}</span>
        ))}
      </aside>
      <div className="dashboard-main">
        <div className="dashboard-heading"><div><p>Workspace</p><h3>Applications</h3></div><button type="button">+ Add application</button></div>
        <div className="summary-row">
          {[["12", "Active"], ["3", "Follow-up"], ["2", "Interview"], ["4", "Response"]].map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
        </div>
        <div className="desktop-table">
          <div className="table-head"><span>Company & role</span><span>Status</span><span>Next action</span><span>Source</span></div>
          {applications.map((item) => (
            <div className="table-row" key={item.id}>
              <span><b>{item.company}</b><small>{item.role}</small></span>
              <StatusPill status={item.status} />
              <span>{item.nextAction}</span>
              <span>{item.source}<ChevronRight size={14} /></span>
            </div>
          ))}
        </div>
      </div>
      <div className="floating-review"><BarChart3 size={18} /><div><b>Weekly Review</b><span>12 applications sent</span></div></div>
    </div>
  );
}
