import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { LoadingPage } from "@/components/ui/loading-spinner";
import { Suspense } from "react";
import CampaignContent from "./campaign-content";

export default async function CampaignDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const shareId = resolvedSearchParams.share;

  // Get base URL dynamically
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host");
  if (!host) notFound();
  const baseUrl = `${proto}://${host}`;

  const isReadOnly = resolvedSearchParams.view === "readonly";

  return (
    <Suspense fallback={<LoadingPage message="Loading campaign..." />}>
      <CampaignContent
        id={id}
        shareId={shareId as string}
        isReadOnly={isReadOnly}
        baseUrl={baseUrl}
      />
    </Suspense>
  );
}
