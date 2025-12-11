'use client'

import { useState } from 'react'
import { FileUpload } from '@/components/FileUpload'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { pdfAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { Download, Loader2, Lock, Eye, EyeOff } from 'lucide-react'

export default function EncryptPdfPage() {
  const [files, setFiles] = useState<File[]>([])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleEncrypt = async () => {
    // Reset errors
    setPasswordError('')
    setConfirmPasswordError('')

    if (files.length === 0) {
      toast.error('Please select a PDF file')
      return
    }

    if (!password || password.length < 4) {
      setPasswordError('Password must be at least 4 characters')
      return
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
      return
    }

    setIsProcessing(true)
    setProgress(0)

    try {
      const blob = await pdfAPI.encryptPDF(files[0], password, undefined, setProgress)
      setResultBlob(blob)
      toast.success('PDF encrypted successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to encrypt PDF')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!resultBlob) return

    const url = window.URL.createObjectURL(resultBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'encrypted.pdf'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleReset = () => {
    setFiles([])
    setPassword('')
    setConfirmPassword('')
    setResultBlob(null)
    setProgress(0)
    setPasswordError('')
    setConfirmPasswordError('')
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Protect PDF</h1>
        <p className="text-gray-600 mb-8">
          Secure your PDF files with password protection
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Left Column - Upload & Settings (30%) */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Upload PDF</CardTitle>
                <CardDescription>
                  Select a PDF file to encrypt
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

                <div className="space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password (min 4 characters)"
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

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value)
                          setConfirmPasswordError('')
                        }}
                        disabled={isProcessing || files.length === 0}
                        className={`pr-10 ${confirmPasswordError ? 'border-red-500' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={files.length === 0}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPasswordError && (
                      <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>
                    )}
                  </div>
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Encrypting...</span>
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
                    onClick={handleEncrypt}
                    disabled={files.length === 0 || isProcessing || !password || !confirmPassword}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Encrypting...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Encrypt PDF
                      </>
                    )}
                  </Button>
                )}

                {resultBlob && (
                  <div className="space-y-2">
                    <Button onClick={handleDownload} className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download Encrypted PDF
                    </Button>
                    <Button variant="outline" onClick={handleReset} className="w-full">
                      Encrypt Another PDF
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
                  <h3 className="font-semibold text-blue-900 mb-2">🔒 AES-256 Encryption</h3>
                  <p className="text-sm text-blue-800">
                    Your PDF will be encrypted using industry-standard AES-256 encryption, ensuring maximum security.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Steps:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    <li>Upload the PDF file you want to protect</li>
                    <li>Enter a strong password (minimum 4 characters)</li>
                    <li>Confirm your password</li>
                    <li>Click "Encrypt PDF" to secure your document</li>
                    <li>Download the encrypted PDF</li>
                  </ol>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Security Tips:</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                    <li>Use a strong password with letters, numbers, and symbols</li>
                    <li>Don't share your password via unsecure channels</li>
                    <li>Store your password in a secure password manager</li>
                    <li>The encrypted PDF will require the password to open</li>
                  </ul>
                </div>

                {resultBlob && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">
                      ✓ PDF encrypted successfully! Your document is now password-protected.
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
