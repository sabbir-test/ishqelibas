import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const ASSETS_DIR = path.join(process.cwd(), 'public/assets')

export async function PUT(request: NextRequest) {
  try {
    const { action, imagePath, newName } = await request.json()
    
    if (action === 'rename') {
      const oldPath = path.join(ASSETS_DIR, imagePath)
      const newPath = path.join(path.dirname(oldPath), newName)
      
      if (!oldPath.startsWith(ASSETS_DIR) || !newPath.startsWith(ASSETS_DIR)) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
      }

      await fs.rename(oldPath, newPath)
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imagePath = searchParams.get('path')
    
    if (!imagePath) {
      return NextResponse.json({ error: 'Path required' }, { status: 400 })
    }
    
    const targetPath = path.join(ASSETS_DIR, imagePath)
    
    if (!targetPath.startsWith(ASSETS_DIR)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    await fs.unlink(targetPath)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}