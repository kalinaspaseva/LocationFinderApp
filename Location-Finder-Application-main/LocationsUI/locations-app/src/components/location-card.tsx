"use client"

import { MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { Location } from "@/app/page"

interface LocationCardProps {
  location: Location
  isSelected: boolean
  onClick: () => void
}

export function LocationCard({ location, isSelected, onClick }: LocationCardProps) {
  return (
    <Card
      className={`cursor-pointer p-4 transition-all hover:shadow-md ${isSelected ? "border-primary bg-primary/5" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={`rounded-full p-2 ${isSelected ? "bg-primary" : "bg-muted"}`}>
          <MapPin className={`h-4 w-4 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{location.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{location.details}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </p>
        </div>
      </div>
    </Card>
  )
}
