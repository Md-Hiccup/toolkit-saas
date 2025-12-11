'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { encoderAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { Copy, Trash2 } from 'lucide-react'

type GeneratorType = 'uuid' | 'lorem'

export default function GeneratorsPage() {
  const [selectedGenerator, setSelectedGenerator] = useState<GeneratorType>('uuid')
  const [outputText, setOutputText] = useState('')
  const [loremParagraphs, setLoremParagraphs] = useState(3)
  const [loremLength, setLoremLength] = useState(500)
  const [loremMode, setLoremMode] = useState<'paragraphs' | 'characters'>('paragraphs')

  const handleGenerateUUID = async () => {
    try {
      const result = await encoderAPI.generateUUID()
      setOutputText(result)
    } catch (error: any) {
      const errorMsg = typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : error.message || 'Failed to generate UUID'
      toast.error(errorMsg)
    }
  }

  const handleGenerateLorem = async () => {
    try {
      console.log('DEBUG: loremMode=', loremMode, 'loremLength=', loremLength, 'loremParagraphs=', loremParagraphs)
      const result = loremMode === 'paragraphs'
        ? await encoderAPI.generateLorem(loremParagraphs, false, undefined)
        : await encoderAPI.generateLorem(0, false, loremLength)
      setOutputText(result)
    } catch (error: any) {
      const errorMsg = typeof error.response?.data?.detail === 'string' 
        ? error.response.data.detail 
        : error.message || 'Failed to generate Lorem Ipsum'
      toast.error(errorMsg)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const handleClear = () => {
    setOutputText('')
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Generators</h1>
          <p className="text-gray-600">
            Generate random data and placeholder text
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Generator Selector */}
              <Select
                value={selectedGenerator}
                onChange={(e) => {
                  setOutputText('')
                  setSelectedGenerator(e.target.value as GeneratorType)
                }}
              >
                <option value="uuid">UUID</option>
                <option value="lorem">Lorem Ipsum</option>
              </Select>

              {/* Lorem Ipsum Options */}
              {selectedGenerator === 'lorem' && (
                <>
                  <Select
                    value={loremMode}
                    onChange={(e) => setLoremMode(e.target.value as 'paragraphs' | 'characters')}
                  >
                    <option value="paragraphs">Paragraphs</option>
                    <option value="characters">Characters</option>
                  </Select>

                  {loremMode === 'paragraphs' && (
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Count:</label>
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

                  {loremMode === 'characters' && (
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Length:</label>
                      <Input
                        type="number"
                        min="10"
                        max="10000"
                        value={loremLength}
                        onChange={(e) => {
                          const val = parseInt(e.target.value)
                          if (!isNaN(val)) {
                            setLoremLength(Math.max(10, Math.min(10000, val)))
                          }
                        }}
                        className="w-32 text-center text-sm"
                        placeholder="500"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Generate Button */}
              <Button
                onClick={selectedGenerator === 'uuid' ? handleGenerateUUID : handleGenerateLorem}
                className="gap-2 ml-auto"
              >
                Generate
              </Button>

              {/* Clear Button */}
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={!outputText}
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Output</CardTitle>
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
              className="w-full h-96 p-4 font-mono text-sm border-2 border-gray-300 rounded-lg resize-y bg-gray-50 focus:outline-none"
              placeholder="Generated content will appear here..."
              value={outputText}
              readOnly
              spellCheck={false}
            />
            {outputText && (
              <p className="text-xs text-gray-500 mt-2">
                {outputText.length} characters
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
