// app/routes/buildings+/$buildingId.results.tsx
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {building.pillars.map((pillar) => (
          <Card key={pillar.id}>
            <CardHeader>
              <CardTitle>{pillar.name}</CardTitle>
              <CardDescription>Score: {pillar.score.toFixed(2)}</CardDescription>
            </CardHeader>
            <CardContent>
              {pillar.kpis.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <RadarChart data={pillar.kpis}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <Radar
                      name={pillar.name}
                      dataKey="achievement"
                      stroke={`hsl(var(--chart-${building.pillars.indexOf(pillar) + 1}))`}
                      fill={`hsl(var(--chart-${building.pillars.indexOf(pillar) + 1}))`}
                      fillOpacity={0.6}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </RadarChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] bg-gray-100 rounded-md">
                  <p className="text-gray-500">Not yet assessed</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col space-y-6">
        {building.pillars.map((pillar) => (
          <Card key={pillar.id}>
            <CardHeader>
              <CardTitle>{pillar.name} KPI Summary</CardTitle>
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
                  {pillar.kpis.length > 0 ? (
                    pillar.kpis.map((kpi) => (
                      <TableRow key={kpi.id}>
                        <TableCell>{kpi.name}</TableCell>
                        <TableCell>{kpi.currentValue.toFixed(2)}</TableCell>
                        <TableCell>{kpi.targetValue.toFixed(2)}</TableCell>
                        <TableCell>{kpi.achievement.toFixed(2)}%</TableCell>
                        <TableCell>{kpi.score.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">
                        No KPIs assessed yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

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
