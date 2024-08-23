import { json, type LoaderFunction } from '@remix-run/node'
import { useLoaderData, Link } from '@remix-run/react'
import { ChevronLeft, HomeIcon, Landmark, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import {
	RadialBarChart,
	RadialBar,
	LabelList,
	Bar,
	XAxis,
	BarChart,
} from 'recharts'
import { Button } from '../../components/ui/button'
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from '../../components/ui/card'
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '../../components/ui/chart'
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from '../../components/ui/tabs'
import { prisma } from '../../utils/db.server'

type KPI = {
	name: string
	currentValue: number
	score: number
}

type Pillar = {
	id: string
	name: string
	score: number
	kpis: KPI[]
}

type Building = {
	id: string
	name: string
	address: string
	pillars: Pillar[]
}

type LoaderData = {
	building: Building
}

export const loader: LoaderFunction = async ({ params }) => {
	const building = await prisma.building.findUnique({
		where: { id: params.buildingId },
		include: {
			pillars: {
				select: {
					id: true,
					name: true,
					score: true,
					kpis: {
						select: { name: true, currentValue: true, score: true },
					},
				},
			},
		},
	})

	if (!building) {
		throw new Response('Not Found', { status: 404 })
	}

	return json({ building })
}

type PillarCardProps = {
	pillar: Pillar
	onClick: (pillar: Pillar) => void
	isSelected?: boolean // Add a question mark to make it an optional prop
}

const PillarCard: React.FC<PillarCardProps> = ({
	pillar,
	onClick,
	isSelected = false, // Provide a default value for isSelected
}) => {
	const isAssessed = pillar.kpis.some((kpi) => kpi.currentValue !== 0)

	return (
		<Card
			key={pillar.id}
			className={`cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
			onClick={() => onClick(pillar)}
		>
			<CardHeader>
				<CardTitle>{pillar.name}</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-2xl font-bold">{pillar.score.toFixed(2)}</p>
				<p className="text-sm text-muted-foreground">
					{isAssessed ? 'Assessed' : 'Not yet assessed'}
				</p>
			</CardContent>
		</Card>
	)
}

type KPIListProps = {
	pillar: Pillar
}

const KPIList: React.FC<KPIListProps> = ({ pillar }) => {
	const isAssessed = pillar.kpis.some((kpi) => kpi.currentValue !== 0)

	return (
		<Card className="mt-4">
			<CardHeader>
				<CardTitle>{pillar.name} KPIs</CardTitle>
			</CardHeader>
			<CardContent>
				{isAssessed ? (
					<ul className="space-y-2">
						{pillar.kpis.map((kpi, index) => (
							<li key={index} className="flex justify-between">
								<span>{kpi.name}</span>
								<span>
									{kpi.currentValue.toFixed(2)} (Score: {kpi.score.toFixed(2)})
								</span>
							</li>
						))}
					</ul>
				) : (
					<div className="flex items-center space-x-2 text-yellow-500">
						<AlertCircle className="h-5 w-5" />
						<p>
							This pillar has not been assessed yet. Please perform an
							assessment to view KPIs.
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export default function BuildingDetails() {
	const { building } = useLoaderData<LoaderData>()
	const [activeTab, setActiveTab] = useState<string>('pillars')
	const [selectedPillar, setSelectedPillar] = useState<Pillar | undefined>(
		building.pillars[0] || undefined,
	)
	const hasAnyAssessment = building.pillars.some((pillar) =>
		pillar.kpis.some((kpi) => kpi.currentValue !== 0),
	)

	const chartData = building.pillars.map((pillar, index) => ({
		name: pillar.name,
		score: pillar.score,
		fill: `var(--color-chart-${index + 1})`,
		totalWeight: 25, // Assuming each pillar has a total weight of 25
		remainingWeight: 25 - pillar.score, // Calculate the remaining weight
	}))

	const chartConfig: ChartConfig = building.pillars.reduce(
		(config, pillar, index) => {
			config[pillar.name] = {
				label: pillar.name,
				color: `hsl(var(--chart-${index + 1}))`,
			}
			return config
		},
		{} as ChartConfig,
	)

	const handlePillarClick = (pillar: Pillar) => {
		setSelectedPillar(pillar)
	}

	return (
		<div className="container mx-auto p-4">
			<Link
				to={`/buildings`}
				className="flex items-center gap-1 pb-4 hover:text-blue-500"
			>
				<ChevronLeft className="inline-block h-6 w-6" />
				Back to buildings
			</Link>

			<h1 className="mb-4 flex items-center gap-2 text-2xl font-bold">
				<HomeIcon className="inline-block h-6 w-6" />
				{building.name}
			</h1>
			<p className="mb-4 flex items-center gap-2 text-gray-600">
				<Landmark className="inline-block h-6 w-6" />
				{building.address}
			</p>

			<Tabs
				value={activeTab}
				onValueChange={(value: string) => setActiveTab(value)}
				className="mb-6 w-full"
			>
				<TabsList>
					<TabsTrigger value="pillars">Pillars Overview</TabsTrigger>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
					<TabsTrigger value="reports">Reports</TabsTrigger>
				</TabsList>
				<TabsContent value="pillars" className="mt-6">
					<h2 className="mb-2 text-xl font-semibold">Assessments</h2>
					<div className="mt-4 space-x-2">
						<Button asChild variant="default">
							<Link to={`/assessment?buildingId=${building.id}`}>
								{hasAnyAssessment ? 'Update Assessment' : 'Perform Assessment'}
							</Link>
						</Button>
						<Button asChild variant="secondary" disabled={!hasAnyAssessment}>
							<Link to="results">View Detailed Results</Link>
						</Button>
					</div>
					<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{building.pillars.map((pillar) => (
							<PillarCard
								key={pillar.id}
								pillar={pillar}
								onClick={handlePillarClick}
								isSelected={selectedPillar && selectedPillar.id === pillar.id}
							/>
						))}
					</div>
					{selectedPillar && <KPIList pillar={selectedPillar} />}
				</TabsContent>

				<TabsContent value="analytics">
					<h2 className="mb-2 text-xl font-semibold">Analytics</h2>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Card>
							<CardHeader className="items-center pb-0">
								<CardTitle>Pillar Scores</CardTitle>
								<CardDescription>Radial Chart Visualization</CardDescription>
							</CardHeader>
							<CardContent className="flex-1 pb-0">
								<ChartContainer
									config={chartConfig}
									className="mx-auto aspect-square max-h-[300px]"
								>
									<RadialBarChart
										data={chartData}
										startAngle={0}
										endAngle={360}
										innerRadius="10%"
										outerRadius="80%"
									>
										<ChartTooltip
											cursor={false}
											content={<ChartTooltipContent hideLabel nameKey="name" />}
										/>
										<RadialBar dataKey="score" background>
											<LabelList
												position="insideStart"
												dataKey="name"
												className="fill-white capitalize mix-blend-luminosity"
												fontSize={11}
											/>
										</RadialBar>
									</RadialBarChart>
								</ChartContainer>
							</CardContent>
							<CardFooter className="flex-col gap-2 text-sm">
								<div className="leading-none text-muted-foreground">
									Showing scores for all pillars
								</div>
							</CardFooter>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Pillar Scores vs Total Weight</CardTitle>
								<CardDescription>
									Comparing assessed scores to the total weight of 25 for each
									pillar.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<ChartContainer config={chartConfig}>
									<BarChart data={chartData} layout="horizontal" height={300}>
										<XAxis
											dataKey="name"
											type="category"
											tickLine={false}
											tickMargin={10}
											axisLine={false}
										/>
										<ChartTooltip
											content={<ChartTooltipContent />}
											cursor={false}
										/>
										<Bar
											dataKey="score"
											stackId="a"
											fill="var(--chart-1)"
											name="Assessed Score"
										/>
										<Bar
											dataKey="remainingWeight"
											stackId="a"
											fill="var(--chart-2)"
											name="Remaining Weight"
										/>
									</BarChart>
								</ChartContainer>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="reports">
					<h2 className="mb-2 text-xl font-semibold">Reports</h2>
					<p>Reports content will be displayed here.</p>
				</TabsContent>
			</Tabs>
		</div>
	)
}
