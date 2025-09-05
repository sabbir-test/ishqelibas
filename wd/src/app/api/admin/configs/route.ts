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
      // Get specific config
      const config = await db.config.findUnique({
        where: { key }
      })
      return NextResponse.json({ config })
    } else {
      // Get all configs
      const configs = await db.config.findMany()
      return NextResponse.json({ configs })
    }
  } catch (error) {
    console.error('Error fetching configs:', error)
    return NextResponse.json({ error: 'Failed to fetch configs' }, { status: 500 })
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

    // Check if config exists
    const existingConfig = await db.config.findUnique({
      where: { key }
    })

    let config
    if (existingConfig) {
      // Update existing config
      config = await db.config.update({
        where: { key },
        data: {
          value,
          description,
          updatedBy: user.id
        }
      })
    } else {
      // Create new config
      config = await db.config.create({
        data: {
          key,
          value,
          description,
          updatedBy: user.id
        }
      })
    }

    // Log the configuration change
    await db.configChangeLog.create({
      data: {
        configKey: key,
        oldValue: existingConfig?.value || null,
        newValue: value,
        changedBy: user.id,
        changeType: existingConfig ? 'UPDATE' : 'CREATE'
      }
    })

    return NextResponse.json({ config })
  } catch (error) {
    console.error('Error creating/updating config:', error)
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 })
  }
}