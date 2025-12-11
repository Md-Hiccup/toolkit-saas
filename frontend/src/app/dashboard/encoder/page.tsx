'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { encoderAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { Copy, ArrowRightLeft, Loader2 } from 'lucide-react'

type EncoderTool = {
  id: string
  name: string
  category: string
  encode?: any
  decode?: any
  transform?: any
  requiresSecret?: boolean
}

const tools: EncoderTool[] = [
  // Encoders/Decoders
  { id: 'jwt', name: 'JWT', category: 'Encoders/Decoders', encode: (t: string, s: string) => encoderAPI.jwtEncode(t, s), decode: (t: string, s: string) => encoderAPI.jwtDecode(t, s), requiresSecret: true },
  { id: 'base32', name: 'Base32', category: 'Encoders/Decoders', encode: encoderAPI.base32Encode, decode: encoderAPI.base32Decode },
  { id: 'base64', name: 'Base64', category: 'Encoders/Decoders', encode: encoderAPI.base64Encode, decode: encoderAPI.base64Decode },
  { id: 'url-base64', name: 'URL Base64', category: 'Encoders/Decoders', encode: encoderAPI.urlBase64Encode, decode: encoderAPI.urlBase64Decode },
  { id: 'mime-base64', name: 'MIME Base64', category: 'Encoders/Decoders', encode: encoderAPI.mimeBase64Encode, decode: encoderAPI.mimeBase64Decode },
  { id: 'url', name: 'URL Encoding', category: 'Encoders/Decoders', encode: encoderAPI.urlEncode, decode: encoderAPI.urlDecode },
  
  // Cryptography - Hashing
  { id: 'md5', name: 'MD5', category: 'Cryptography', transform: encoderAPI.hashMD5 },
  { id: 'sha1', name: 'SHA1', category: 'Cryptography', transform: encoderAPI.hashSHA1 },
  { id: 'sha256', name: 'SHA256', category: 'Cryptography', transform: encoderAPI.hashSHA256 },
  { id: 'sha512', name: 'SHA512', category: 'Cryptography', transform: encoderAPI.hashSHA512 },
  
  // Cryptography - HMAC
  { id: 'hmac-md5', name: 'HMAC-MD5', category: 'Cryptography', transform: (t: string, s: string) => encoderAPI.hmacMD5(t, s), requiresSecret: true },
  { id: 'hmac-sha1', name: 'HMAC-SHA1', category: 'Cryptography', transform: (t: string, s: string) => encoderAPI.hmacSHA1(t, s), requiresSecret: true },
  { id: 'hmac-sha256', name: 'HMAC-SHA256', category: 'Cryptography', transform: (t: string, s: string) => encoderAPI.hmacSHA256(t, s), requiresSecret: true },
  { id: 'hmac-sha512', name: 'HMAC-SHA512', category: 'Cryptography', transform: (t: string, s: string) => encoderAPI.hmacSHA512(t, s), requiresSecret: true },
  
  // Formatting
  { id: 'json-format', name: 'JSON Format', category: 'Formatting', transform: encoderAPI.jsonFormat },
  { id: 'json-minify', name: 'JSON Minify', category: 'Formatting', transform: encoderAPI.jsonMinify },
  
  // Text Case
  { id: 'uppercase', name: 'UPPERCASE', category: 'Text Case', transform: encoderAPI.textUpper },
  { id: 'lowercase', name: 'lowercase', category: 'Text Case', transform: encoderAPI.textLower },
  { id: 'titlecase', name: 'Title Case', category: 'Text Case', transform: encoderAPI.textTitle },
  { id: 'reverse', name: 'Reverse Text', category: 'Text Tools', transform: encoderAPI.textReverse },
  { id: 'sort', name: 'Sort Lines', category: 'Text Tools', transform: encoderAPI.textSort },
  
  // Generators
  { id: 'uuid', name: 'UUID', category: 'Generators' },
  { id: 'lorem', name: 'Lorem Ipsum', category: 'Generators' },
]

export default function EncoderPage() {
  const searchParams = useSearchParams()
  const [selectedTool, setSelectedTool] = useState<EncoderTool>(tools[0])
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [secret, setSecret] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<'encode' | 'decode'>('encode')
  const [inputError, setInputError] = useState('')
  const [secretError, setSecretError] = useState('')
  const [loremParagraphs, setLoremParagraphs] = useState(3)
  const [loremLength, setLoremLength] = useState(500)
  const [loremMode, setLoremMode] = useState<'paragraphs' | 'characters'>('paragraphs')
  const [useLoremIpsum, setUseLoremIpsum] = useState(false)

  const categories = Array.from(new Set(tools.map(t => t.category)))

  // Handle URL query parameter for tool selection
  useEffect(() => {
    const toolParam = searchParams.get('tool')
    if (toolParam) {
      const tool = tools.find(t => t.id === toolParam)
      if (tool) {
        // Clear all inputs when switching tools
        setInputText('')
        setOutputText('')
        setSecret('')
        setInputError('')
        setSecretError('')
        setSelectedTool(tool)
      }
    }
  }, [searchParams])

  const validateInput = (): boolean => {
    // Reset errors
    setInputError('')
    setSecretError('')

    // Check if input is empty
    if (!inputText.trim()) {
      setInputError('❌ Input is empty. Please enter some text to process.')
      return false
    }

    // Validate secret key for operations that require it
    if (selectedTool.requiresSecret) {
      if (!secret.trim()) {
        setSecretError('❌ Secret key is missing. This operation requires a secret key.')
        return false
      }
      if (secret.length < 3) {
        setSecretError(`❌ Secret key too short. Current: ${secret.length} characters. Required: at least 3 characters.`)
        return false
      }
    }

    // Validate JSON for JSON operations
    if (selectedTool.id === 'json-format' || selectedTool.id === 'json-minify') {
      try {
        JSON.parse(inputText)
      } catch (e: any) {
        const errorMsg = e.message || 'Unknown error'
        const match = errorMsg.match(/position (\d+)/)
        const position = match ? match[1] : 'unknown'
        setInputError(`❌ Invalid JSON at position ${position}. ${errorMsg}`)
        return false
      }
    }

    // Validate JWT format for JWT decode
    if (selectedTool.id === 'jwt' && activeTab === 'decode') {
      const parts = inputText.trim().split('.')
      if (parts.length !== 3) {
        setInputError(`❌ Invalid JWT structure. Found ${parts.length} part(s), expected 3 parts (header.payload.signature).`)
        return false
      }
      
      const jwtPattern = /^[A-Za-z0-9-_]+$/
      for (let i = 0; i < parts.length; i++) {
        if (!jwtPattern.test(parts[i]) && !(i === 2 && parts[i] === '')) {
          const invalidChars = parts[i].match(/[^A-Za-z0-9-_]/g)
          setInputError(`❌ Invalid characters in JWT part ${i + 1}: "${invalidChars?.join(', ')}". Only A-Z, a-z, 0-9, -, and _ are allowed.`)
          return false
        }
      }
    }

    // Validate Base64 format for Base64 decode
    if ((selectedTool.id === 'base64' || selectedTool.id === 'mime-base64') && activeTab === 'decode') {
      const cleanInput = inputText.replace(/\s/g, '')
      const invalidChars = cleanInput.match(/[^A-Za-z0-9+/=]/g)
      
      if (invalidChars) {
        const uniqueInvalid = [...new Set(invalidChars)]
        setInputError(`❌ Invalid Base64 characters found: "${uniqueInvalid.join(', ')}". Only A-Z, a-z, 0-9, +, /, and = are allowed.`)
        return false
      }
      
      // Check padding
      const paddingCount = (cleanInput.match(/=/g) || []).length
      if (paddingCount > 2) {
        setInputError(`❌ Invalid Base64 padding. Found ${paddingCount} '=' characters, maximum allowed is 2.`)
        return false
      }
      
      // Check if padding is at the end
      if (paddingCount > 0 && !cleanInput.endsWith('='.repeat(paddingCount))) {
        setInputError(`❌ Invalid Base64 padding. Padding '=' must be at the end of the string.`)
        return false
      }
    }

    // Validate Base32 format for Base32 decode
    if (selectedTool.id === 'base32' && activeTab === 'decode') {
      const cleanInput = inputText.replace(/\s/g, '').toUpperCase()
      const invalidChars = cleanInput.match(/[^A-Z2-7=]/g)
      
      if (invalidChars) {
        const uniqueInvalid = [...new Set(invalidChars)]
        setInputError(`❌ Invalid Base32 characters found: "${uniqueInvalid.join(', ')}". Only A-Z, 2-7, and = are allowed.`)
        return false
      }
      
      // Check if padding is at the end
      const paddingMatch = cleanInput.match(/=+$/)
      const paddingCount = paddingMatch ? paddingMatch[0].length : 0
      const nonPaddingPart = cleanInput.slice(0, cleanInput.length - paddingCount)
      
      if (nonPaddingPart.includes('=')) {
        setInputError(`❌ Invalid Base32 padding. Padding '=' must only be at the end of the string.`)
        return false
      }
    }

    // Validate URL encoding for URL decode
    if (selectedTool.id === 'url' && activeTab === 'decode') {
      const invalidPattern = /%[^0-9A-Fa-f]/g
      const matches = inputText.match(invalidPattern)
      if (matches) {
        setInputError(`❌ Invalid URL encoding found: "${matches[0]}". After '%', only hexadecimal digits (0-9, A-F) are allowed.`)
        return false
      }
      
      // Check for incomplete encoding
      const incompletePattern = /%[0-9A-Fa-f]?$/
      if (incompletePattern.test(inputText)) {
        setInputError(`❌ Incomplete URL encoding at the end. '%' must be followed by exactly 2 hexadecimal digits.`)
        return false
      }
    }

    return true
  }

  // Real-time validation as user types
  const validateInputRealtime = (value: string) => {
    if (!value.trim()) {
      setInputError('')
      return
    }

    // JSON validation
    if (selectedTool.id === 'json-format' || selectedTool.id === 'json-minify') {
      try {
        JSON.parse(value)
        setInputError('')
      } catch (e: any) {
        const errorMsg = e.message || 'Unknown error'
        const match = errorMsg.match(/position (\d+)/)
        const position = match ? match[1] : 'unknown'
        setInputError(`⚠️ JSON syntax error at position ${position}`)
      }
    }

    // JWT validation
    if (selectedTool.id === 'jwt' && activeTab === 'decode') {
      const parts = value.trim().split('.')
      if (parts.length < 3) {
        setInputError(`⚠️ JWT incomplete. Found ${parts.length}/3 parts.`)
      } else if (parts.length > 3) {
        setInputError(`⚠️ JWT has too many parts. Found ${parts.length}, expected 3.`)
      } else {
        setInputError('')
      }
    }

    // Base64 validation
    if ((selectedTool.id === 'base64' || selectedTool.id === 'mime-base64') && activeTab === 'decode') {
      const cleanInput = value.replace(/\s/g, '')
      const invalidChars = cleanInput.match(/[^A-Za-z0-9+/=]/g)
      if (invalidChars) {
        const uniqueInvalid = [...new Set(invalidChars)]
        setInputError(`⚠️ Invalid characters: "${uniqueInvalid.join(', ')}"`)
      } else {
        setInputError('')
      }
    }

    // Base32 validation
    if (selectedTool.id === 'base32' && activeTab === 'decode') {
      const cleanInput = value.replace(/\s/g, '').toUpperCase()
      const invalidChars = cleanInput.match(/[^A-Z2-7=]/g)
      if (invalidChars) {
        const uniqueInvalid = [...new Set(invalidChars)]
        setInputError(`⚠️ Invalid characters: "${uniqueInvalid.join(', ')}"`)
      } else {
        setInputError('')
      }
    }
  }

  const handleProcess = async () => {
    if (!validateInput()) {
      return
    }

    setIsProcessing(true)
    try {
      let result: string

      if (selectedTool.transform) {
        // For hash/transform operations
        result = selectedTool.requiresSecret 
          ? await selectedTool.transform(inputText, secret)
          : await selectedTool.transform(inputText)
      } else if (activeTab === 'encode' && selectedTool.encode) {
        result = selectedTool.requiresSecret
          ? await selectedTool.encode(inputText, secret)
          : await selectedTool.encode(inputText)
      } else if (activeTab === 'decode' && selectedTool.decode) {
        result = selectedTool.requiresSecret
          ? await selectedTool.decode(inputText, secret)
          : await selectedTool.decode(inputText)
      } else {
        toast.error('Operation not supported')
        return
      }

      setOutputText(result)
      toast.success('Operation completed!')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Operation failed')
      setOutputText('')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const handleSwap = () => {
    setInputText(outputText)
    setOutputText(inputText)
  }

  const handleClear = () => {
    setInputText('')
    setOutputText('')
    setSecret('')
    setInputError('')
    setSecretError('')
  }

  const handleInputChange = (value: string) => {
    setInputText(value)
    // Run real-time validation
    validateInputRealtime(value)
  }

  const handleSecretChange = (value: string) => {
    setSecret(value)
    // Clear error and validate length in real-time
    if (value.trim() && value.length < 3) {
      setSecretError(`⚠️ Secret key too short (${value.length}/3 characters minimum)`)
    } else {
      setSecretError('')
    }
  }

  // Handle generators when selected from sidebar
  useEffect(() => {
    const toolParam = searchParams.get('tool')
    if (toolParam === 'uuid') {
      handleGenerateUUID()
    } else if (toolParam === 'lorem') {
      handleGenerateLorem()
    }
  }, [searchParams])

  const handleGenerateUUID = async () => {
    const uuid = await encoderAPI.generateUUID()
    setOutputText(uuid)
    toast.success('UUID generated!')
  }

  const handleGenerateLorem = async () => {
    let lorem = await encoderAPI.generateLorem(loremMode === 'paragraphs' ? loremParagraphs : 10, useLoremIpsum)
    
    // If character mode, trim to specified length
    if (loremMode === 'characters') {
      lorem = lorem.substring(0, loremLength)
      toast.success(`Generated ${loremLength} characters!`)
    } else {
      const textType = useLoremIpsum ? 'Lorem Ipsum' : 'random text'
      toast.success(`Generated ${loremParagraphs} paragraph${loremParagraphs > 1 ? 's' : ''} of ${textType}!`)
    }
    
    setOutputText(lorem)
  }

  // Check if current tool is a generator
  const isGenerator = selectedTool.id === 'uuid' || selectedTool.id === 'lorem'

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          {isGenerator ? 'Generator' : 'Encoder / Decoder'}
        </h1>
        <p className="text-gray-600 mb-8">
          {isGenerator 
            ? 'Generate random data and placeholder text'
            : 'Encode, decode, hash, and transform text with various algorithms'
          }
        </p>

        <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedTool.name}</CardTitle>
                    <CardDescription>{selectedTool.category}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleClear}>
                      Clear
                    </Button>
                    {!selectedTool.transform && !isGenerator && (
                      <Button variant="outline" size="sm" onClick={handleSwap}>
                        <ArrowRightLeft className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Generator UI - Only show generate button and output */}
                {isGenerator ? (
                  <>
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">
                        {selectedTool.id === 'uuid' 
                          ? 'Click the button below to generate a new UUID (Universally Unique Identifier)'
                          : 'Select the number of paragraphs and click generate'
                        }
                      </p>
                      
                      {/* Lorem Ipsum options */}
                      {selectedTool.id === 'lorem' && (
                        <div className="mb-6">
                          {/* Compact single-line controls */}
                          <div className="flex items-center justify-center gap-6 flex-wrap">
                            {/* Text type selector */}
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700">Type:</label>
                              <select
                                value={useLoremIpsum ? 'lorem' : 'random'}
                                onChange={(e) => setUseLoremIpsum(e.target.value === 'lorem')}
                                className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
                                style={{
                                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                  backgroundSize: '1.5rem',
                                  backgroundPosition: 'right 0.5rem center'
                                }}
                              >
                                <option value="random">🎲 Random Text</option>
                                <option value="lorem">📝 Lorem Ipsum</option>
                              </select>
                            </div>

                            {/* Mode selector */}
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-700">By:</label>
                              <select
                                value={loremMode}
                                onChange={(e) => setLoremMode(e.target.value as 'paragraphs' | 'characters')}
                                className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
                                style={{
                                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                  backgroundSize: '1.5rem',
                                  backgroundPosition: 'right 0.5rem center'
                                }}
                              >
                                <option value="paragraphs">📄 Paragraphs</option>
                                <option value="characters">🔤 Characters</option>
                              </select>
                            </div>

                            {/* Paragraph selector */}
                            {loremMode === 'paragraphs' && (
                              <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Count:</label>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setLoremParagraphs(Math.max(1, loremParagraphs - 1))}
                                    className="w-8 h-8 border rounded hover:bg-gray-100 flex items-center justify-center"
                                  >
                                    -
                                  </button>
                                  <span className="w-10 text-center font-semibold text-sm">{loremParagraphs}</span>
                                  <button
                                    onClick={() => setLoremParagraphs(Math.min(10, loremParagraphs + 1))}
                                    className="w-8 h-8 border rounded hover:bg-gray-100 flex items-center justify-center"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Character length input */}
                            {loremMode === 'characters' && (
                              <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Length:</label>
                                <Input
                                  type="number"
                                  min="10"
                                  max="10000"
                                  value={loremLength}
                                  onChange={(e) => setLoremLength(Math.max(10, Math.min(10000, parseInt(e.target.value) || 500)))}
                                  className="w-24 text-center text-sm"
                                  placeholder="500"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <Button 
                        onClick={selectedTool.id === 'uuid' ? handleGenerateUUID : handleGenerateLorem}
                        className="px-8"
                      >
                        Generate {selectedTool.name}
                      </Button>
                    </div>

                    {/* Output for Generators */}
                    {outputText && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium">
                            Generated Output
                          </label>
                          <button
                            onClick={() => handleCopy(outputText)}
                            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                          >
                            <Copy className="h-3 w-3" />
                            Copy
                          </button>
                        </div>
                        <textarea
                          className="w-full h-96 p-3 border rounded-lg font-mono text-sm resize-y bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={outputText}
                          readOnly
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {outputText.length} characters
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                {/* Regular Encoder/Decoder UI */}
                {/* Encode/Decode Tabs */}
                {!selectedTool.transform && (
                  <div className="flex gap-2 border-b">
                    <button
                      onClick={() => setActiveTab('encode')}
                      className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === 'encode'
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Encode
                    </button>
                    <button
                      onClick={() => setActiveTab('decode')}
                      className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === 'decode'
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Decode
                    </button>
                  </div>
                )}

                {/* Secret Key Input */}
                {selectedTool.requiresSecret && (
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
                )}

                {/* Input Text */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">
                      Input
                    </label>
                    <button
                      onClick={() => handleCopy(inputText)}
                      className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                      disabled={!inputText}
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                  </div>
                  <textarea
                    className={`w-full h-48 p-3 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 ${
                      inputError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                    }`}
                    placeholder="Enter text here..."
                    value={inputText}
                    onChange={(e) => handleInputChange(e.target.value)}
                  />
                  {inputError && (
                    <p className="text-red-500 text-sm mt-1">{inputError}</p>
                  )}
                </div>

                {/* Process Button */}
                <Button
                  onClick={handleProcess}
                  disabled={isProcessing || !inputText}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    selectedTool.transform ? 'Transform' : activeTab === 'encode' ? 'Encode' : 'Decode'
                  )}
                </Button>

                {/* Output Text */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">
                      Output
                    </label>
                    <button
                      onClick={() => handleCopy(outputText)}
                      className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                      disabled={!outputText}
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                  </div>
                  <textarea
                    className="w-full h-48 p-3 border rounded-lg font-mono text-sm resize-none bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Output will appear here..."
                    value={outputText}
                    readOnly
                  />
                </div>
                </>
                )}
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
