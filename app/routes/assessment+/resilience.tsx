// app/routes/assessment+/resilience.tsx

import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node'
import { useLoaderData, useActionData, Form, useNavigation, Link } from '@remix-run/react'
import { TrendingUp } from 'lucide-react'
import {
	PolarAngleAxis,
	PolarGrid,
	Radar,
	RadarChart,
	LineChart,
	XAxis,
	CartesianGrid,
	LabelList,
	Line,
} from 'recharts'
import { Button } from '../../components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card.js'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '../../components/ui/chart.js'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '../../components/ui/table'
import { prisma } from '../../utils/db.server'

interface KPIData {
	id: string
	name: string
	currentValue: number
	targetValue: number
	positiveContribution: number
	pillarWeight: number
	kpiWeight: number
	achievement: number
	score: number
}

const kpiDefinitions = [
	{
		id: 'hazard-inventory',
		name: 'Inventory of relevant Hazards',
		targetValue: 1,
		positiveContribution: 1,
		kpiWeight: 5.0,
	},
	{
		id: 'hazard-identification',
		name: 'Hazards Identification',
		targetValue: 1,
		positiveContribution: 1,
		kpiWeight: 5.0,
	},
	{
		id: 'risk-assessment',
		name: 'Risk Assessment and Management plans',
		targetValue: 1,
		positiveContribution: 1,
		kpiWeight: 5.0,
	},
	{
		id: 'risk-impact',
		name: 'Risk Impact assessment',
		targetValue: 100,
		positiveContribution: 1,
		kpiWeight: 5.0,
	},
	{
		id: 'risk-level',
		name: 'Risk impact Level evaluation',
		targetValue: 100,
		positiveContribution: 1,
		kpiWeight: 5.0,
	},
]

export const loader: LoaderFunction = async ({ request }) => {
	const url = new URL(request.url)
	const buildingId = url.searchParams.get('buildingId')

	if (!buildingId) {
		throw new Response('Building ID is required', { status: 400 })
	}

	const pillar = await prisma.pillar.findFirst({
		where: { buildingId, name: 'Resource Efficiency' },
		include: { kpis: true },
	})

	if (!pillar) {
		throw new Response(
			'Resource Efficiency pillar not found for this building',
			{ status: 404 },
		)
	}

	return json({ buildingId, pillar })
}

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData()
    const buildingId = formData.get("buildingId") as string
  
    if (!buildingId) {
      return json({ error: "Building ID is required" }, { status: 400 })
    }
  
    const pillar = await prisma.pillar.findFirst({
      where: { buildingId, name: "Climate Resilience" },
      include: { kpis: true },
    });
  
    if (!pillar) {
      return json({ error: "Climate Resilience pillar not found for this building" }, { status: 404 })
    }
  
    const kpiData = await Promise.all(kpiDefinitions.map(async (kpi) => {
      const currentValue = Number(formData.get(kpi.id))
      const achievement = calculateAchievement(
        currentValue,
        kpi.targetValue,
        kpi.positiveContribution,
      )
      const score = calculateScore(achievement, kpi.kpiWeight)
  
      let existingKPI = await prisma.kPI.findFirst({
        where: {
          pillarId: pillar.id,
          name: kpi.name,
        },
      })
  
      if (existingKPI) {
        existingKPI = await prisma.kPI.update({
          where: { id: existingKPI.id },
          data: {
            currentValue,
            score,
          },
        })
      } else {
        existingKPI = await prisma.kPI.create({
          data: {
            name: kpi.name,
            currentValue,
            targetValue: kpi.targetValue,
            positiveContribution: kpi.positiveContribution === 1,
            weight: kpi.kpiWeight,
            score,
            pillar: { connect: { id: pillar.id } },
          },
        })
      }
  
      return {
        ...kpi,
        currentValue,
        achievement,
        score,
      }
    }))
  
    const totalScore = kpiData.reduce((sum, kpi) => sum + kpi.score, 0)
    await prisma.pillar.update({
      where: { id: pillar.id },
      data: { score: totalScore },
    })
  
    return json({ kpiData, pillarScore: totalScore })
  }

function calculateAchievement(
	currentValue: number,
	targetValue: number,
	positiveContribution: number,
): number {
	return positiveContribution === 1
		? (currentValue / targetValue) * 100
		: (targetValue / currentValue) * 100
}

function calculateScore(achievement: number, weight: number): number {
	return (achievement / 100) * weight
}

export default function ResilienceAssessment() {
	const { buildingId, pillar } = useLoaderData<{
		buildingId: string
		pillar: any
	}>()
	const actionData = useActionData<{ kpiData: any[] }>()
	const navigation = useNavigation()
	const isSubmitting = navigation.state === 'submitting'

	const initialKpiData: Record<string, number> = pillar.kpis.reduce(
		(acc: Record<string, number>, kpi: KPIData) => {
			acc[kpi.name] = kpi.currentValue
			return acc
		},
		{},
	)

	const radarChartData =
		actionData?.kpiData.map((kpi) => ({
			kpi: kpi.name,
			achievement: kpi.achievement,
		})) || []

	const chartConfig = {
		achievement: {
			label: 'Achievement (%)',
			color: 'hsl(var(--chart-1))',
		},
	} satisfies ChartConfig

	return (
		<div className="container mx-auto p-4">
			<h1 className="mb-4 text-2xl font-bold">
				Resource Efficiency Assessment
			</h1>

			{!actionData ? (
				<Form method="post" className="space-y-4">
					<input type="hidden" name="buildingId" value={buildingId} />

					{kpiDefinitions.map((kpi) => (
						<div key={kpi.id}>
							<Label htmlFor={kpi.id}>{kpi.name}</Label>
							<Input
								type="number"
								id={kpi.id}
								name={kpi.id}
								defaultValue={initialKpiData[kpi.name] || ''}
								required
							/>
						</div>
					))}

					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Calculating...' : 'Calculate Scores'}
					</Button>
				</Form>
			) : (
				<div className="space-y-8">
					<Link to={`/buildings/${buildingId}`}>
						<Button variant="outline" className="mt-4">
							Back to Building
						</Button>
					</Link>
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
					<div className="space-y-8">
						<Card>
							<CardHeader className="items-center">
								<CardTitle>KPI Achievement Radar Chart</CardTitle>
								<CardDescription>
									Showing achievement percentages for all KPIs
								</CardDescription>
							</CardHeader>
							<CardContent className="pb-0">
								<ChartContainer
									config={chartConfig}
									className="mx-auto aspect-square max-h-[500px]"
								>
									<RadarChart data={radarChartData}>
										<ChartTooltip
											cursor={false}
											content={<ChartTooltipContent />}
										/>
										<PolarAngleAxis dataKey="kpi" />
										<PolarGrid />
										<Radar
											dataKey="achievement"
											fill="var(--color-achievement)"
											fillOpacity={0.6}
											dot={{
												r: 4,
												fillOpacity: 1,
											}}
										/>
									</RadarChart>
								</ChartContainer>
							</CardContent>
							<CardFooter className="flex-col gap-2 text-sm">
								<div className="flex items-center gap-2 leading-none text-muted-foreground">
									KPI Achievement Percentages
								</div>
							</CardFooter>
						</Card>

						<h2 className="mb-4 mt-8 text-xl font-bold">KPI Trends</h2>
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							{actionData.kpiData.map((kpi) => (
								<KPILineChart key={kpi.id} kpi={kpi} />
							))}
						</div>
					</div>

					<Link to={`/buildings/${buildingId}`}>
						<Button variant="outline">Back to Building</Button>
					</Link>
				</div>
			)}
		</div>
	)
}

interface KPILineChartProps {
	kpi: {
		id: string
		name: string
		currentValue: number
	}
}

export function KPILineChart({ kpi }: KPILineChartProps) {
	// Generate simulated historical data
	const chartData = [
		{ month: 'January', value: kpi.currentValue * 0.9 },
		{ month: 'February', value: kpi.currentValue * 0.95 },
		{ month: 'March', value: kpi.currentValue * 0.98 },
		{ month: 'April', value: kpi.currentValue * 0.99 },
		{ month: 'May', value: kpi.currentValue * 1.0 },
		{ month: 'June', value: kpi.currentValue },
	]

	const chartConfig = {
		value: {
			label: kpi.name,
			color: 'hsl(var(--chart-1))',
		},
	} satisfies ChartConfig

	return (
		<Card>
			<CardHeader>
				<CardTitle>{kpi.name}</CardTitle>
				<CardDescription>January - June 2024</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig}>
					<LineChart
						accessibilityLayer
						data={chartData}
						margin={{
							top: 20,
							left: 12,
							right: 12,
						}}
					>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="month"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={(value) => value.slice(0, 3)}
						/>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent indicator="line" />}
						/>
						<Line
							dataKey="value"
							type="natural"
							stroke="var(--color-value)"
							strokeWidth={2}
							dot={{
								fill: 'var(--color-value)',
							}}
							activeDot={{
								r: 6,
							}}
						>
							<LabelList
								position="top"
								offset={12}
								className="fill-foreground"
								fontSize={12}
							/>
						</Line>
					</LineChart>
				</ChartContainer>
			</CardContent>
			<CardFooter className="flex-col items-start gap-2 text-sm">
				<div className="flex gap-2 font-medium leading-none">
					Current value: {kpi.currentValue.toFixed(2)}{' '}
					<TrendingUp className="h-4 w-4" />
				</div>
				<div className="leading-none text-muted-foreground">
					Showing simulated trend for the last 6 months
				</div>
			</CardFooter>
		</Card>
	)
}
