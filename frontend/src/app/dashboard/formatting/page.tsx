'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
// import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { encoderAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { Copy, Trash2, Loader2, ArrowLeftRight, AlertCircle, CheckCircle } from 'lucide-react'

type FormatTool = {
  id: string
  name: string
  transform: any
}

const formatTools: FormatTool[] = [
  { id: 'json-format', name: 'JSON Format', transform: encoderAPI.jsonFormat },
  { id: 'json-minify', name: 'JSON Minify', transform: encoderAPI.jsonMinify },
]

export default function FormattingPage() {
  const [selectedTool, setSelectedTool] = useState<FormatTool>(formatTools[0])
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [isValid, setIsValid] = useState(true)

  // Auto-validate JSON as user types
  useEffect(() => {
    try {
      if (inputText.trim()) {
        JSON.parse(inputText)
        setIsValid(true)
        setError('')
      } else {
        setIsValid(true)
        setError('')
      }
    } catch (e: any) {
      setIsValid(false)
      setError(e.message)
    }
  }, [inputText])

  const handleProcess = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some JSON')
      return
    }

    setIsProcessing(true)
    try {
      const result = await selectedTool.transform(inputText)
      setOutputText(result)
    } catch (error: any) {
      const errorMsg = typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : error.message || 'Invalid JSON'
      setOutputText(`Error: ${errorMsg}`)
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
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Formatting</h1>
          <p className="text-gray-600">
            Format and minify JSON data
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
                  const tool = formatTools.find(t => t.id === e.target.value)
                  if (tool) {
                    setInputText('')
                    setOutputText('')
                    setSelectedTool(tool)
                  }
                }}
              >
                {formatTools.map(tool => (
                  <option key={tool.id} value={tool.id}>
                    {tool.name}
                  </option>
                ))}
              </Select>

              {/* Validation status - moved to left */}
              {inputText && (
                <div className="flex items-center gap-2">
                  {isValid ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      <span>Valid JSON</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Transform Button */}
              <Button
                onClick={handleProcess}
                disabled={isProcessing || !inputText || !isValid}
                className="gap-2 ml-auto"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Transform'
                )}
              </Button>

              {/* Swap Button */}
              <Button
                onClick={handleSwap}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={!outputText}
              >
                <ArrowLeftRight className="h-4 w-4" />
                Swap
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
                className={`w-full h-[calc(100vh-350px)] min-h-[400px] p-4 font-mono text-sm border-2 rounded-lg resize-y focus:outline-none focus:ring-2 ${
                  isValid 
                    ? 'border-gray-300 focus:ring-blue-500' 
                    : 'border-red-300 focus:ring-red-500'
                }`}
                placeholder="Enter JSON to format..."
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
                placeholder="Formatted JSON will appear here..."
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
