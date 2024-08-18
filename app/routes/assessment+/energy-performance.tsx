import { json, type ActionFunction } from '@remix-run/node'
import { Form, useActionData, useNavigation } from '@remix-run/react'
import { InfoIcon, TrendingUp } from 'lucide-react'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '#app/components/ui/tooltip.js'
import { Button } from '../../components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '../../components/ui/card'
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '../../components/ui/chart'
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
		id: 'energy-total',
		name: 'Energy intensity (total)',
		targetValue: 30,
		positiveContribution: 0,
		kpiWeight: 1.25,
	},
	{
		id: 'energy-heating',
		name: 'Energy intensity (heating)',
		targetValue: 12,
		positiveContribution: 0,
		kpiWeight: 1.25,
	},
	{
		id: 'energy-cooling',
		name: 'Energy intensity (cooling)',
		targetValue: 8,
		positiveContribution: 0,
		kpiWeight: 1.25,
	},
	{
		id: 'energy-lighting',
		name: 'Energy intensity (lighting)',
		targetValue: 5,
		positiveContribution: 0,
		kpiWeight: 1.25,
	},
	{
		id: 'energy-other',
		name: 'Energy intensity (other uses)',
		targetValue: 4,
		positiveContribution: 0,
		kpiWeight: 1.25,
	},
	{
		id: 'energy-res',
		name: 'Energy produced from RES',
		targetValue: 100,
		positiveContribution: 1,
		kpiWeight: 2.5,
	},
	{
		id: 'sri-total',
		name: 'Total Smart Readiness Indicator',
		targetValue: 100,
		positiveContribution: 1,
		kpiWeight: 1.67,
	},
	{
		id: 'sri-performance',
		name: 'Energy Performance & Operation (SRI)',
		targetValue: 100,
		positiveContribution: 1,
		kpiWeight: 1.67,
	},
	{
		id: 'sri-user-needs',
		name: 'Respond to User Needs (SRI)',
		targetValue: 100,
		positiveContribution: 1,
		kpiWeight: 1.67,
	},
	{
		id: 'energy-flexibility',
		name: 'Energy flexibility (SRI)',
		targetValue: 100,
		positiveContribution: 1,
		kpiWeight: 1.67,
	},
	{
		id: 'temp-frequency',
		name: 'Indoor Air Temperature Frequency',
		targetValue: 100,
		positiveContribution: 1,
		kpiWeight: 2.5,
	},
	{
		id: 'humidity-frequency',
		name: 'Indoor Humidity Frequency',
		targetValue: 100,
		positiveContribution: 1,
		kpiWeight: 2.5,
	},
	{
		id: 'co2-frequency',
		name: 'Indoor CO2 Concentration Frequency',
		targetValue: 100,
		positiveContribution: 1,
		kpiWeight: 2.5,
	},
	{
		id: 'illuminance-frequency',
		name: 'Illuminance Frequency',
		targetValue: 100,
		positiveContribution: 1,
		kpiWeight: 2.5,
	},
	{
		id: 'noise-frequency',
		name: 'Noise Level Frequency',
		targetValue: 100,
		positiveContribution: 1,
		kpiWeight: 2.5,
	},
]

export const action: ActionFunction = async ({ request }) => {
	const formData = await request.formData()
	const kpiData = kpiDefinitions.map((kpi) => {
		const currentValue = Number(formData.get(kpi.id))
		const achievement = calculateAchievement(
			currentValue,
			kpi.targetValue,
			kpi.positiveContribution,
		)
		const score = calculateScore(achievement, kpi.kpiWeight)
		return {
			...kpi,
			currentValue,
			achievement,
			score,
			pillarWeight: 25, // Assuming equal weight for all pillars
		}
	})

	return json({ kpiData })
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

export default function EnergyPerformanceAssessment() {
	const actionData = useActionData<{ kpiData: KPIData[] }>()
	const transition = useNavigation()
	const isSubmitting = transition.state === 'submitting'

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
			<h1 className="mb-4 text-2xl font-bold">Energy Performance Assessment</h1>

			{!actionData ? (
				<Form method="post" className="space-y-4 border border-slate-100 rounded-md p-4">

					{kpiDefinitions.map((kpi) => (
              <div key={kpi.id} className="flex flex-col">
                <Label className='pb-3 flex items-center' htmlFor={kpi.id}>
                  {kpi.name}
                  {/* <span className='ml-2 text-muted-foreground'>Current value</span> */}
                <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className='h-6 w-6' />
                  </TooltipTrigger>
                  <TooltipContent>Target value{' '}{kpi.targetValue}</TooltipContent>
                </Tooltip>
                </TooltipProvider>
                </Label>
                <Input className='w-96' type="number" id={kpi.id} name={kpi.id} required />
              </div>
					))}
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? 'Calculating...' : 'Calculate Scores'}
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
