import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image, AlertCircle } from 'lucide-react'
import { validateImage, imageToBase64 } from '@/services/imageService'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export default function ImageUploader({ images, onChange, maxImages = 10 }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const remaining = maxImages - images.length
    
    if (remaining <= 0) {
      setError(`Maximum ${maxImages} images allowed`)
      return
    }

    const filesToProcess = fileArray.slice(0, remaining)
    setUploading(true)
    setError('')
    
    const newImages: string[] = []
    
    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i]
      setUploadProgress(`Processing ${i + 1} of ${filesToProcess.length}...`)
      
      const validation = validateImage(file)
      if (!validation.valid) {
        setError(`${file.name}: ${validation.error}`)
        continue
      }

      try {
        const base64 = await imageToBase64(file)
        newImages.push(base64)
      } catch {
        setError(`Failed to process ${file.name}`)
      }
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages])
    }

    setUploading(false)
    setUploadProgress('')
  }, [images, maxImages, onChange])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index)
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
          ${isDragging 
            ? 'border-amber-500 bg-amber-50' 
            : 'border-gray-300 hover:border-amber-400 hover:bg-amber-50/50'
          }
          ${uploading ? 'opacity-60 cursor-wait' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-2">
            <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-amber-600 font-medium">{uploadProgress}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                {isDragging ? 'Drop images here!' : 'Drag & drop images here'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                or <span className="text-amber-600 font-medium">browse from device</span>
              </p>
            </div>
            <p className="text-xs text-gray-400">
              JPEG, PNG, GIF, WebP • Max 3MB each • {images.length}/{maxImages} uploaded
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
              {img.startsWith('data:') ? (
                <img src={img} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <Image className="w-6 h-6 text-amber-400" />
                </div>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); removeImage(index) }}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-0.5 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
