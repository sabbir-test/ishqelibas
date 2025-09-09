"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  FolderPlus, 
  Folder, 
  Image as ImageIcon, 
  Trash2, 
  Edit, 
  Eye,
  X,
  Check
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FileItem {
  name: string
  type: 'folder' | 'image'
  path?: string
}

export default function ImageManager() {
  const [currentPath, setCurrentPath] = useState('')
  const [items, setItems] = useState<{ folders: FileItem[], images: FileItem[] }>({ folders: [], images: [] })
  const [loading, setLoading] = useState(false)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [editingImage, setEditingImage] = useState<string | null>(null)
  const [newImageName, setNewImageName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  
  const { toast } = useToast()

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/images?folder=${encodeURIComponent(currentPath)}`)
      const data = await response.json()
      
      if (response.ok) {
        setItems(data)
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load items", variant: "destructive" })
    }
    setLoading(false)
  }, [currentPath, toast])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const handleUpload = async (files: FileList) => {
    const formData = new FormData()
    Array.from(files).forEach(file => formData.append('files', file))
    formData.append('folder', currentPath)

    try {
      const response = await fetch('/api/admin/images', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (response.ok) {
        const successful = data.results.filter((r: any) => r.success).length
        toast({ title: "Success", description: `${successful} files uploaded` })
        loadItems()
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Upload failed", variant: "destructive" })
    }
  }

  const createFolder = async () => {
    if (!newFolderName.trim()) return

    try {
      const response = await fetch('/api/admin/images/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath: currentPath, name: newFolderName })
      })

      if (response.ok) {
        toast({ title: "Success", description: "Folder created" })
        setNewFolderName('')
        setShowNewFolder(false)
        loadItems()
      } else {
        const data = await response.json()
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create folder", variant: "destructive" })
    }
  }

  const deleteImage = async (imagePath: string) => {
    try {
      const response = await fetch(`/api/admin/images/operations?path=${encodeURIComponent(imagePath)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({ title: "Success", description: "Image deleted" })
        loadItems()
      } else {
        const data = await response.json()
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Delete failed", variant: "destructive" })
    }
  }

  const renameImage = async (imagePath: string, newName: string) => {
    try {
      const response = await fetch('/api/admin/images/operations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rename', imagePath, newName })
      })

      if (response.ok) {
        toast({ title: "Success", description: "Image renamed" })
        setEditingImage(null)
        loadItems()
      } else {
        const data = await response.json()
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Rename failed", variant: "destructive" })
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleUpload(files)
    }
  }

  const pathSegments = currentPath.split('/').filter(Boolean)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Image Manager</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowNewFolder(true)} variant="outline">
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
          <Button onClick={() => document.getElementById('file-upload')?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Images
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <button 
          onClick={() => setCurrentPath('')}
          className="hover:text-blue-600"
        >
          assets
        </button>
        {pathSegments.map((segment, index) => (
          <span key={index} className="flex items-center gap-2">
            <span>/</span>
            <button
              onClick={() => setCurrentPath(pathSegments.slice(0, index + 1).join('/'))}
              className="hover:text-blue-600"
            >
              {segment}
            </button>
          </span>
        ))}
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg mb-2">Drag and drop images here</p>
        <p className="text-gray-500 mb-4">or click to browse</p>
        <Button onClick={() => document.getElementById('file-upload')?.click()}>
          Select Files
        </Button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Folders */}
        {items.folders.map((folder) => (
          <Card 
            key={folder.name} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setCurrentPath(currentPath ? `${currentPath}/${folder.name}` : folder.name)}
          >
            <CardContent className="p-4 text-center">
              <Folder className="h-12 w-12 mx-auto mb-2 text-blue-500" />
              <p className="text-sm font-medium truncate">{folder.name}</p>
            </CardContent>
          </Card>
        ))}

        {/* Images */}
        {items.images.map((image) => (
          <Card key={image.name} className="group relative">
            <CardContent className="p-2">
              <div className="aspect-square bg-gray-100 rounded mb-2 overflow-hidden">
                <img
                  src={`/assets/${image.path}`}
                  alt={image.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/api/placeholder/150/150'
                  }}
                />
              </div>
              
              {editingImage === image.name ? (
                <div className="flex gap-1">
                  <Input
                    value={newImageName}
                    onChange={(e) => setNewImageName(e.target.value)}
                    className="text-xs h-6"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        renameImage(image.path!, newImageName)
                      }
                      if (e.key === 'Escape') {
                        setEditingImage(null)
                      }
                    }}
                  />
                  <Button 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={() => renameImage(image.path!, newImageName)}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <p className="text-xs truncate">{image.name}</p>
              )}

              {/* Action buttons */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-6 w-6 p-0"
                  onClick={() => setPreviewImage(`/assets/${image.path}`)}
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    setEditingImage(image.name)
                    setNewImageName(image.name)
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-6 w-6 p-0"
                  onClick={() => deleteImage(image.path!)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Hidden file input */}
      <input
        id="file-upload"
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files && handleUpload(e.target.files)}
      />

      {/* New Folder Dialog */}
      <Dialog open={showNewFolder} onOpenChange={setShowNewFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createFolder()}
            />
            <div className="flex gap-2">
              <Button onClick={createFolder}>Create</Button>
              <Button variant="outline" onClick={() => setShowNewFolder(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="max-h-[70vh] overflow-auto">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-auto"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}