// app/routes/buildings+/$buildingId.tsx

import { json, type LoaderFunction } from '@remix-run/node'
import { useLoaderData, Link } from '@remix-run/react'
import { ChevronLeft, HomeIcon, Landmark } from 'lucide-react'
import { RadialBarChart, RadialBar, LabelList } from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '#app/components/ui/card.js'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '#app/components/ui/chart.js'
import { prisma } from '../../utils/db.server'
import { Button } from '../../components/ui/button'
import React from 'react'

type LoaderData = {
	building: {
		id: string
		name: string
		address: string
		pillars: Array<{
			id: string
			name: string
			score: number
			kpis: Array<{ currentValue: number }>
		}>
	}
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
						select: { currentValue: true },
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

export default function BuildingDetails() {
  const { building } = useLoaderData<LoaderData>()
  const isAssessed = (pillar: LoaderData['building']['pillars'][0]) =>
    pillar.kpis.some((kpi) => kpi.currentValue !== 0)
  const hasAnyAssessment = building.pillars.some(isAssessed)

  const chartData = building.pillars.map((pillar, index) => ({
    name: pillar.name,
    score: pillar.score,
    fill: `var(--color-chart-${index + 1})`,
  }))

  const chartConfig = building.pillars.reduce((config, pillar, index) => {
    config[pillar.name] = {
      label: pillar.name,
      color: `hsl(var(--chart-${index + 1}))`,
    }
    return config
  }, {} as ChartConfig)

	return (
		<div className="container mx-auto p-4">
			<Link to={`/buildings`} className='flex items-center gap-1 pb-4 hover:text-blue-500'>
      <ChevronLeft className="inline-block w-6 h-6" />
        Back to buildings
      </Link>

			<h1 className="mb-4 text-2xl font-bold flex items-center gap-2">
        <HomeIcon className="inline-block w-6 h-6" />
        {building.name}
        </h1>
			<p className="mb-4 text-gray-600 flex items-center gap-2">
        <Landmark className="inline-block w-6 h-6" />
        {building.address}
      </p>

			<h2 className="mb-2 text-xl font-semibold">Assessments</h2>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className='border border-slate-300 rounded-md p-4'>
          <ul className="space-y-2">
            {building.pillars.map((pillar) => (
              <li key={pillar.id} className="rounded border p-2">
                <span className="font-medium">{pillar.name}</span>:{' '}
                {pillar.score.toFixed(2)}
                <span className="ml-2 text-sm">
                  {isAssessed(pillar) ? '(Assessed)' : '(Not yet assessed)'}
                </span>
              </li>
            ))}
          </ul>
        </div>

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
      </div>

			<div className="mt-4 space-x-2">
				<Button asChild variant="default">
					<Link to={`/assessment?buildingId=${building.id}`}>
						{hasAnyAssessment ? 'Update Assessment' : 'Perform Assessment'}
					</Link>
				</Button>
        <Button asChild variant="secondary" disabled={!hasAnyAssessment}>
          <Link to="results">
            View Detailed Results
          </Link>
        </Button>
			</div>
		</div>
	)
}
