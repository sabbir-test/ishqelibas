"use client"

import { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { useDropzone } from "react-dropzone"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  disabled?: boolean
}

export default function ImageUpload({ value, onChange, onRemove, disabled }: ImageUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // Convert file to base64 for preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onChange(result)
      }
      reader.readAsDataURL(file)
    }
  }, [onChange])

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  })

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleRemove = () => {
    onRemove?.()
    onChange("")
  }

  return (
    <div className="space-y-4">
      {/* Drag and Drop Area */}
      <Card 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragActive 
            ? "border-pink-500 bg-pink-50" 
            : isDragReject 
              ? "border-red-500 bg-red-50" 
              : "border-gray-300 hover:border-gray-400"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className="text-center"
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? "Drop the image here" : "Drag & drop image here"}
              </p>
              <p className="text-sm text-gray-500">
                or click to select a file
              </p>
              <p className="text-xs text-gray-400">
                Supports: JPEG, PNG, GIF, WebP (max 10MB)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OR Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">OR</span>
        </div>
      </div>

      {/* URL Input */}
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <div className="flex space-x-2">
          <Input
            id="imageUrl"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={value || ""}
            onChange={handleUrlChange}
            disabled={disabled}
            className="flex-1"
          />
          {value && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Image Preview */}
      {value && (
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="relative">
            <img
              src={value}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border"
              onError={(e) => {
                e.currentTarget.src = "/api/placeholder/400/300"
              }}
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}