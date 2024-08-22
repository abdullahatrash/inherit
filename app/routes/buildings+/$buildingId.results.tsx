import { json, type LoaderFunction } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { ChevronLeft, HomeIcon, Landmark } from 'lucide-react';
import React from 'react';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { prisma } from '../../utils/db.server';

type LoaderData = {
  building: {
    id: string;
    name: string;
    address: string;
    pillars: Array<{
      id: string;
      name: string;
      score: number;
      kpis: Array<{
        id: string;
        name: string;
        currentValue: number;
        targetValue: number;
        achievement: number;
        score: number;
      }>;
    }>;
  };
};

export const loader: LoaderFunction = async ({ params }) => {
  const building = await prisma.building.findUnique({
    where: { id: params.buildingId },
    include: {
      pillars: {
        include: {
          kpis: true,
        },
      },
    },
  });

  if (!building) {
    throw new Response('Not Found', { status: 404 });
  }

  return json({ building });
};

export default function BuildingResults() {
  const { building } = useLoaderData<LoaderData>();

  const chartConfig: ChartConfig = {
    achievement: {
      label: 'Achievement (%)',
      color: 'hsl(var(--chart-1))',
    },
  };

  const radarChartData = building.pillars.flatMap(pillar => 
    pillar.kpis.map(kpi => ({
      kpi: kpi.name,
      achievement: kpi.achievement,
      pillar: pillar.name
    }))
  );

  return (
    <div className="container mx-auto p-4">
      <Link to={`/buildings/${building.id}`} className="flex items-center gap-1 pb-4 hover:text-blue-500">
        <ChevronLeft className="inline-block w-6 h-6" />
        Back to Building
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <HomeIcon className="inline-block w-8 h-8" />
          {building.name} - Assessment Results
        </h1>
        <p className="text-gray-600 flex items-center gap-2">
          <Landmark className="inline-block w-6 h-6" />
          {building.address}
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Overall KPI Achievement</CardTitle>
          <CardDescription>Radar chart showing achievement percentages for all KPIs across pillars</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[500px]">
            <RadarChart data={radarChartData} className="w-full h-full">
              <PolarGrid />
              <PolarAngleAxis dataKey="kpi" />
              <Radar
                name="Achievement"
                dataKey="achievement"
                stroke="var(--color-chart-1)"
                fill="var(--color-chart-1)"
                fillOpacity={0.6}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </RadarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>KPI Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pillar</TableHead>
                <TableHead>KPI</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Target Value</TableHead>
                <TableHead>Achievement (%)</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {building.pillars.flatMap((pillar) =>
                pillar.kpis.length > 0 ? (
                  pillar.kpis.map((kpi) => (
                    <TableRow key={kpi.id}>
                      <TableCell>{pillar.name}</TableCell>
                      <TableCell>{kpi.name}</TableCell>
                      <TableCell>{kpi.currentValue.toFixed(2)}</TableCell>
                      <TableCell>{kpi.targetValue.toFixed(2)}</TableCell>
                      <TableCell>{kpi.achievement.toFixed(2)}%</TableCell>
                      <TableCell>{kpi.score.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow key={pillar.id}>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      {pillar.name} has not been assessed yet
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button asChild variant="outline">
          <Link to={`/assessment?buildingId=${building.id}`}>
            Update Assessment
          </Link>
        </Button>
      </div>
    </div>
  );
}
