import { type MetaFunction } from '@remix-run/node'
import Hero from '../../components/Hero/hero.tsx'


export const meta: MetaFunction = () => [{ title: 'Inherit project' }]

export default function Index() {
	return (
		<main className="font-poppins grid w-full h-full">
				<Hero />
			{/* <div className="grid place-items-center px-4 py-16 xl:grid-cols-2 xl:gap-24">
			</div> */}
		</main>
	)
}
