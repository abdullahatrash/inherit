import { type MetaFunction } from '@remix-run/node'
import Hero from '../../components/Hero/hero.tsx'

export const meta: MetaFunction = () => [{ title: 'Inherit project' }]

export default function Index() {
	return (
		<main className="font-poppins grid h-full w-full">
			<Hero />
		</main>
	)
}
