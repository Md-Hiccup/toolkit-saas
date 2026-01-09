'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { Upload, X, File } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'
import { Button } from './ui/Button'

interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
  files?: File[]
}

export function FileUpload({
  accept = '.pdf',
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB default
  onFilesSelected,
  disabled = false,
  files: externalFiles,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)

  // Sync internal state with external files prop
  useEffect(() => {
    if (externalFiles !== undefined) {
      setFiles(externalFiles)
    }
  }, [externalFiles])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (disabled) return

      const droppedFiles = Array.from(e.dataTransfer.files)
      const validFiles = droppedFiles.filter((file) => {
        if (maxSize && file.size > maxSize) return false
        if (accept && !accept.split(',').some((type) => file.name.endsWith(type.trim()))) return false
        return true
      })

      if (multiple) {
        const newFiles = [...files, ...validFiles]
        setFiles(newFiles)
        onFilesSelected(newFiles)
      } else {
        setFiles(validFiles.slice(0, 1))
        onFilesSelected(validFiles.slice(0, 1))
      }
    },
    [files, multiple, accept, maxSize, onFilesSelected, disabled]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return

      const selectedFiles = e.target.files ? Array.from(e.target.files) : []
      
      if (multiple) {
        const newFiles = [...files, ...selectedFiles]
        setFiles(newFiles)
        onFilesSelected(newFiles)
      } else {
        setFiles(selectedFiles.slice(0, 1))
        onFilesSelected(selectedFiles.slice(0, 1))
      }
    },
    [files, multiple, onFilesSelected, disabled]
  )

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = files.filter((_, i) => i !== index)
      setFiles(newFiles)
      onFilesSelected(newFiles)
    },
    [files, onFilesSelected]
  )

  return (
    <div className="w-full">
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors',
          dragActive ? 'border-primary bg-primary/5' : 'border-gray-300',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled}
          title=""
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
        <p className="text-base sm:text-lg font-medium mb-2">
          {dragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-xs sm:text-sm text-gray-500 mb-2">or</p>
        <Button 
          type="button"
          variant="outline" 
          className="relative z-10 pointer-events-none text-sm"
        >
          Choose Files
        </Button>
        <p className="text-xs text-gray-400 mt-3 sm:mt-4">
          {accept} • Max {formatFileSize(maxSize)}
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <File className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
                disabled={disabled}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
