import * as React from "react"
import { ChevronDown, Check } from "lucide-react"

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  disabled?: boolean
  children: React.ReactNode
  className?: string
}

const Select = ({ value, onChange, disabled, children, className }: SelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Extract options from children
  const options = React.Children.toArray(children).map((child: any) => ({
    value: child.props.value,
    label: child.props.children,
  }))

  const selectedOption = options.find(opt => opt.value === selectedValue)

  React.useEffect(() => {
    setSelectedValue(value)
  }, [value])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue)
    setIsOpen(false)
    
    // Create a synthetic event to match the expected onChange signature
    const syntheticEvent = {
      target: { value: optionValue },
      currentTarget: { value: optionValue },
    } as React.ChangeEvent<HTMLSelectElement>
    
    onChange(syntheticEvent)
  }

  return (
    <div className={`relative inline-block w-full sm:min-w-[300px] ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full
          px-4 py-2.5
          pr-10
          bg-white
          border-2 border-gray-200
          rounded-lg
          text-sm font-medium
          text-gray-900
          text-left
          cursor-pointer
          transition-all
          hover:border-blue-400
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          focus:border-blue-500
          disabled:opacity-50
          disabled:cursor-not-allowed
        `}
      >
        {selectedOption?.label}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                px-4 py-2.5
                text-sm
                cursor-pointer
                transition-colors
                hover:bg-blue-50
                flex items-center justify-between
                ${selectedValue === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-900'}
              `}
            >
              <span>{option.label}</span>
              {selectedValue === option.value && (
                <Check className="h-4 w-4 text-blue-700" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

Select.displayName = "Select"

export { Select }
