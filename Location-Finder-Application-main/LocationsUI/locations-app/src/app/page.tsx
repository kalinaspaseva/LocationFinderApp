"use client"

import { useState } from "react"
import { MapView } from "@/components/map-view"
import { SearchBar } from "@/components/search-bar"
import { LocationCard } from "@/components/location-card"
import { Spinner } from "@/components/ui/spinner"
import { AIPanel } from "@/components/ai-panel"

// --- Types ---
export interface Location {
  name: string
  latitude: number
  longitude: number
  details: string
}

type FilterState = {
  distance: string
  price: string
  vibe: string
  activity: string
}

// --- Filter Configuration ---
const filterOptions = {
  distance: [
    { id: "any", label: "Any Distance", prompt: "" },
    { id: "under-2", label: "< 2 km", prompt: "Strictly find locations within 2 kilometers." },
    { id: "2-5", label: "2-5 km", prompt: "Find locations between 2km and 5km away." },
    { id: "over-5", label: "> 5 km", prompt: "Find locations further than 5km away." },
  ],
  price: [
    { id: "any", label: "Any Price", prompt: "" },
    { id: "cheap", label: "💵 Budget", prompt: "Focus on affordable and low-cost options." },
    { id: "luxury", label: "💎 Luxury", prompt: "Focus on high-end and premium experiences." },
  ],
  vibe: [
    { id: "any", label: "Any Vibe", prompt: "" },
    { id: "cozy", label: "🧸 Cozy", prompt: "Look for a cozy and relaxed atmosphere." },
    { id: "party", label: "🎉 Lively", prompt: "Look for a lively and energetic atmosphere." },
    { id: "work", label: "💻 Work", prompt: "Look for quiet places suitable for working." },
  ],
  activity: [
    { id: "any", label: "Any Activity", prompt: "" },
    { id: "eat", label: "🍽️ Eat", prompt: "Focus strictly on restaurants and food spots." },
    { id: "coffee", label: "☕ Coffee", prompt: "Focus strictly on cafes and bakeries." },
    { id: "nature", label: "🌳 Nature", prompt: "Focus strictly on parks and outdoor spots." },
    { id: "culture", label: "🎨 Culture", prompt: "Focus strictly on museums and historical sites." },
  ]
}

export default function HomePage() {
  // --- State ---
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    distance: "any",
    price: "any",
    vibe: "any",
    activity: "any"
  })

  // --- Search Logic ---
  const handleSearch = async (query: string) => {
    setIsLoading(true)
    setError(null)
    setLocations([])
    setSelectedLocation(null)

    try {
      // Get user GPS
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
      const { latitude, longitude } = position.coords
      setUserLocation({ lat: latitude, lng: longitude })

      // Build AI prompt based on filters
      const distPrompt = filterOptions.distance.find(f => f.id === filters.distance)?.prompt || ""
      const pricePrompt = filterOptions.price.find(f => f.id === filters.price)?.prompt || ""
      const vibePrompt = filterOptions.vibe.find(f => f.id === filters.vibe)?.prompt || ""
      const activityPrompt = filterOptions.activity.find(f => f.id === filters.activity)?.prompt || ""

      const finalQuery = `${query}. ${distPrompt} ${pricePrompt} ${vibePrompt} ${activityPrompt}`

      // Call Next.js API route
      const response = await fetch(
          `/api/locations?text=${encodeURIComponent(finalQuery)}&latitude=${latitude}&longitude=${longitude}`
      )
      if (!response.ok) throw new Error("Failed to fetch locations")

      const data = await response.json()
      setLocations(data.locations || [])
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        setError("Please enable location access to find nearby places")
      } else {
        setError("Failed to fetch locations. Please check your backend connection.")
      }
      console.error("Search Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <div className="flex h-screen flex-col bg-background">

        {/* Header */}
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="mx-auto max-w-7xl text-center md:text-left">
            <h1 className="text-2xl font-bold text-foreground">Location Finder</h1>
            <p className="text-sm text-muted-foreground">AI-powered recommendations near you</p>
          </div>
        </header>

        {/* Search & Filter Section */}
        <div className="border-b border-border bg-card px-6 py-4 shadow-sm z-10">
          <div className="mx-auto max-w-7xl">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />

            {/* Filters Grid */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
              <FilterRow label="Distance" options={filterOptions.distance} currentValue={filters.distance} onSelect={(id) => setFilters({...filters, distance: id})} />
              <FilterRow label="Activity" options={filterOptions.activity} currentValue={filters.activity} onSelect={(id) => setFilters({...filters, activity: id})} />
              <FilterRow label="Price" options={filterOptions.price} currentValue={filters.price} onSelect={(id) => setFilters({...filters, price: id})} />
              <FilterRow label="Vibe" options={filterOptions.vibe} currentValue={filters.vibe} onSelect={(id) => setFilters({...filters, vibe: id})} />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar */}
          <aside className="w-full md:w-96 overflow-y-auto border-r border-border bg-card shadow-inner">
            <div className="p-4">
              {isLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Spinner className="h-8 w-8 text-primary" />
                  </div>
              )}

              {error && (
                  <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                  </div>
              )}

              {!isLoading && !error && locations.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">
                      Try searching for "Great dinner spots" or "Hiking trails"
                    </p>
                  </div>
              )}

              {!isLoading && locations.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Results ({locations.length})
                    </p>
                    {locations.map((loc, idx) => (
                        <LocationCard key={idx} location={loc} isSelected={selectedLocation === loc} onClick={() => setSelectedLocation(loc)} />
                    ))}
                  </div>
              )}
            </div>
          </aside>

          {/* Map View */}
          <main className="flex-1 bg-muted">
            <MapView locations={locations} userLocation={userLocation} selectedLocation={selectedLocation} onLocationSelect={setSelectedLocation} />
          </main>

          {/* AI Panel */}
          <AIPanel onSearch={handleSearch} />

        </div>
      </div>
  )
}

// --- Helper Component for Filters ---
interface FilterRowProps {
  label: string
  options: { id: string; label: string; prompt?: string }[]
  currentValue: string
  onSelect: (id: string) => void
}

function FilterRow({ label, options, currentValue, onSelect }: FilterRowProps) {
  return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase text-muted-foreground w-16">{label}:</span>
        <div className="flex flex-wrap gap-1">
          {options.map((opt) => (
              <button
                  key={opt.id}
                  onClick={() => onSelect(opt.id)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium border transition-all ${currentValue === opt.id ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background text-foreground border-input hover:bg-accent"}`}
              >
                {opt.label}
              </button>
          ))}
        </div>
      </div>
  )
}