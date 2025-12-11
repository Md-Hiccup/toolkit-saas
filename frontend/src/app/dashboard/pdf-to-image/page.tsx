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

export default function PdfToImagePage() {
  const [files, setFiles] = useState<File[]>([])
  const [format, setFormat] = useState('png')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [hasConverted, setHasConverted] = useState(false)
  const [originalSize, setOriginalSize] = useState(0)
  const [zipSize, setZipSize] = useState(0)

  // Clear result when files change
  useEffect(() => {
    if (hasConverted) {
      // Clear result when files are removed or changed
      setResultBlob(null)
      setOriginalSize(0)
      setZipSize(0)
      setHasConverted(false)
    }
  }, [files])

  // Auto-reconvert when format changes after initial conversion
  useEffect(() => {
    if (hasConverted && files.length > 0 && !isProcessing) {
      handleConvert()
    }
  }, [format])

  const handleConvert = async () => {
    if (files.length === 0) {
      toast.error('Please select a PDF file')
      return
    }

    setIsProcessing(true)
    setProgress(0)
    
    // Only set original size on first conversion
    if (!hasConverted) {
      setOriginalSize(files[0].size)
    }

    try {
      const blob = await pdfAPI.pdfToImage(files[0], format, setProgress)
      setResultBlob(blob)
      setZipSize(blob.size)
      setHasConverted(true)
      toast.success(`Images created in ${format.toUpperCase()} format!`)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to convert PDF')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!resultBlob) return

    const url = window.URL.createObjectURL(resultBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `images.zip`
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
        <h1 className="text-3xl font-bold mb-2">PDF to Image</h1>
        <p className="text-gray-600 mb-8">
          Convert PDF pages to PNG or JPG images
        </p>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Format Selector */}
              <Select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                disabled={isProcessing}
              >
                <option value="png">PNG (Better quality)</option>
                <option value="jpg">JPG (Smaller size)</option>
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
                    'Convert to Images'
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

        {/* Side-by-side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Left: File Upload (30%) */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Upload PDF File</CardTitle>
                <CardDescription>
                  Select a PDF file to convert to images
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
                  {isProcessing ? 'Converting PDF to images' : resultBlob ? 'Conversion complete' : 'Upload a file to begin'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {!isProcessing && !resultBlob && (
                  <div className="text-center text-gray-500 py-8">
                    <p>Select a PDF file and click "Convert to Images" to start</p>
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
                        ✓ Images ready in {format.toUpperCase()} format! {isProcessing && '(Re-converting...)'}
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Original PDF:</span>
                          <span className="font-semibold text-gray-900">{formatFileSize(originalSize)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Images ZIP:</span>
                          <span className="font-semibold text-gray-900">{formatFileSize(zipSize)}</span>
                        </div>
                        {zipSize > originalSize && (
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700">Increase:</span>
                            <span className="font-semibold text-blue-700">
                              {formatFileSize(zipSize - originalSize)} ({Math.round((zipSize / originalSize - 1) * 100)}%)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button onClick={handleDownload} disabled={isProcessing} className="w-full bg-gray-900 hover:bg-gray-800">
                      <Download className="mr-2 h-4 w-4" />
                      {isProcessing ? 'Processing...' : 'Download Images (ZIP)'}
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
