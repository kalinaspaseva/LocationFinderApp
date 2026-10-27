"use client"

import { useEffect, useRef } from "react"
import type { Location } from "@/app/page"

interface MapViewProps {
  locations: Location[]
  userLocation: { lat: number; lng: number } | null
  selectedLocation: Location | null
  onLocationSelect: (location: Location) => void
}

export function MapView({ locations, userLocation, selectedLocation, onLocationSelect }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      if (typeof window === "undefined") return

      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      // Load Leaflet JS
      const L = await import("leaflet")

      // Fix default marker icon issue with Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      // Initialize map
      if (mapRef.current && !mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current).setView([41.0082, 21.4254], 13)

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
        }).addTo(mapInstanceRef.current)
      }
    }

    loadLeaflet()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const updateMap = async () => {
      if (!mapInstanceRef.current) return

      const L = await import("leaflet")

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []

      // Add user location marker
      if (userLocation) {
        const userMarker = L.circleMarker([userLocation.lat, userLocation.lng], {
          radius: 8,
          fillColor: "#3b82f6",
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        }).addTo(mapInstanceRef.current)

        userMarker.bindPopup("<strong>Your Location</strong>")
        markersRef.current.push(userMarker)
      }

      // Add location markers
      if (locations.length > 0) {
        const bounds = L.latLngBounds([])

        locations.forEach((location) => {
          const marker = L.marker([location.latitude, location.longitude])
            .addTo(mapInstanceRef.current)
            .bindPopup(`<strong>${location.name}</strong><br/>${location.details}`)

          marker.on("click", () => {
            onLocationSelect(location)
          })

          markersRef.current.push(marker)
          bounds.extend([location.latitude, location.longitude])
        })

        if (userLocation) {
          bounds.extend([userLocation.lat, userLocation.lng])
        }

        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
      } else if (userLocation) {
        mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13)
      }
    }

    updateMap()
  }, [locations, userLocation, onLocationSelect])

  useEffect(() => {
    const highlightSelected = async () => {
      if (!mapInstanceRef.current || !selectedLocation) return

      const L = await import("leaflet")
      mapInstanceRef.current.setView([selectedLocation.latitude, selectedLocation.longitude], 15, {
        animate: true,
      })

      markersRef.current.forEach((marker) => {
        if (
          marker.getLatLng &&
          marker.getLatLng().lat === selectedLocation.latitude &&
          marker.getLatLng().lng === selectedLocation.longitude
        ) {
          marker.openPopup()
        }
      })
    }

    highlightSelected()
  }, [selectedLocation])

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />
      {!userLocation && locations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <p className="text-muted-foreground">Search for locations to see them on the map</p>
        </div>
      )}
    </div>
  )
}
