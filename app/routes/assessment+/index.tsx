import AssessmentDashboard from "#app/components/AssessmentDashboard.js";
import { getPillars } from "#app/models/pillar.server.js";
import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async () => {
    const pillars = await getPillars();
    console.log("Pillars fetched in loader:", pillars);
    return json({ pillars });
  };
  
  export default function AssessmentIndex() {
    const { pillars } = useLoaderData<typeof loader>();
    console.log("Pillars in component:", pillars);
    return <AssessmentDashboard pillars={pillars} />;
  }
