'use client'

import { useState, useEffect } from 'react'
import { FileUpload } from '@/components/FileUpload'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { pdfAPI } from '@/lib/api'
import { formatFileSize } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Download, Loader2 } from 'lucide-react'

export default function ImageToPdfPage() {
  const [files, setFiles] = useState<File[]>([])
  const [quality, setQuality] = useState('medium')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [hasConverted, setHasConverted] = useState(false)
  const [originalSize, setOriginalSize] = useState(0)
  const [pdfSize, setPdfSize] = useState(0)

  // Clear result when files change
  useEffect(() => {
    if (hasConverted) {
      // Clear result when files are removed or changed
      setResultBlob(null)
      setOriginalSize(0)
      setPdfSize(0)
      setHasConverted(false)
    }
  }, [files])

  // Auto-reconvert when quality changes after initial conversion
  useEffect(() => {
    if (hasConverted && files.length > 0 && !isProcessing) {
      handleConvert()
    }
  }, [quality])

  const handleConvert = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one image file')
      return
    }

    setIsProcessing(true)
    setProgress(0)

    // Only set original size on first conversion
    if (!hasConverted) {
      const totalSize = files.reduce((sum, file) => sum + file.size, 0)
      setOriginalSize(totalSize)
    }

    try {
      const blob = await pdfAPI.imageToPDF(files, quality, setProgress)
      setResultBlob(blob)
      setPdfSize(blob.size)
      setHasConverted(true)
      toast.success(`PDF created with ${quality} quality!`)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to convert images')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!resultBlob) return

    const url = window.URL.createObjectURL(resultBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'converted.pdf'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleClearFiles = () => {
    setFiles([])
    setResultBlob(null)
    setOriginalSize(0)
    setPdfSize(0)
    setHasConverted(false)
  }

  const handleReset = () => {
    setFiles([])
    setResultBlob(null)
    setProgress(0)
    setOriginalSize(0)
    setPdfSize(0)
    setHasConverted(false)
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Image to PDF</h1>
        <p className="text-gray-600 mb-8">
          Convert multiple images into a single PDF document with compression
        </p>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              {files.length > 0 && (
                <span className="text-sm text-gray-600">{files.length} file{files.length !== 1 ? 's' : ''} selected</span>
              )}

              {/* Quality Selector */}
              <Select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                disabled={isProcessing}
              >
                <option value="low">Low (Smallest file, max 800px, 50% quality)</option>
                <option value="medium">Medium (Balanced, max 1200px, 65% quality)</option>
                <option value="high">High (Best quality, max 1600px, 80% quality)</option>
              </Select>

              {/* Convert Button */}
              {!hasConverted && (
                <Button
                  onClick={handleConvert}
                  disabled={files.length === 0 || isProcessing}
                  className="gap-2 ml-auto"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    'Convert to PDF'
                  )}
                </Button>
              )}

              {/* Reset Button */}
              {hasConverted && (
                <Button variant="outline" onClick={handleReset} disabled={isProcessing} className="ml-auto">
                  Start Over
                </Button>
              )}

              {/* Clear Button */}
              {files.length > 0 && !hasConverted && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearFiles}
                  disabled={isProcessing}
                >
                  Clear Selection
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Side-by-side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Left: File Upload (30%) */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Upload Image Files</CardTitle>
                <CardDescription>
                  Select one or more images (PNG, JPG, JPEG) to convert to PDF
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  accept=".png,.jpg,.jpeg"
                  multiple={true}
                  files={files}
                  onFilesSelected={setFiles}
                  disabled={isProcessing}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right: Progress and Results (70%) */}
          <div className="lg:col-span-7">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>
                  {isProcessing ? 'Processing...' : resultBlob ? 'Results' : 'Status'}
                </CardTitle>
                <CardDescription>
                  {isProcessing ? 'Converting images to PDF' : resultBlob ? 'Conversion complete' : 'Upload files to begin'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {!isProcessing && !resultBlob && (
                  <div className="text-center text-gray-500 py-8">
                    <p>Select image files and click "Convert to PDF" to start</p>
                  </div>
                )}

                {isProcessing && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Processing...</span>
                      <span className="font-semibold">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {resultBlob && (
                  <div className="space-y-4 -mb-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-700 text-sm font-medium mb-3">
                        ✓ PDF ready with {quality} quality! {isProcessing && '(Re-converting...)'}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Original images ({files.length}):</span>
                          <span className="font-semibold text-gray-900">{formatFileSize(originalSize)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">PDF size:</span>
                          <span className="font-semibold text-gray-900">{formatFileSize(pdfSize)}</span>
                        </div>
                        {pdfSize < originalSize ? (
                          <div className="flex justify-between items-center">
                            <span className="text-green-700">Saved:</span>
                            <span className="font-semibold text-green-700">
                              {formatFileSize(originalSize - pdfSize)} ({Math.round((1 - pdfSize / originalSize) * 100)}%)
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700">Increase:</span>
                            <span className="font-semibold text-blue-700">
                              {formatFileSize(pdfSize - originalSize)} ({Math.round((pdfSize / originalSize - 1) * 100)}%)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button onClick={handleDownload} disabled={isProcessing} className="w-full bg-gray-900 hover:bg-gray-800">
                      <Download className="mr-2 h-4 w-4" />
                      {isProcessing ? 'Processing...' : 'Download PDF'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
