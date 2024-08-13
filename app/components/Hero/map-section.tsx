import { LatLngTuple } from 'leaflet'
import React, { useEffect, useState } from 'react'

import { ClientOnly } from 'remix-utils/client-only'

const cityCoordinates: Record<string, LatLngTuple> = {
  metz: [49.1193, 6.1757],
  athens: [37.9838, 23.7275],
  jastrebarsko: [45.6693, 15.6459],
  riga: [56.9496, 24.1052],
  gdynia: [54.5189, 18.5305],
  valladolid: [41.6523, -4.7245],
  gotland: [57.5349, 18.2995],
  izmir: [38.4237, 27.1428],
}

export default function MapSection() {
  const [coords, setCoords] = useState<LatLngTuple>(cityCoordinates.metz ?? [0, 0]) // Default to Metz or [0, 0]

  return (
    <div className="flex h-screen w-full">
      <div className="flex-1 bg-muted">
        <div className="relative h-full w-full overflow-hidden">
          <ClientOnly fallback={<div>Loading map...</div>}>
            {() => <MapComponent coords={coords} />}
          </ClientOnly>
        </div>
      </div>
    </div>
  )
}

function MapFallback() {
  return <div className="h-full w-full bg-gray-200">Map loading...</div>
}

interface MapComponentProps {
  coords: LatLngTuple
}

function MapComponent({ coords }: MapComponentProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <MapFallback />
  }
  // Add this type annotation for the dynamically imported component
  const Map = React.lazy(() => import('./LeafletMap')) as React.ComponentType<MapComponentProps>
  
  return (
    <React.Suspense fallback={<div>Loading map...</div>}>
      <Map coords={coords} />
    </React.Suspense>
  )
}
