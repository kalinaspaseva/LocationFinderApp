import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const text = searchParams.get("text")
  const latitude = searchParams.get("latitude")
  const longitude = searchParams.get("longitude")

  if (!text || !latitude || !longitude) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
  }

  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"
    const response = await fetch(
      `${backendUrl}/api/gemini/response?text=${encodeURIComponent(text)}&latitude=${latitude}&longitude=${longitude}`,
    )

    if (!response.ok) {
      throw new Error("Backend API request failed")
    }

    const data = await response.json()

   let locations = []

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const textContent = data.candidates[0].content.parts[0].text

      try {
        const jsonMatch = textContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          locations = parsed.locations || []
        }
      } catch (parseError) {
        console.error("Failed to parse locations JSON:", parseError)
      }
    }

    return NextResponse.json({ locations })
  } catch (error) {
    console.error("Error fetching locations:", error)
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 })
  }
}