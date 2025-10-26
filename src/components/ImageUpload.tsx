import { useState, useCallback } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent } from './ui/card'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { Upload, X, Star, StarOff } from 'lucide-react'
import { PromptImage } from '../lib/types'
// Database imports removed - will be replaced with new Supabase project

interface ImageUploadProps {
  images: PromptImage[]
  onImagesChange: (images: PromptImage[]) => void
  maxImages?: number
  allowPrimarySelection?: boolean
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  allowPrimarySelection = true,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files) return

    // TODO: Re-implement image upload with new Supabase project
      console.warn('Image upload not yet implemented - will be replaced with new database')

      // Placeholder: For now, create local URLs

      const uploadPromises = Array.from(files)
        .slice(0, maxImages - images.length)
        .filter(file => file.type.startsWith('image/'))
        .map(async (file, index) => {
          try {
           // Create temporary local URL for preview
            const localUrl = URL.createObjectURL(file)

            // Get image dimensions
            const img = new Image()
            img.src = localUrl

            return new Promise<PromptImage>(resolve => {
              img.onload = () => {
                resolve({
                  id: `image-${Date.now()}-${index}`,
                  url: localUrl,
                  altText: file.name.replace(/\.[^/.]+$/, ''),
                  isPrimary: images.length === 0 && index === 0,
                  size: file.size,
                  mimeType: file.type,
                  width: img.width,
                  height: img.height,
                })
              }
            })
          } catch (error) {
            console.error('Failed to upload image:', error)
            return null
          }
        })

      try {
        const uploadedImages = (await Promise.all(uploadPromises)).filter(
          Boolean
        ) as PromptImage[]
        if (uploadedImages.length > 0) {
          onImagesChange([...images, ...uploadedImages])
        }
      } catch (error) {
        console.error('Failed to process image uploads:', error)
      }
    },
    [images, onImagesChange, maxImages]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const removeImage = useCallback(
    (imageId: string) => {
      const updatedImages = images.filter(img => img.id !== imageId)
      // If we removed the primary image, make the first remaining image primary
      if (
        updatedImages.length > 0 &&
        !updatedImages.some(img => img.isPrimary)
      ) {
        updatedImages[0].isPrimary = true
      }
      onImagesChange(updatedImages)
    },
    [images, onImagesChange]
  )

  const setPrimaryImage = useCallback(
    (imageId: string) => {
      const updatedImages = images.map(img => ({
        ...img,
        isPrimary: img.id === imageId,
      }))
      onImagesChange(updatedImages)
    },
    [images, onImagesChange]
  )

  const updateAltText = useCallback(
    (imageId: string, altText: string) => {
      const updatedImages = images.map(img =>
        img.id === imageId ? { ...img, altText } : img
      )
      onImagesChange(updatedImages)
    },
    [images, onImagesChange]
  )

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          Images ({images.length}/{maxImages})
        </Label>
      </div>

      {/* Upload Area */}
      {images.length < maxImages && (
        <Card
          className={`border-2 border-dashed transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Drop images here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={e => handleFileSelect(e.target.files)}
                className="hidden"
                id="image-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose Files
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {images.map(image => (
            <Card key={image.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <ImageWithFallback
                  src={image.url}
                  alt={image.altText || ''}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {allowPrimarySelection && (
                    <Button
                      type="button"
                      size="sm"
                      variant={image.isPrimary ? 'default' : 'secondary'}
                      onClick={() => setPrimaryImage(image.id)}
                      className="h-8 w-8 p-0"
                      title={
                        image.isPrimary ? 'Primary image' : 'Set as primary'
                      }
                    >
                      {image.isPrimary ? (
                        <Star className="h-4 w-4" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => removeImage(image.id)}
                    className="h-8 w-8 p-0"
                    title="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {image.isPrimary && (
                  <div className="absolute bottom-2 left-2">
                    <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  </div>
                )}
              </div>
              <CardContent className="p-3 space-y-2">
                <Input
                  placeholder="Alt text (for accessibility)"
                  value={image.altText}
                  onChange={e => updateAltText(image.id, e.target.value)}
                  className="text-sm"
                />
                {image.caption && (
                  <p className="text-xs text-muted-foreground">
                    {image.caption}
                  </p>
                )}
                <div className="text-xs text-muted-foreground">
                  {image.width &&
                    image.height &&
                    `${image.width}×${image.height} • `}
                    {typeof image.size === 'number' && image.size > 0 &&
                    `${((image.size || 0) / 1024 / 1024).toFixed(1)}MB`}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
