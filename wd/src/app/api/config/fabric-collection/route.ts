import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get the fabric collection setting
    const config = await db.config.findUnique({
      where: { key: 'enable_fabric_collection_card' }
    })

    // Default to true if not set
    const isEnabled = config ? config.value === 'true' : true

    return NextResponse.json({ 
      enabled: isEnabled,
      config 
    })
  } catch (error) {
    console.error('Error fetching fabric collection setting:', error)
    return NextResponse.json({ 
      enabled: true, // Default to true on error
      error: 'Failed to fetch setting' 
    }, { status: 500 })
  }
}