// app/routes/assessment+/accessibility.tsx

import {
	json,
	type LoaderFunction,
	type ActionFunction,
	createCookieSessionStorage,
} from '@remix-run/node'
import {
	useLoaderData,
	useActionData,
	Form,
	useNavigation,
	Link,
} from '@remix-run/react'
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
import { z } from 'zod'
import { Button } from '../../components/ui/button'
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from '../../components/ui/card.js'
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '../../components/ui/chart.js'
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
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '../../components/ui/tooltip.js'
import { prisma } from '../../utils/db.server'

const { getSession, commitSession } = createCookieSessionStorage({
	cookie: {
		name: 'energy_performance_session',
		secrets: ['s3cr3t'], // replace this with an actual secret
		sameSite: 'lax',
	},
})

// interface KPIData {
// 	id: string
// 	name: string
// 	currentValue: number
// 	targetValue: number
// 	positiveContribution: number
// 	pillarWeight: number
// 	kpiWeight: number
// 	achievement: number
// 	score: number
// }

const kpiDefinitions = [
    {
        id: 'accessibility-level',
        name: 'Accessibility level (FAS)',
        targetValue: 1.0,
        positiveContribution: 1,
        kpiWeight: 2.8,
        explanation: 'Measures the level of accessibility in the facility.',
    },
    {
        id: 'inclusiveness-level',
        name: 'Inclusiveness level (FAS)',
        targetValue: 1.0,
        positiveContribution: 1,
        kpiWeight: 2.8,
        explanation: 'Measures the level of inclusiveness in the facility.',
    },
    {
        id: 'direct-revenue',
        name: 'Direct revenue from tourism',
        targetValue: 1.0,
        positiveContribution: 1,
        kpiWeight: 2.8,
        explanation: 'Measures the direct revenue generated from tourism.',
    },
    {
        id: 'indirect-revenue',
        name: 'Indirect revenue through tourism attraction',
        targetValue: 1.0,
        positiveContribution: 1,
        kpiWeight: 2.8,
        explanation: 'Measures the indirect revenue generated through tourism attraction.',
    },
    {
        id: 'property-value',
        name: 'Increased property value',
        targetValue: 1.0,
        positiveContribution: 1,
        kpiWeight: 2.8,
        explanation: 'Measures the increase in property value.',
    },
    {
        id: 'local-jobs',
        name: 'Number of local jobs created',
        targetValue: 1.0,
        positiveContribution: 1,
        kpiWeight: 2.8,
        explanation: 'Measures the number of local jobs created.',
    },
    {
        id: 'public-investment',
        name: 'Investment in public infrastructure',
        targetValue: 1.0,
        positiveContribution: 1,
        kpiWeight: 2.8,
        explanation: 'Measures the investment in public infrastructure.',
    },
    {
        id: 'cultural-enrichment',
        name: 'Cultural enrichment',
        targetValue: 1.0,
        positiveContribution: 1,
        kpiWeight: 2.8,
        explanation: 'Measures the level of cultural enrichment.',
    },
    {
        id: 'public-perception',
        name: 'Public perception',
        targetValue: 1.0,
        positiveContribution: 1,
        kpiWeight: 2.8,
        explanation: 'Measures the public perception of the facility.',
    },
]

function getKPIExplanation(kpiId: string): string {
    const kpi = kpiDefinitions.find((kpi) => kpi.id === kpiId)
    return kpi ? kpi.explanation : 'No explanation available.'
}

const kpiValidationSchema = z.object({
	'accessibility-level': z.coerce
		.number()
		.min(0)
		.max(1)
		.describe('Accessibility level (FAS)'),
	'inclusiveness-level': z.coerce
		.number()
		.min(0)
		.max(1)
		.describe('Inclusiveness level (FAS)'),
	'direct-revenue': z.coerce
		.number()
		.min(0)
		.max(1)
		.describe('Direct revenue from tourism'),
	'indirect-revenue': z.coerce
		.number()
		.min(0)
		.max(1)
		.describe('Indirect revenue through tourism attraction'),
	'property-value': z.coerce
		.number()
		.min(0)
		.max(1)
		.describe('Increased property value'),
	'local-jobs': z.coerce
		.number()
		.min(0)
		.max(1)
		.describe('Number of local jobs created'),
	'public-investment': z.coerce
		.number()
		.min(0)
		.max(1)
		.describe('Investment in public infrastructure'),
	'cultural-enrichment': z.coerce
		.number()
		.min(0)
		.max(1)
		.describe('Cultural enrichment'),
	'public-perception': z.coerce
		.number()
		.min(0)
		.max(1)
		.describe('Public perception'),
})

type ValidatedFormData = z.infer<typeof kpiValidationSchema>

interface LoaderData {
	buildingId: string
	pillar: {
		id: string
		name: string
		kpis: Array<{
			id: string
			name: string
			currentValue: number
			targetValue: number
			positiveContribution: boolean
			weight: number
			score: number
			pillarId: string
		}>
	}
}

export const loader: LoaderFunction = async ({ request }) => {
	const url = new URL(request.url)
	const buildingId = url.searchParams.get('buildingId')

	if (!buildingId) {
		throw new Response('Building ID is required', { status: 400 })
	}

	const pillar = await prisma.pillar.findFirst({
		where: { buildingId, name: 'Energy Performance' },
		include: { kpis: true },
	})

	if (!pillar) {
		throw new Response('Accessibility pillar not found for this building', {
			status: 404,
		})
	}

	const session = await getSession(request.headers.get('Cookie'))
	const previousValues = session.get('previousValues') || {}

	return json(
		{ buildingId, pillar, previousValues },
		{
			headers: {
				'Set-Cookie': await commitSession(session),
			},
		},
	)
}

interface ActionData {
	errors?: Record<string, string[]>
	kpiData?: Array<{
		id: string
		name: string
		currentValue: number
		targetValue: number
		positiveContribution: number
		kpiWeight: number
		achievement: number
		score: number
	}>
	pillarScore?: number
}

export const action: ActionFunction = async ({
	request,
}): Promise<Response> => {
	const formData = await request.formData()
	const buildingId = formData.get('buildingId') as string

	if (!buildingId) {
		return json({ error: 'Building ID is required' }, { status: 400 })
	}

	const rawFormData = Object.fromEntries(formData.entries())
	const session = await getSession(request.headers.get('Cookie'))

	try {
		const validatedData = kpiValidationSchema.parse(rawFormData)

		const pillar = await prisma.pillar.findFirst({
			where: { buildingId, name: 'Energy Performance' },
			include: { kpis: true },
		})

		if (!pillar) {
			return json(
				{ error: 'Energy Performance pillar not found for this building' },
				{ status: 404 },
			)
		}

		let totalScore = 0
		const kpiData = await Promise.all(
			kpiDefinitions.map(async (kpi) => {
				const currentValue = validatedData[
					kpi.id as keyof ValidatedFormData
				] as number
				const achievement = calculateAchievement(
					currentValue,
					kpi.targetValue,
					kpi.positiveContribution,
				)
				const score = calculateScore(achievement, kpi.kpiWeight)
				totalScore += score

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
							achievement,
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
							achievement,
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
			}),
		)

		await prisma.pillar.update({
			where: { id: pillar.id },
			data: { score: totalScore },
		})

		// If successful, clear the previous values from the session
		session.unset('previousValues')
		return json(
			{ kpiData, pillarScore: totalScore },
			{
				headers: {
					'Set-Cookie': await commitSession(session),
				},
			},
		)
	} catch (error) {
		if (error instanceof z.ZodError) {
			// Store the submitted values in the session
			session.set('previousValues', rawFormData)
			return json(
				{ errors: error.flatten().fieldErrors },
				{
					status: 400,
					headers: {
						'Set-Cookie': await commitSession(session),
					},
				},
			)
		}
		return json({ error: 'An unexpected error occurred' }, { status: 500 })
	}
}
function calculateAchievement(
	current: number,
	target: number,
	positiveContribution: number,
): number {
	return positiveContribution === 1
		? (current / target) * 100
		: (target / current) * 100
}

function calculateScore(achievement: number, kpiWeight: number): number {
	return (achievement / 100) * kpiWeight
}

export default function AccessibilityAssessment() {
	const { buildingId, pillar } = useLoaderData<LoaderData | undefined>()
	const actionData = useActionData<ActionData>()
	const navigation = useNavigation()
	const isSubmitting = navigation.state === 'submitting'

	const previousValues =
		useLoaderData<Record<string, string>>()?.previousValues || {}

	const radarChartData = (actionData?.kpiData ?? []).map((kpi) => ({
		kpi: kpi.name,
		achievement: kpi.achievement,
	}))

	const chartConfig = {
		achievement: {
			label: 'Achievement (%)',
			color: 'hsl(var(--chart-1))',
		},
	} satisfies ChartConfig

	return (
		<div className="container mx-auto p-4">
			<h1 className="mb-4 text-2xl font-bold">Energy Performance Assessment</h1>

			{isSubmitting ? (
				<p>Calculating...</p>
			) : !actionData?.kpiData ? (
				<Form
					method="post"
					className="space-y-4 rounded-md border border-slate-100 p-4"
				>
					<input type="hidden" name="buildingId" value={buildingId} />
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						{kpiDefinitions.map((kpi) => (
							<div key={kpi.id} className="contents">
								<div className="space-y-2">
									<Label className="flex items-center" htmlFor={kpi.id}>
										{kpi.name}
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger>
													<InfoIcon className="h-6 w-6" />
												</TooltipTrigger>
												<TooltipContent>
													Target value {kpi.targetValue}
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</Label>
									<Input
										type="number"
										id={kpi.id}
										name={kpi.id}
										defaultValue={
											(previousValues as Record<string, string>)[kpi.id] ||
											pillar.kpis
												.find((k) => k.name === kpi.name)
												?.currentValue?.toString() ||
											''
										}
										required
										step="0.01"
									/>
									{actionData?.errors?.[kpi.id] && (
										<p className="text-sm text-red-500">
											{actionData.errors[kpi.id]}
										</p>
									)}
								</div>
								<div className="space-y-2">
									<h3 className="font-semibold">{kpi.name} Explanation</h3>
									<p className="text-sm text-gray-600">
										{getKPIExplanation(kpi.id)}
									</p>
								</div>
							</div>
						))}
					</div>
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
							<p className="mt-4 font-bold">
								Total Pillar Score:{' '}
								{actionData.pillarScore?.toFixed(4) ?? 'N/A'}
							</p>
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
						<Button variant="outline" className="mt-4">
							Back to Building
						</Button>
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
