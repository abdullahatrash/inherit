import { Form } from "@remix-run/react";

import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

type KPI = {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
  positiveContribution: boolean;
  weight: number;
};

type Pillar = {
  id: string;
  name: string;
  weight: number;
  kpis: KPI[];
};

export default function PillarAssessment({ pillar }: { pillar: Pillar }) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{pillar.name} Assessment</h1>
      <Form method="post">
        {pillar.kpis.map((kpi) => (
          <div key={kpi.id} className="mb-4">
            <Label htmlFor={kpi.id}>{kpi.name}</Label>
            <Input
              type="number"
              id={kpi.id}
              name={kpi.id}
              defaultValue={kpi.currentValue}
              step="0.01"
            />
            <p className="text-sm text-gray-500">
              Target: {kpi.targetValue} | Weight: {kpi.weight}
            </p>
          </div>
        ))}
        <Button type="submit">Calculate Score</Button>
      </Form>
    </div>
  );
}
