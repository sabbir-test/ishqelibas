import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ params: string[] }> }
) {
  try {
    const resolvedParams = await params
    const [width, height] = resolvedParams.params
    
    if (!width || !height) {
      return NextResponse.json({ error: "Width and height are required" }, { status: 400 })
    }

    const w = parseInt(width)
    const h = parseInt(height)
    
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      return NextResponse.json({ error: "Invalid width or height" }, { status: 400 })
    }

    // Create a simple SVG placeholder
    const svg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <line x1="0" y1="0" x2="${w}" y2="${h}" stroke="#d1d5db" stroke-width="2"/>
        <line x1="${w}" y1="0" x2="0" y2="${h}" stroke="#d1d5db" stroke-width="2"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
          ${w}x${h}
        </text>
      </svg>
    `.trim()

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error("Error generating placeholder:", error)
    return NextResponse.json({ error: "Failed to generate placeholder" }, { status: 500 })
  }
}