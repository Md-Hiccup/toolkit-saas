'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { Copy, Play, AlertCircle, CheckCircle } from 'lucide-react'

export default function JSONEditorPage() {
  const [inputJSON, setInputJSON] = useState(`{
  "Library": {
    "Name": "Central City Library",
    "Location": "Downtown",
    "Members": [
      {
        "MemberID": "M001",
        "Name": "Alice Johnson",
        "Purchases": [
          {
            "BookTitle": "The Great Adventure",
            "ISBN": "978-1234567890",
            "Category": "Fiction",
            "Price": 24.99,
            "Copies": 2,
            "Discount": 0.1
          },
          {
            "BookTitle": "Learn Python",
            "ISBN": "978-0987654321",
            "Category": "Programming",
            "Price": 45.50,
            "Copies": 1,
            "Discount": 0.15
          }
        ]
      },
      {
        "MemberID": "M002",
        "Name": "Bob Smith",
        "Purchases": [
          {
            "BookTitle": "Mystery of the Lake",
            "ISBN": "978-1122334455",
            "Category": "Mystery",
            "Price": 19.99,
            "Copies": 3,
            "Discount": 0.05
          },
          {
            "BookTitle": "Cooking Basics",
            "ISBN": "978-5544332211",
            "Category": "Lifestyle",
            "Price": 32.00,
            "Copies": 1,
            "Discount": 0.2
          }
        ]
      }
    ]
  }
}`)
  const [expression, setExpression] = useState('$sum(Library.Members.Purchases.(Price * Copies * (1 - Discount)))')
  const [output, setOutput] = useState('')
  const [operation, setOperation] = useState<'format' | 'minify' | 'query' | 'transform'>('query')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [isValid, setIsValid] = useState(true)
  const [selectedExample, setSelectedExample] = useState('default')

  // Update expression when operation changes
  useEffect(() => {
    if (selectedExample && selectedExample !== 'none') {
      loadExample(selectedExample)
    }
  }, [operation])

  // Auto-validate JSON as user types
  useEffect(() => {
    try {
      if (inputJSON.trim()) {
        JSON.parse(inputJSON)
        setIsValid(true)
        setError('')
      }
    } catch (e: any) {
      setIsValid(false)
      setError(e.message)
    }
  }, [inputJSON])

  const handleTransform = async () => {
    setIsProcessing(true)
    setError('')
    
    try {
      const response = await api.post('/json-editor/transform', {
        input_json: inputJSON,
        expression: expression || undefined,
        operation: operation
      })
      
      if (response.data.success) {
        setOutput(response.data.result)
        toast.success('Transformation successful!')
      } else {
        setError(response.data.error || 'Transformation failed')
        toast.error(response.data.error || 'Transformation failed')
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'An error occurred'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const loadExample = (example: string) => {
    const examples: Record<string, any> = {
      default: {
        Library: {
          Name: "Central City Library",
          Location: "Downtown",
          Members: [
            {
              MemberID: "M001",
              Name: "Alice Johnson",
              Purchases: [
                { BookTitle: "The Great Adventure", Price: 24.99, Copies: 2, Discount: 0.1 },
                { BookTitle: "Learn Python", Price: 45.50, Copies: 1, Discount: 0.15 }
              ]
            },
            {
              MemberID: "M002",
              Name: "Bob Smith",
              Purchases: [
                { BookTitle: "Mystery of the Lake", Price: 19.99, Copies: 3, Discount: 0.05 },
                { BookTitle: "Cooking Basics", Price: 32.00, Copies: 1, Discount: 0.2 }
              ]
            }
          ]
        }
      },
      restaurant: {
        Restaurant: {
          Name: "Tasty Bites",
          Orders: [
            { Item: "Pizza", Price: 12.99, Quantity: 2 },
            { Item: "Burger", Price: 8.50, Quantity: 3 },
            { Item: "Salad", Price: 6.75, Quantity: 1 }
          ]
        }
      },
      payroll: {
        Company: {
          Name: "Tech Solutions Inc",
          Departments: [
            {
              Name: "Engineering",
              Employees: [
                { Name: "Sarah", Salary: 85000, Bonus: 5000 },
                { Name: "Mike", Salary: 92000, Bonus: 7000 }
              ]
            },
            {
              Name: "Marketing",
              Employees: [
                { Name: "Emma", Salary: 65000, Bonus: 3000 },
                { Name: "John", Salary: 70000, Bonus: 4000 }
              ]
            }
          ]
        }
      },
      sales: {
        Store: {
          Name: "Electronics Hub",
          Sales: [
            { Product: "Laptop", Price: 899, Quantity: 2, Tax: 0.08 },
            { Product: "Mouse", Price: 25, Quantity: 5, Tax: 0.08 },
            { Product: "Keyboard", Price: 75, Quantity: 3, Tax: 0.08 }
          ]
        }
      },
      students: {
        School: {
          Name: "Springfield High",
          Classes: [
            {
              Subject: "Math",
              Students: [
                { Name: "Tom", Score: 85, Attendance: 0.95 },
                { Name: "Jane", Score: 92, Attendance: 0.98 }
              ]
            },
            {
              Subject: "Science",
              Students: [
                { Name: "Tom", Score: 78, Attendance: 0.90 },
                { Name: "Jane", Score: 88, Attendance: 0.96 }
              ]
            }
          ]
        }
      },
      inventory: {
        Warehouse: {
          Name: "Main Storage",
          Items: [
            { Product: "Widget A", Stock: 150, UnitPrice: 5.50, ReorderLevel: 50 },
            { Product: "Widget B", Stock: 75, UnitPrice: 8.25, ReorderLevel: 30 },
            { Product: "Widget C", Stock: 200, UnitPrice: 3.75, ReorderLevel: 100 }
          ]
        }
      }
    }
    
    setInputJSON(JSON.stringify(examples[example], null, 2))
    
    // Set appropriate expressions based on operation type
    if (operation === 'query') {
      const queries: Record<string, string> = {
        default: '$sum(Library.Members.Purchases.(Price * Copies * (1 - Discount)))',
        restaurant: '$sum(Restaurant.Orders.(Price * Quantity))',
        payroll: '$sum(Company.Departments.Employees.(Salary + Bonus))',
        sales: '$sum(Store.Sales.(Price * Quantity * (1 + Tax)))',
        students: '$avg(School.Classes.Students.Score)',
        inventory: '$sum(Warehouse.Items.(Stock * UnitPrice))'
      }
      setExpression(queries[example] || '')
    } else if (operation === 'transform') {
      const transforms: Record<string, string> = {
        default: '{ "LibraryName": Library.Name, "TotalRevenue": $sum(Library.Members.Purchases.(Price * Copies * (1 - Discount))), "MemberCount": $count(Library.Members) }',
        restaurant: '{ "Restaurant": Restaurant.Name, "TotalSales": $sum(Restaurant.Orders.(Price * Quantity)), "OrderCount": $count(Restaurant.Orders) }',
        payroll: '{ "Company": Company.Name, "TotalPayroll": $sum(Company.Departments.Employees.(Salary + Bonus)), "EmployeeCount": $count(Company.Departments.Employees) }',
        sales: '{ "Store": Store.Name, "TotalRevenue": $sum(Store.Sales.(Price * Quantity * (1 + Tax))), "SalesCount": $count(Store.Sales) }',
        students: '{ "School": School.Name, "AverageScore": $avg(School.Classes.Students.Score), "StudentCount": $count(School.Classes.Students) }',
        inventory: '{ "Warehouse": Warehouse.Name, "TotalValue": $sum(Warehouse.Items.(Stock * UnitPrice)), "ItemCount": $count(Warehouse.Items) }'
      }
      setExpression(transforms[example] || '')
    }
    
    setSelectedExample(example)
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">JSON Editor & Transformer</h1>
          <p className="text-gray-600">
            Edit, format, query, and transform JSON data in real-time
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Operation selector */}
              <Select
                value={operation}
                onChange={(e) => setOperation(e.target.value as any)}
              >
                <option value="format">Format</option>
                <option value="minify">Minify</option>
                <option value="query">Query</option>
                <option value="transform">Transform</option>
              </Select>

              {/* Example loader */}
              <Select
                onChange={(e) => {
                  if (e.target.value === 'none') {
                    setSelectedExample('none')
                    setInputJSON('')
                    setOutput('')
                    setExpression('')
                  } else if (e.target.value) {
                    loadExample(e.target.value)
                  }
                }}
                value={selectedExample}
              >
                <option value="none">🚫 None - Custom JSON</option>
                <option value="default">📚 Default - Library (Discount Calc)</option>
                <option value="restaurant">🍕 Restaurant - Total Bill</option>
                <option value="payroll">🏢 Company - Payroll Sum</option>
                <option value="sales">🛒 Store - Sales with Tax</option>
                <option value="students">🎓 School - Average Score</option>
                <option value="inventory">📦 Warehouse - Inventory Value</option>
              </Select>

              {/* Action Button for Format/Minify */}
              {(operation === 'format' || operation === 'minify') && (
                <Button
                  onClick={handleTransform}
                  disabled={isProcessing || !isValid}
                  className="gap-2 ml-auto"
                >
                  <Play className="h-4 w-4" />
                  {isProcessing ? 'Processing...' : operation === 'format' ? 'Format' : 'Minify'}
                </Button>
              )}

              {/* Validation status */}
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
            </div>
          </CardContent>
        </Card>

        {/* Editor panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side: Input JSON */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Input JSON</CardTitle>
                <button
                  onClick={() => handleCopy(inputJSON)}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                value={inputJSON}
                onChange={(e) => setInputJSON(e.target.value)}
                className={`w-full h-[calc(100vh-300px)] min-h-[500px] p-4 font-mono text-sm border-2 rounded-lg resize-y focus:outline-none focus:ring-2 ${
                  isValid 
                    ? 'border-gray-300 focus:ring-blue-500' 
                    : 'border-red-300 focus:ring-red-500'
                }`}
                placeholder="Enter JSON here..."
                spellCheck={false}
              />
            </CardContent>
          </Card>

          {/* Right side: Query and Output */}
          <div className="space-y-6">
            {/* Query section */}
            {(operation === 'query' || operation === 'transform') && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      {operation === 'query' ? 'Query Expression' : 'Transform Expression'}
                    </CardTitle>
                    <Button
                      onClick={handleTransform}
                      disabled={isProcessing || !isValid}
                      className="gap-2"
                      size="sm"
                    >
                      <Play className="h-4 w-4" />
                      {isProcessing ? 'Running...' : 'Run'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <textarea
                    placeholder={
                      operation === 'query' 
                        ? 'e.g., $sum(Account.Order.Product.(Price * Quantity))' 
                        : 'e.g., keys, values, length, sort, reverse, unique'
                    }
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        e.preventDefault()
                        handleTransform()
                      }
                    }}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                    style={{
                      minHeight: '4rem',
                      maxHeight: '30rem'
                    }}
                  />
                  {operation === 'query' && (
                    <div className="mt-2 text-xs text-gray-500">
                      💡 Press Ctrl+Enter (Cmd+Enter on Mac) to run | Supports: $sum(), $avg(), $min(), $max(), $count()
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Output panel */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Output</CardTitle>
                  <button
                    onClick={() => handleCopy(output)}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    disabled={!output}
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <textarea
                  value={output}
                  readOnly
                  className="w-full h-[400px] p-4 font-mono text-sm border-2 border-gray-300 rounded-lg resize-y bg-gray-50 focus:outline-none"
                  placeholder="Output will appear here..."
                  spellCheck={false}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Help section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Operations:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li><strong>Format:</strong> Pretty-print JSON with indentation</li>
                  <li><strong>Minify:</strong> Remove whitespace and compress</li>
                  <li><strong>Query:</strong> Extract data & calculate</li>
                  <li><strong>Transform:</strong> Apply operations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Query Examples:</h4>
                <ul className="space-y-1 text-gray-600 font-mono text-xs">
                  <li>user.name → Get property</li>
                  <li>items[0] → First item</li>
                  <li>address.city → Navigate</li>
                </ul>
                <h4 className="font-semibold mt-3 mb-2">Calculations:</h4>
                <ul className="space-y-1 text-gray-600 font-mono text-xs">
                  <li>$sum(posts.id) → Add IDs</li>
                  <li>$avg(items.price) → Average</li>
                  <li>$min(scores) → Minimum</li>
                  <li>$max(scores) → Maximum</li>
                  <li>$count(items) → Count</li>
                </ul>
                <h4 className="font-semibold mt-3 mb-2">Complex Math:</h4>
                <ul className="space-y-1 text-gray-600 font-mono text-xs">
                  <li>$sum(Order.(Price*Qty))</li>
                  <li>$avg(Items.(Cost+Tax))</li>
                  <li>sum(Sales.(Price*0.9))</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Transform:</h4>
                <ul className="space-y-1 text-gray-600 font-mono text-xs">
                  <li>keys → Object keys</li>
                  <li>values → Object values</li>
                  <li>length → Count</li>
                  <li>sort → Sort array</li>
                  <li>reverse → Reverse</li>
                  <li>unique → Remove dupes</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">💡 Complex Calculation Examples:</h4>
              <div className="text-xs text-gray-700 space-y-2">
                <div>
                  <p className="font-semibold">Simple Addition:</p>
                  <p>Data: <code className="bg-white px-1 rounded">{`{"posts": [{"id": 1}, {"id": 2}]}`}</code></p>
                  <p>Query: <code className="bg-white px-1 rounded">$sum(posts.id)</code> → <strong>3</strong> (1+2)</p>
                </div>
                <div className="border-t pt-2">
                  <p className="font-semibold">Nested Arrays (Account → Order → Product):</p>
                  <p>Data: Account has Order array, each Order has Product array</p>
                  <p>Query: <code className="bg-white px-1 rounded">$sum(Account.Order.Product.(Price * Quantity))</code></p>
                  <p className="text-gray-600 mt-1">
                    Example: Order1: (34.45×2 + 21.67×1) + Order2: (34.45×4 + 107.99×1) = <strong>316.55</strong>
                  </p>
                </div>
                <div className="border-t pt-2">
                  <p className="font-semibold">Both syntaxes work:</p>
                  <p>• <code className="bg-white px-1 rounded">$sum(...)</code> - JSONata style (with $)</p>
                  <p>• <code className="bg-white px-1 rounded">sum(...)</code> - Standard style (without $)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
