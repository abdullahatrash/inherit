import { Link } from "@remix-run/react";
import { Badge } from "../ui/badge.tsx"
import { Button } from "../ui/button.tsx";
import MapSection from "./map-section.tsx";

export default function Hero() {

  return (
    <div className="font-poppins flex flex-col items-center justify-center min-h-screen p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Badge variant="secondary">New</Badge>
        <span className="text-sm text-muted-foreground">The assessment tool is under development</span>
        <ArrowRightIcon className="w-4 h-4 text-muted-foreground" />
      </div>
      <h1 className="text-5xl font-bold text-center mb-4">
      INHERIT <br /> assessment tool.
      </h1>
      <p className="text-center text-muted-foreground mb-8">
      Next-generation solutions for European cultural heritage buildings
      </p>
      <div className="flex space-x-4 mb-12">
        <Button asChild  variant="default" size="lg"><Link to="/login">Log In</Link></Button>
        <Button asChild variant="outline" size="lg"><Link to="/tos">How it works</Link></Button>
      </div>
      <div className="w-full overflow-hidden rounded-lg border border-gray-200 shadow-lg">
        <MapSection />
      </div>
    </div>
  )
}

interface ArrowRightIconProps {
    className?: string;
    width?: number;
    height?: number;
}

function ArrowRightIcon(props: ArrowRightIconProps) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width={props.width || 24}
            height={props.height || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
