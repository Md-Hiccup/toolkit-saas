'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Copy, ArrowLeftRight, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

type TransformType = 'uppercase' | 'lowercase' | 'titlecase' | 'reverse' | 'sort' | 'unique'

const transforms = [
  { id: 'uppercase', name: 'UPPERCASE', icon: '🔠' },
  { id: 'lowercase', name: 'lowercase', icon: '🔡' },
  { id: 'titlecase', name: 'Title Case', icon: '🔤' },
  { id: 'reverse', name: 'Reverse Text', icon: '🔄' },
  { id: 'sort', name: 'Sort Lines', icon: '📊' },
  { id: 'unique', name: 'Remove Duplicates', icon: '✨' }
]

export default function TextTransformPage() {
  const [selectedTransform, setSelectedTransform] = useState<TransformType>('uppercase')
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')

  const handleTransform = () => {
    if (!inputText) {
      setOutputText('')
      return
    }
    try {
      let result = ''
      
      switch (selectedTransform) {
        case 'uppercase':
          result = inputText.toUpperCase()
          break
        case 'lowercase':
          result = inputText.toLowerCase()
          break
        case 'titlecase':
          result = inputText.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          })
          break
        case 'reverse':
          result = inputText.split('').reverse().join('')
          break
        case 'sort':
          result = inputText.split('\n').sort().join('\n')
          break
        case 'unique':
          const lines = inputText.split('\n')
          result = [...new Set(lines)].join('\n')
          break
      }
      
      setOutputText(result)
    } catch (error: any) {
      setOutputText(`Error: ${error.message || 'Operation failed'}`)
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
          <h1 className="text-3xl font-bold mb-2">Text Transform</h1>
          <p className="text-gray-600">
            Transform text with various formatting options
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Transform selector */}
              <Select
                value={selectedTransform}
                onChange={(e) => setSelectedTransform(e.target.value as TransformType)}
              >
                {transforms.map(transform => (
                  <option key={transform.id} value={transform.id}>
                    {transform.icon} {transform.name}
                  </option>
                ))}
              </Select>

              {/* Transform Button */}
              <Button
                onClick={handleTransform}
                disabled={!inputText}
                className="gap-2 ml-auto"
              >
                Transform
              </Button>

              {/* Action buttons */}
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

        {/* Editor panels */}
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
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-[calc(100vh-350px)] min-h-[400px] p-4 font-mono text-sm border-2 border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter text to transform..."
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
                value={outputText}
                readOnly
                className="w-full h-[calc(100vh-350px)] min-h-[400px] p-4 font-mono text-sm border-2 border-gray-300 rounded-lg resize-y bg-gray-50 focus:outline-none"
                placeholder="Output will appear here..."
                spellCheck={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
