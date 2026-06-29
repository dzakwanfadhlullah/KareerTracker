"use client";

import { Filter, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { applicationStatuses, applicationStatusLabels } from "@/lib/status";
import type { ApplicationStatus } from "@/types/status";
import { useDashboard } from "../DashboardProvider";
import { ApplicationList } from "../applications/ApplicationList";
import { EmptyState, PageHeader } from "../layout/DashboardUI";

export function ApplicationsView() {
  const { applications, setAddOpen } = useDashboard();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | ApplicationStatus>("all");
  const filtered = useMemo(() => applications.filter((item) => {
    if (item.isArchived) return false;
    const matchesQuery = `${item.companyName} ${item.roleTitle} ${item.source} ${item.notes || ""}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === "all" || item.status === status);
  }), [applications, query, status]);

  return (
    <div className="app-page app-page-applications">
      <PageHeader title="Applications" description="Semua lamaran kerja kamu dalam satu tracker. Cari, filter, dan update status tanpa harus membuka banyak platform." action={<button type="button" className="app-button app-button-primary" onClick={() => setAddOpen(true)}><Plus size={17} />Add Application</button>} />
      <div className="app-filterbar">
        <label className="app-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari lamaran" aria-label="Cari lamaran" /></label>
        <label className="app-filter-select"><Filter size={15} /><select value={status} onChange={(event) => setStatus(event.target.value as "all" | ApplicationStatus)} aria-label="Filter status"><option value="all">All status</option>{applicationStatuses.map((item) => <option value={item} key={item}>{applicationStatusLabels[item]}</option>)}</select></label>
        <span>{filtered.length} applications</span>
      </div>
      {filtered.length ? <ApplicationList applications={filtered} /> : <EmptyState title={applications.length ? "Tidak ada lamaran yang cocok." : "Belum ada lamaran yang ditambahkan."} description={applications.length ? "Coba ubah kata pencarian atau filter status." : "Mulai dengan menyimpan lowongan pertama kamu, lalu update statusnya saat proses apply berjalan."} action={!applications.length && <button type="button" className="app-button app-button-primary" onClick={() => setAddOpen(true)}>Tambah Lamaran</button>} />}
    </div>
  );
}
