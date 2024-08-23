import { Link } from '@remix-run/react'
import { BarChart3, Building2, Home, Info } from 'lucide-react'

export default function BuildingSidebar() {
    return (
        <div className="w-64 bg-white borde border-r-2 border-slate-50">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Buildings dasboard</h1>
          <nav>
            <Link to="/" className="flex items-center py-2 px-4 text-gray-700 hover:bg-gray-200 rounded">
              <Home className="mr-2" size={20} />
              Home
            </Link>
            <Link to="/buildings" className="flex items-center py-2 px-4 bg-gray-200 text-gray-700 rounded">
              <Building2 className="mr-2" size={20} />
              Buildings
            </Link>
            <Link to="/pillar-information" className="flex items-center py-2 px-4 text-gray-700 hover:bg-gray-200 rounded">
              <Info className="mr-2" size={20} />
              Pillar Information
            </Link>
            <Link to="/scoring-system" className="flex items-center py-2 px-4 text-gray-700 hover:bg-gray-200 rounded">
              <BarChart3 className="mr-2" size={20} />
              Scoring system
            </Link>
          </nav>
        </div>
      </div>
    )
}
