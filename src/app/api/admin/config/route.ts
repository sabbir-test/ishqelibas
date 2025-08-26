import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuth(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key) {
      // Get specific configuration
      const config = await db.configuration.findUnique({
        where: { key }
      })
      return NextResponse.json({ config })
    } else {
      // Get all configurations
      const configs = await db.configuration.findMany({
        orderBy: { key: 'asc' }
      })
      return NextResponse.json({ configs })
    }
  } catch (error) {
    console.error('Error fetching configurations:', error)
    return NextResponse.json({ error: 'Failed to fetch configurations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuth(request)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { key, value, description } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 })
    }

    // Check if configuration already exists
    const existingConfig = await db.configuration.findUnique({
      where: { key }
    })

    let config
    if (existingConfig) {
      // Update existing configuration
      config = await db.configuration.update({
        where: { key },
        data: { value, description }
      })
    } else {
      // Create new configuration
      config = await db.configuration.create({
        data: { key, value, description }
      })
    }

    // Log the configuration change
    await db.configurationLog.create({
      data: {
        configKey: key,
        oldValue: existingConfig?.value || null,
        newValue: value,
        action: existingConfig ? 'UPDATE' : 'CREATE',
        adminId: user.id,
        adminName: user.name || user.email
      }
    })

    return NextResponse.json({ config }, { status: 201 })
  } catch (error) {
    console.error('Error creating/updating configuration:', error)
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 })
  }
}