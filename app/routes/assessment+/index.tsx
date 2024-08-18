// app/routes/assessment+/index.tsx

import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import AssessmentDashboard from "#app/components/AssessmentDashboard";
import { getPillars } from "#app/models/pillar.server";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const buildingId = url.searchParams.get("buildingId");
  
  const pillars = await getPillars(buildingId || undefined);
  return json({ pillars, buildingId });
};

export default function AssessmentIndex() {
  const { pillars, buildingId } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  return <AssessmentDashboard pillars={pillars} buildingId={buildingId} />;
}
