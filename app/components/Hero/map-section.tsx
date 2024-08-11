import React, { useState } from 'react'
import { ClientOnly } from 'remix-utils/client-only'

const cityCoordinates = {
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
  const [coords, setCoords] = useState(cityCoordinates.metz) // Default to Metz

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

function MapComponent({ coords }: any) {
  const Map = React.lazy(() => import('./LeafletMap.tsx'))
  
  return (
    <React.Suspense fallback={<div>Loading map...</div>}>
      <Map coords={coords} />
    </React.Suspense>
  )
}
