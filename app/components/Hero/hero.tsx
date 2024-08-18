import { Link } from "@remix-run/react";
import { FileWarning } from "lucide-react";
import { Badge } from "../ui/badge.tsx"
import { Button } from "../ui/button.tsx";
import MapSection from "./map-section.tsx";

export default function Hero() {

  return (
    <div className="font-poppins flex flex-col items-center justify-center min-h-screen p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Badge variant="destructive">Warning</Badge>
        <span className="text-sm text-muted-foreground">The assessment tool is still under development</span>
        <FileWarning className=" text-orange-400" size={24} />
      </div>
      <h1 className="text-5xl font-bold text-center mb-4">
      INHERIT <br /> assessment tool.
      </h1>
      <p className="text-center text-muted-foreground mb-8">
      Next-generation solutions for European cultural heritage buildings
      </p>
      <div className="flex space-x-4 mb-12">
        <Button asChild  variant="default" size="lg"><Link to="/login">Get started</Link></Button>
        <Button asChild variant="outline" size="lg"><Link to="/buildings">Start the assessment</Link></Button>
      </div>
      <div className="w-full overflow-hidden rounded-lg border border-gray-200 shadow-lg">
        <MapSection />
      </div>
    </div>
  )
}

