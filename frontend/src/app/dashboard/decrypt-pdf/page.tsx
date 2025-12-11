'use client'

import { useState } from 'react'
import { FileUpload } from '@/components/FileUpload'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { pdfAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { Download, Loader2, Unlock, Eye, EyeOff } from 'lucide-react'

export default function DecryptPdfPage() {
  const [files, setFiles] = useState<File[]>([])
  const [password, setPassword] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleDecrypt = async () => {
    // Reset errors
    setPasswordError('')

    if (files.length === 0) {
      toast.error('Please select a PDF file')
      return
    }

    if (!password) {
      setPasswordError('Please enter the password')
      return
    }

    setIsProcessing(true)
    setProgress(0)

    try {
      const blob = await pdfAPI.decryptPDF(files[0], password, setProgress)
      setResultBlob(blob)
      toast.success('PDF decrypted successfully!')
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to decrypt PDF'
      if (errorMsg.includes('Incorrect password')) {
        setPasswordError('Incorrect password. Please try again.')
      } else if (errorMsg.includes('not password-protected')) {
        setPasswordError('This PDF is not password-protected')
      } else {
        setPasswordError(errorMsg)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!resultBlob) return

    const url = window.URL.createObjectURL(resultBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'decrypted.pdf'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleReset = () => {
    setFiles([])
    setPassword('')
    setResultBlob(null)
    setProgress(0)
    setPasswordError('')
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Unlock PDF</h1>
        <p className="text-gray-600 mb-8">
          Remove password protection from your PDF files
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Left Column - Upload & Settings (30%) */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Upload Encrypted PDF</CardTitle>
                <CardDescription>
                  Select a password-protected PDF file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FileUpload
                  accept=".pdf"
                  multiple={false}
                  files={files}
                  onFilesSelected={setFiles}
                  disabled={isProcessing}
                />

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter PDF password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setPasswordError('')
                      }}
                      disabled={isProcessing || files.length === 0}
                      className={`pr-10 ${passwordError ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={files.length === 0}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                  )}
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Decrypting...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {!resultBlob && (
                  <Button
                    onClick={handleDecrypt}
                    disabled={files.length === 0 || isProcessing || !password}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Decrypting...
                      </>
                    ) : (
                      <>
                        <Unlock className="mr-2 h-4 w-4" />
                        Decrypt PDF
                      </>
                    )}
                  </Button>
                )}

                {resultBlob && (
                  <div className="space-y-2">
                    <Button onClick={handleDownload} className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download Decrypted PDF
                    </Button>
                    <Button variant="outline" onClick={handleReset} className="w-full">
                      Decrypt Another PDF
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Info (70%) */}
          <div className="lg:col-span-7">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">🔓 Decrypt PDF</h3>
                  <p className="text-sm text-blue-800">
                    Remove password protection from your PDF files. You'll need the correct password to decrypt the document.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Steps:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    <li>Upload the password-protected PDF file</li>
                    <li>Enter the correct password</li>
                    <li>Click "Decrypt PDF" to remove encryption</li>
                    <li>Download the decrypted PDF (no password required)</li>
                  </ol>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Important Notes:</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                    <li>You must have the correct password to decrypt the PDF</li>
                    <li>The decrypted PDF will not require a password to open</li>
                    <li>Keep the decrypted file secure if it contains sensitive information</li>
                    <li>If you forgot the password, decryption is not possible</li>
                  </ul>
                </div>

                {resultBlob && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">
                      ✓ PDF decrypted successfully! The document is now accessible without a password.
                    </p>
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
