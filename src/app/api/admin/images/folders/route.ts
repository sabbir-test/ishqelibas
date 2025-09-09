import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const ASSETS_DIR = path.join(process.cwd(), 'public/assets')

export async function POST(request: NextRequest) {
  try {
    const { folderPath, name } = await request.json()
    
    const targetPath = path.join(ASSETS_DIR, folderPath || '', name)
    
    if (!targetPath.startsWith(ASSETS_DIR)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    await fs.mkdir(targetPath, { recursive: true })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folderPath = searchParams.get('path') || ''
    
    const targetPath = path.join(ASSETS_DIR, folderPath)
    
    if (!targetPath.startsWith(ASSETS_DIR) || targetPath === ASSETS_DIR) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    await fs.rmdir(targetPath, { recursive: true })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 })
  }
}