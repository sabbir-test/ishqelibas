import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const ASSETS_DIR = path.join(process.cwd(), 'public/assets')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || ''
    
    const targetPath = path.join(ASSETS_DIR, folder)
    
    if (!targetPath.startsWith(ASSETS_DIR)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    const items = await fs.readdir(targetPath, { withFileTypes: true })
    
    const folders = items
      .filter(item => item.isDirectory())
      .map(item => ({ name: item.name, type: 'folder' }))
    
    const images = items
      .filter(item => item.isFile() && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.name))
      .map(item => ({ 
        name: item.name, 
        type: 'image',
        path: path.join(folder, item.name).replace(/\\/g, '/')
      }))

    return NextResponse.json({ folders, images })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read directory' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const folder = formData.get('folder') as string || ''
    
    const targetPath = path.join(ASSETS_DIR, folder)
    
    if (!targetPath.startsWith(ASSETS_DIR)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    await fs.mkdir(targetPath, { recursive: true })
    
    const results = []
    
    for (const file of files) {
      if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)) {
        results.push({ name: file.name, success: false, error: 'Invalid file type' })
        continue
      }
      
      if (file.size > 10 * 1024 * 1024) {
        results.push({ name: file.name, success: false, error: 'File too large' })
        continue
      }
      
      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filePath = path.join(targetPath, file.name)
        
        await fs.writeFile(filePath, buffer)
        results.push({ name: file.name, success: true })
      } catch (error) {
        results.push({ name: file.name, success: false, error: 'Upload failed' })
      }
    }
    
    return NextResponse.json({ results })
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}