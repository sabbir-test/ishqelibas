import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json({ error: 'Key parameter is required' }, { status: 400 })
    }

    const config = await db.configuration.findUnique({
      where: { key, isActive: true }
    })

    if (!config) {
      // Return default value if configuration doesn't exist
      if (key === 'manual_measurements_enabled') {
        return NextResponse.json({ 
          key, 
          value: 'true', // Default to enabled
          description: 'Enable manual measurements entry for customers'
        })
      }
      return NextResponse.json({ error: 'Configuration not found' }, { status: 404 })
    }

    return NextResponse.json({ config })
  } catch (error) {
    console.error('Error fetching configuration:', error)
    return NextResponse.json({ error: 'Failed to fetch configuration' }, { status: 500 })
  }
}