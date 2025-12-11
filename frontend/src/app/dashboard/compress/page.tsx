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

export default function CompressPage() {
  const [files, setFiles] = useState<File[]>([])
  const [quality, setQuality] = useState('medium')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [hasConverted, setHasConverted] = useState(false)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)

  // Clear result when files change
  useEffect(() => {
    if (hasConverted) {
      // Clear result when files are removed or changed
      setResultBlob(null)
      setOriginalSize(0)
      setCompressedSize(0)
      setHasConverted(false)
    }
  }, [files])

  // Auto-reconvert when quality changes after initial conversion
  useEffect(() => {
    if (hasConverted && files.length > 0 && !isProcessing) {
      handleCompress()
    }
  }, [quality])

  const handleCompress = async () => {
    if (files.length === 0) {
      toast.error('Please select a PDF file')
      return
    }

    setIsProcessing(true)
    setProgress(0)
    
    // Only set original size on first compression
    if (!hasConverted) {
      setOriginalSize(files[0].size)
    }

    try {
      const blob = await pdfAPI.compressPDF(files[0], quality, setProgress)
      setResultBlob(blob)
      setCompressedSize(blob.size)
      setHasConverted(true)
      toast.success(`PDF compressed with ${quality} quality!`)
    } catch (error: any) {
      const errorMsg = typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : error.message || 'Failed to compress PDF'
      toast.error(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!resultBlob) return

    const url = window.URL.createObjectURL(resultBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'compressed.pdf'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleReset = () => {
    setFiles([])
    setResultBlob(null)
    setProgress(0)
    setHasConverted(false)
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Compress PDF</h1>
        <p className="text-gray-600 mb-8">
          Reduce PDF file size while maintaining quality
        </p>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Quality Selector */}
              <Select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                disabled={isProcessing}
              >
                <option value="low">Low (Smallest file, 150 DPI, high compression)</option>
                <option value="medium">Medium (Balanced, 200 DPI, moderate compression)</option>
                <option value="high">High (Best quality, 300 DPI, low compression)</option>
              </Select>

              {/* Compress Button */}
              {!hasConverted && (
                <Button
                  onClick={handleCompress}
                  disabled={files.length === 0 || isProcessing}
                  className="gap-2 ml-auto"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Compressing...
                    </>
                  ) : (
                    'Compress PDF'
                  )}
                </Button>
              )}

              {/* Reset Button */}
              {hasConverted && (
                <Button variant="outline" onClick={handleReset} disabled={isProcessing} className="ml-auto">
                  Start Over
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Side by Side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Left: File Upload (30%) */}
          <div className="lg:col-span-3">
            <Card className="h-full">
            <CardHeader>
              <CardTitle>Upload PDF File</CardTitle>
              <CardDescription>
                Select a PDF file to compress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                accept=".pdf"
                multiple={false}
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
                {isProcessing ? 'Compressing your PDF' : resultBlob ? 'Compression complete' : 'Upload a file to begin'}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pt-6 pb-6">
              {!isProcessing && !resultBlob && (
                <div className="text-center text-gray-500 py-12">
                  <p className="text-lg">Select a PDF file and click "Compress PDF" to start</p>
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
                      ✓ PDF compressed with {quality} quality! {isProcessing && '(Re-compressing...)'}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Original size:</span>
                        <span className="font-semibold text-gray-900">{formatFileSize(originalSize)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Compressed size:</span>
                        <span className="font-semibold text-gray-900">{formatFileSize(compressedSize)}</span>
                      </div>
                      {compressedSize < originalSize ? (
                        <div className="flex justify-between items-center">
                          <span className="text-green-700">Saved:</span>
                          <span className="font-semibold text-green-700">
                            {formatFileSize(originalSize - compressedSize)} ({Math.round((1 - compressedSize / originalSize) * 100)}%)
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-orange-700">Note:</span>
                          <span className="font-semibold text-orange-700 text-xs">File size increased (already optimized)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button onClick={handleDownload} disabled={isProcessing} className="w-full bg-gray-900 hover:bg-gray-800">
                    <Download className="mr-2 h-4 w-4" />
                    {isProcessing ? 'Processing...' : 'Download Compressed PDF'}
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
