import { Link } from "@remix-run/react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

type Pillar = {
  id: string;
  name: string;
  weight: number;
  score: number;
};

export default function AssessmentDashboard({ pillars }: { pillars: Pillar[] }) {
  console.log("Pillars received:", pillars);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">INHERIT Assessment Dashboard</h1>
      {pillars && pillars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((pillar) => (
            <Link key={pillar.id} to={`/assessment/${pillar.id}`}>
              <Card>
                <CardHeader>
                  <CardTitle>{pillar.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Weight: {pillar.weight}</p>
                  <p>Score: {pillar.score.toFixed(2)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <p>No pillars found. Please check your data source.</p>
      )}
    </div>
  );
}
