import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import PillarAssessment from "#app/components/PillarAssessment.js";
import { getPillarWithKPIs } from "#app/models/pillar.server.js";

export const loader: LoaderFunction = async ({ params }) => {
    const pillar = await getPillarWithKPIs(params.pillarId!)
    if (!pillar) throw new Response("Not Found", { status: 404 })
    return json({ pillar })
  }
  
  export default function PillarAssessmentPage() {
    const { pillar } = useLoaderData<typeof loader>() as { pillar: any };
    return <PillarAssessment pillar={pillar} />
  }
