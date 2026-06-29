"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { ApplicationsView } from "@/components/dashboard/views/ApplicationsView";

export default function ApplicationDetailPage() {
  const params = useParams<{ applicationId: string }>();
  const { selectApplication } = useDashboard();
  useEffect(() => { selectApplication(params.applicationId); }, [params.applicationId, selectApplication]);
  return <ApplicationsView />;
}
