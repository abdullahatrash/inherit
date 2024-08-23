import { Button } from './ui/button'

export default function BuildingTopNavigation() {
    return (
        <div className="space-x-4 border border-slate-200 rounded-md p-2">
        <Button variant="secondary" className="bg-gray-200">Buildings</Button>
        <Button variant="ghost">Scoring System</Button>
        <Button variant="ghost">Pillars</Button>
      </div>
    )
}
