// app/components/AssessmentDashboard.tsx

import { Link } from "@remix-run/react";
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">INHERIT Assessment Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {pillars.map((pillar) => (
          <Link key={pillar.id} to={`/assessment/${pillar.id}${buildingId ? `?buildingId=${buildingId}` : ''}`}>
            <Card>
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
        ))}
      </div>
    </div>
  );
}
