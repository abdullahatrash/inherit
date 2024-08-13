import React, { useState, useTransition } from "react";
import { json, type ActionFunction } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
// import { LineChart, RadarChart } from "~/components/ui/charts";

interface KPIData {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
  positiveContribution: number;
  pillarWeight: number;
  kpiWeight: number;
  achievement: number;
  score: number;
}

const kpiDefinitions = [
  { id: "energy-total", name: "Energy intensity (total)", targetValue: 30, positiveContribution: 0, kpiWeight: 1.25 },
  { id: "energy-heating", name: "Energy intensity (heating)", targetValue: 12, positiveContribution: 0, kpiWeight: 1.25 },
  { id: "energy-cooling", name: "Energy intensity (cooling)", targetValue: 8, positiveContribution: 0, kpiWeight: 1.25 },
  { id: "energy-lighting", name: "Energy intensity (lighting)", targetValue: 5, positiveContribution: 0, kpiWeight: 1.25 },
  { id: "energy-other", name: "Energy intensity (other uses)", targetValue: 4, positiveContribution: 0, kpiWeight: 1.25 },
  { id: "energy-res", name: "Energy produced from RES", targetValue: 100, positiveContribution: 1, kpiWeight: 2.5 },
  { id: "sri-total", name: "Total Smart Readiness Indicator", targetValue: 100, positiveContribution: 1, kpiWeight: 1.67 },
  { id: "sri-performance", name: "Energy Performance & Operation (SRI)", targetValue: 100, positiveContribution: 1, kpiWeight: 1.67 },
  { id: "sri-user-needs", name: "Respond to User Needs (SRI)", targetValue: 100, positiveContribution: 1, kpiWeight: 1.67 },
  { id: "energy-flexibility", name: "Energy flexibility (SRI)", targetValue: 100, positiveContribution: 1, kpiWeight: 1.67 },
  { id: "temp-frequency", name: "Indoor Air Temperature Frequency", targetValue: 100, positiveContribution: 1, kpiWeight: 2.5 },
  { id: "humidity-frequency", name: "Indoor Humidity Frequency", targetValue: 100, positiveContribution: 1, kpiWeight: 2.5 },
  { id: "co2-frequency", name: "Indoor CO2 Concentration Frequency", targetValue: 100, positiveContribution: 1, kpiWeight: 2.5 },
  { id: "illuminance-frequency", name: "Illuminance Frequency", targetValue: 100, positiveContribution: 1, kpiWeight: 2.5 },
  { id: "noise-frequency", name: "Noise Level Frequency", targetValue: 100, positiveContribution: 1, kpiWeight: 2.5 },
];

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const kpiData = kpiDefinitions.map(kpi => {
    const currentValue = Number(formData.get(kpi.id));
    const achievement = calculateAchievement(currentValue, kpi.targetValue, kpi.positiveContribution);
    const score = calculateScore(achievement, kpi.kpiWeight);
    return {
      ...kpi,
      currentValue,
      achievement,
      score,
      pillarWeight: 25, // Assuming equal weight for all pillars
    };
  });

  return json({ kpiData });
};

function calculateAchievement(currentValue: number, targetValue: number, positiveContribution: number): number {
  return positiveContribution === 1
    ? (currentValue / targetValue) * 100
    : (targetValue / currentValue) * 100;
}

function calculateScore(achievement: number, weight: number): number {
  return (achievement / 100) * weight;
}

export default function EnergyPerformanceAssessment() {
  const actionData = useActionData<{ kpiData: KPIData[] }>();
  const transition = useTransition();
  const isSubmitting = transition.state === "submitting";

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Energy Performance Assessment</h1>
      
      {!actionData ? (
        <Form method="post" className="space-y-4">
          {kpiDefinitions.map(kpi => (
            <div key={kpi.id} className="flex flex-col">
              <Label htmlFor={kpi.id}>{kpi.name}</Label>
              <Input type="number" id={kpi.id} name={kpi.id} required />
            </div>
          ))}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Calculating..." : "Calculate Scores"}
          </Button>
        </Form>
      ) : (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>KPI Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>KPI</TableHead>
                    <TableHead>Current Value</TableHead>
                    <TableHead>Target Value</TableHead>
                    <TableHead>Achievement (%)</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actionData.kpiData.map((kpi) => (
                    <TableRow key={kpi.id}>
                      <TableCell>{kpi.name}</TableCell>
                      <TableCell>{kpi.currentValue.toFixed(2)}</TableCell>
                      <TableCell>{kpi.targetValue}</TableCell>
                      <TableCell>{kpi.achievement.toFixed(2)}%</TableCell>
                      <TableCell>{kpi.score.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle>Achievement Radar Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <RadarChart
                data={{
                  labels: actionData.kpiData.map(kpi => kpi.name),
                  datasets: [{
                    label: 'Achievement (%)',
                    data: actionData.kpiData.map(kpi => kpi.achievement),
                  }],
                }}
              />
            </CardContent>
          </Card>

          {actionData.kpiData.map((kpi) => (
            <Card key={kpi.id}>
              <CardHeader>
                <CardTitle>{kpi.name} Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                    datasets: [{
                      label: 'Current Value',
                      data: [kpi.currentValue * 0.9, kpi.currentValue * 0.95, kpi.currentValue * 0.98, kpi.currentValue * 0.99, kpi.currentValue],
                    }],
                  }}
                />
              </CardContent>
            </Card>
          ))} */}
        </div>
      )}
    </div>
  );
}
