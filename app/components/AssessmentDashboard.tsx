// app/components/AssessmentDashboard.tsx

import { Link } from "@remix-run/react";
import { ChevronLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

type Pillar = {
  id: string;
  name: string;
  weight: number;
  score: number;
  buildingId: string;
  kpis: Array<{ currentValue: number }>;
};

export default function AssessmentDashboard({ pillars, buildingId }: { pillars: Pillar[], buildingId?: string }) {
  const isAssessed = (pillar: Pillar) => pillar.kpis.some(kpi => kpi.currentValue !== 0);

  if (!pillars || pillars.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">INHERIT Assessment Dashboard</h1>
        <p>No pillars found for this building. This may be due to a data inconsistency. Please try refreshing the page or contact support if the issue persists.</p>
      </div>
    );
  }

  const getPillarAssessmentLink = (pillar: Pillar) => {
    switch(pillar.name) {
      case "Energy Performance":
        return `/assessment/energy-performance?buildingId=${buildingId}`;
      case "Resource Efficiency":
        return `/assessment/resource-efficiency?buildingId=${buildingId}`;
      case "Climate Resilience":
        return `/assessment/resilience?buildingId=${buildingId}`;
      case "Accessibility":
        return `/assessment/accessibility?buildingId=${buildingId}`;
      default:
        return `/assessment/${pillar.id}?buildingId=${buildingId}`;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Link to={`/buildings/${buildingId}`} className='max-w-80 flex items-center gap-1 pb-4 hover:text-blue-500'>
        <ChevronLeft className="inline-block w-6 h-6" />
        Back to building Assessments
      </Link>
      <h1 className="text-2xl font-bold mb-4">INHERIT Assessment Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {pillars.map((pillar) => 
          
          <Link key={pillar.id} to={getPillarAssessmentLink(pillar)}>
            <Card className="transition group hover:bg-slate-100">
              <CardHeader>
                <CardTitle>{pillar.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Weight: {pillar.weight}</p>
                <p>Score: {pillar.score.toFixed(2)}</p>
                <p>{isAssessed(pillar) ? "Assessed" : "Not yet assessed"}</p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
