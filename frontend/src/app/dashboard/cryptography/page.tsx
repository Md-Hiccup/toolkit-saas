'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
// import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { encoderAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { Copy, Trash2, Loader2, ArrowLeftRight } from 'lucide-react'

type CryptoTool = {
  id: string
  name: string
  transform: any
  requiresSecret?: boolean
}

const cryptoTools: CryptoTool[] = [
  { id: 'md5', name: 'MD5', transform: encoderAPI.hashMD5 },
  { id: 'sha1', name: 'SHA1', transform: encoderAPI.hashSHA1 },
  { id: 'sha256', name: 'SHA256', transform: encoderAPI.hashSHA256 },
  { id: 'sha512', name: 'SHA512', transform: encoderAPI.hashSHA512 },
  { id: 'hmac-md5', name: 'HMAC-MD5', transform: (t: string, s: string) => encoderAPI.hmacMD5(t, s), requiresSecret: true },
  { id: 'hmac-sha1', name: 'HMAC-SHA1', transform: (t: string, s: string) => encoderAPI.hmacSHA1(t, s), requiresSecret: true },
  { id: 'hmac-sha256', name: 'HMAC-SHA256', transform: (t: string, s: string) => encoderAPI.hmacSHA256(t, s), requiresSecret: true },
  { id: 'hmac-sha512', name: 'HMAC-SHA512', transform: (t: string, s: string) => encoderAPI.hmacSHA512(t, s), requiresSecret: true },
]

export default function CryptographyPage() {
  const [selectedTool, setSelectedTool] = useState<CryptoTool>(cryptoTools[0])
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [secret, setSecret] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [secretError, setSecretError] = useState('')

  const handleProcess = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text')
      return
    }

    if (selectedTool.requiresSecret && !secret.trim()) {
      setSecretError('Secret key is required')
      return
    }

    setIsProcessing(true)
    try {
      const result = selectedTool.requiresSecret
        ? await selectedTool.transform(inputText, secret)
        : await selectedTool.transform(inputText)
      
      setOutputText(result)
    } catch (error: any) {
      const errorMsg = typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : error.message || 'Operation failed'
      setOutputText(`Error: ${errorMsg}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const handleClear = () => {
    setInputText('')
    setOutputText('')
    setSecret('')
    setSecretError('')
  }

  const handleSecretChange = (value: string) => {
    setSecret(value)
    setSecretError('')
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Cryptography</h1>
          <p className="text-gray-600">
            Hash and encrypt text with various cryptographic algorithms
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Tool Selector */}
              <Select
                value={selectedTool.id}
                onChange={(e) => {
                  const tool = cryptoTools.find(t => t.id === e.target.value)
                  if (tool) {
                    setInputText('')
                    setOutputText('')
                    setSecret('')
                    setSecretError('')
                    setSelectedTool(tool)
                  }
                }}
              >
                {cryptoTools.map(tool => (
                  <option key={tool.id} value={tool.id}>
                    {tool.name}
                  </option>
                ))}
              </Select>

              {/* Hash Button */}
              <Button
                onClick={handleProcess}
                disabled={isProcessing || !inputText}
                className="gap-2 ml-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Hash'
                )}
              </Button>

              {/* Clear Button */}
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={!inputText && !outputText}
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Secret Key Input */}
        {selectedTool.requiresSecret && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Secret Key
                </label>
                <Input
                  type="text"
                  placeholder="Enter secret key (min 3 characters)"
                  value={secret}
                  onChange={(e) => handleSecretChange(e.target.value)}
                  className={secretError ? 'border-red-500' : ''}
                />
                {secretError && (
                  <p className="text-red-500 text-sm mt-1">{secretError}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Input/Output Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Input</CardTitle>
                <button
                  onClick={() => handleCopy(inputText)}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  disabled={!inputText}
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full h-[calc(100vh-350px)] min-h-[400px] p-4 font-mono text-sm border-2 border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter text to hash..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                spellCheck={false}
              />
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Output</CardTitle>
                <button
                  onClick={() => handleCopy(outputText)}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  disabled={!outputText}
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full h-[calc(100vh-350px)] min-h-[400px] p-4 font-mono text-sm border-2 border-gray-300 rounded-lg resize-y bg-gray-50 focus:outline-none"
                placeholder="Hash will appear here..."
                value={outputText}
                readOnly
                spellCheck={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
