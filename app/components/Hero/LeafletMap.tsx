import React, { useEffect, useState } from 'react'
import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	useMap,
	SVGOverlay,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { LandPlot } from 'lucide-react'
import { Button } from '../ui/button'

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

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

// Add SVG images for each city
const citySVGs = {
	metz: (
		<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
			<circle
				cx="50"
				cy="50"
				r="45"
				fill="#FFD700"
				stroke="#000"
				strokeWidth="2"
			/>
			<text x="50" y="55" fontSize="20" textAnchor="middle" fill="#000">
				Metz
			</text>
		</svg>
	),
	athens: (
		<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
			<circle
				cx="50"
				cy="50"
				r="45"
				fill="#FFD700"
				stroke="#000"
				strokeWidth="2"
			/>
			<text x="50" y="55" fontSize="16" textAnchor="middle" fill="#000">
				Athens
			</text>
		</svg>
	),
	jastrebarsko: (
		<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
			<circle
				cx="50"
				cy="50"
				r="45"
				fill="#FFD700"
				stroke="#000"
				strokeWidth="2"
			/>
			<text x="50" y="55" fontSize="16" textAnchor="middle" fill="#000">
				jastrebarsko
			</text>
		</svg>
	),
	riga: (
		<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
			<circle
				cx="50"
				cy="50"
				r="45"
				fill="#FFD700"
				stroke="#000"
				strokeWidth="2"
			/>
			<text x="50" y="55" fontSize="16" textAnchor="middle" fill="#000">
				riga
			</text>
		</svg>
	),
	gdynia: (
		<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
			<circle
				cx="50"
				cy="50"
				r="45"
				fill="#FFD700"
				stroke="#000"
				strokeWidth="2"
			/>
			<text x="50" y="55" fontSize="16" textAnchor="middle" fill="#000">
				gdynia
			</text>
		</svg>
	),
	valladolid: (
		<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
			<circle
				cx="50"
				cy="50"
				r="45"
				fill="#FFD700"
				stroke="#000"
				strokeWidth="2"
			/>
			<text x="50" y="55" fontSize="16" textAnchor="middle" fill="#000">
				valladolid
			</text>
		</svg>
	),
	gotland: (
		<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
			<circle
				cx="50"
				cy="50"
				r="45"
				fill="#FFD700"
				stroke="#000"
				strokeWidth="2"
			/>
			<text x="50" y="55" fontSize="16" textAnchor="middle" fill="#000">
				gotland
			</text>
		</svg>
	),
	izmir: (
		<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
			<circle
				cx="50"
				cy="50"
				r="45"
				fill="#FFD700"
				stroke="#000"
				strokeWidth="2"
			/>
			<text x="50" y="55" fontSize="16" textAnchor="middle" fill="#000">
				izmir
			</text>
		</svg>
	),
	// Add SVGs for other cities here...
}

function LeafletIconFix() {
	useEffect(() => {
		delete (L.Icon.Default.prototype as any)._getIconUrl

		L.Icon.Default.mergeOptions({
			iconRetinaUrl,
			iconUrl,
			shadowUrl,
		})
	}, [])

	return null
}

function FlyToLocation({ coords }) {
	const map = useMap()

	useEffect(() => {
		if (coords) {
			map.flyTo(coords, 13, {
				animate: true,
				duration: 1.5,
			})
		}
	}, [coords, map])

	return null
}

import { LatLngTuple } from 'leaflet'

function LeafletMap({ coords }: { coords: [number, number] }) {
	const svgSize = 0.02 // 0.01 degrees is about 1km
	return (
		<MapContainer
			center={coords}
			zoom={13}
			scrollWheelZoom={false}
			style={{ height: '100%', width: '100%' }}
		>
			<LeafletIconFix />
			<FlyToLocation coords={coords} />
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			{Object.entries(cityCoordinates).map(([city, cityCoords]) => (
				<React.Fragment key={city}>
					<Marker position={cityCoords}>
						<Popup>
							{city.charAt(0).toUpperCase() + city.slice(1)}
							<br />
							Coordinates: {cityCoords[0]}, {cityCoords[1]}
						</Popup>
					</Marker>
					<SVGOverlay
						bounds={[
							[cityCoords[0] - svgSize / 2, cityCoords[1] - svgSize / 2],
							[cityCoords[0] + svgSize / 2, cityCoords[1] + svgSize / 2],
						]}
					>
						{citySVGs[city] || (
							<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
								<circle
									cx="50"
									cy="50"
									r="45"
									fill="#808080"
									stroke="#000"
									strokeWidth="2"
								/>
								<text
									x="50"
									y="55"
									fontSize="16"
									textAnchor="middle"
									fill="#FFF"
								>
									{city}
								</text>
							</svg>
						)}
					</SVGOverlay>
				</React.Fragment>
			))}
		</MapContainer>
	)
}

export default function MapSection() {
	const [coords, setCoords] = useState(cityCoordinates.metz) // Default to Metz

	return (
		<div className="flex h-screen w-full">
			<aside className="flex flex-col items-start gap-4 border-r bg-background p-4 sm:w-64 md:w-72 lg:w-80">
				<h2 className="text-2xl font-bold">Pilot cities</h2>
				<nav className="flex w-full flex-col items-start gap-2">
					{Object.entries(cityCoordinates).map(([city, coordinates]) => (
						<Button
							key={city}
							variant="outline"
							size="sm"
							className="w-full items-center justify-start"
							onClick={() => setCoords(coordinates)}
						>
							<LandPlot className="mr-2 h-4 w-4" />
							{city.charAt(0).toUpperCase() + city.slice(1)}
						</Button>
					))}
				</nav>
			</aside>
			<div className="flex-1 bg-muted">
				<div className="relative h-full w-full overflow-hidden">
					<LeafletMap coords={coords} />
				</div>
			</div>
		</div>
	)
}
