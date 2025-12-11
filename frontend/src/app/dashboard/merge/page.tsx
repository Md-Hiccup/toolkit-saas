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

export default function MergePage() {
  const [files, setFiles] = useState<File[]>([])
  const [quality, setQuality] = useState('original')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [originalSize, setOriginalSize] = useState(0)
  const [mergedSize, setMergedSize] = useState(0)

  // Clear result when files change (added or removed)
  useEffect(() => {
    if (resultBlob) {
      // If we had a result and files changed, clear it
      setResultBlob(null)
      setOriginalSize(0)
      setMergedSize(0)
    }
  }, [files])

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error('Please select at least 2 PDF files')
      return
    }

    setIsProcessing(true)
    setProgress(0)

    // Calculate total original size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    setOriginalSize(totalSize)

    try {
      const blob = await pdfAPI.mergePDFs(files, setProgress)
      setResultBlob(blob)
      setMergedSize(blob.size)
      toast.success('PDFs merged successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to merge PDFs')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!resultBlob) return

    const url = window.URL.createObjectURL(resultBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'merged.pdf'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleClearFiles = () => {
    setFiles([])
    setResultBlob(null)
    setOriginalSize(0)
    setMergedSize(0)
  }

  const handleReset = () => {
    setFiles([])
    setResultBlob(null)
    setProgress(0)
    setOriginalSize(0)
    setMergedSize(0)
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Merge PDFs</h1>
        <p className="text-gray-600 mb-8">
          Combine multiple PDF files into a single document
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
                <option value="original">Original (No compression, preserve quality)</option>
                <option value="low">Low (Smallest file, 150 DPI, high compression)</option>
                <option value="medium">Medium (Balanced, 200 DPI, moderate compression)</option>
                <option value="high">High (Best quality, 300 DPI, low compression)</option>
              </Select>

              {/* Merge Button */}
              {!resultBlob && (
                <Button
                  onClick={handleMerge}
                  disabled={files.length < 2 || isProcessing}
                  className="gap-2 ml-auto"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Merging...
                    </>
                  ) : (
                    'Merge PDFs'
                  )}
                </Button>
              )}

              {/* Reset Button */}
              {resultBlob && (
                <Button variant="outline" onClick={handleReset} disabled={isProcessing} className="ml-auto">
                  Start Over
                </Button>
              )}

              {/* Clear Button */}
              {files.length > 0 && !resultBlob && (
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
                <CardTitle>Upload PDF Files</CardTitle>
                <CardDescription>
                  Select at least 2 PDF files to merge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  accept=".pdf"
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
                  {isProcessing ? 'Merging your PDFs' : resultBlob ? 'Merge complete' : 'Upload files to begin'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {!isProcessing && !resultBlob && (
                  <div className="text-center text-gray-500 py-8">
                    <p>Select at least 2 PDF files and click "Merge PDFs" to start</p>
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
                        ✓ PDFs merged successfully!
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Original files ({files.length}):</span>
                          <span className="font-semibold text-gray-900">{formatFileSize(originalSize)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Merged PDF:</span>
                          <span className="font-semibold text-gray-900">{formatFileSize(mergedSize)}</span>
                        </div>
                        {mergedSize < originalSize && (
                          <div className="flex justify-between items-center">
                            <span className="text-green-700">Saved:</span>
                            <span className="font-semibold text-green-700">
                              {formatFileSize(originalSize - mergedSize)} ({Math.round((1 - mergedSize / originalSize) * 100)}%)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button onClick={handleDownload} disabled={isProcessing} className="w-full bg-gray-900 hover:bg-gray-800">
                      <Download className="mr-2 h-4 w-4" />
                      {isProcessing ? 'Processing...' : 'Download Merged PDF'}
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
