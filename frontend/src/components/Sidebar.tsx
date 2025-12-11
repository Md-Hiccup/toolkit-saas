'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Merge, Minimize2, Image, FileText, Edit, Lock, Unlock, 
  Code2, ChevronDown, ChevronRight, FileType, Hash, Braces, 
  Type, Wand2, FileJson
} from 'lucide-react'
import { cn } from '@/lib/utils'

type MenuItem = {
  name: string
  href?: string
  icon: any
  children?: MenuItem[]
}

const navigation: MenuItem[] = [
  {
    name: 'PDF Toolkit',
    icon: FileType,
    children: [
      { name: 'Compress PDF', href: '/dashboard/compress', icon: Minimize2 },
      { name: 'Merge PDFs', href: '/dashboard/merge', icon: Merge },
      { name: 'PDF to Image', href: '/dashboard/pdf-to-image', icon: Image },
      { name: 'Image to PDF', href: '/dashboard/image-to-pdf', icon: Image },
      { name: 'View PDF', href: '/dashboard/view-pdf', icon: Edit },
      { name: 'Extract Text', href: '/dashboard/extract-text', icon: FileText },
      { name: 'Protect PDF', href: '/dashboard/encrypt-pdf', icon: Lock },
      { name: 'Unlock PDF', href: '/dashboard/decrypt-pdf', icon: Unlock },
    ]
  },
  {
    name: 'Encoders/Decoders',
    href: '/dashboard/encoder',
    icon: Code2
  },
  {
    name: 'Cryptography',
    href: '/dashboard/cryptography',
    icon: Hash
  },
  {
    name: 'Formatting',
    href: '/dashboard/formatting',
    icon: Braces
  },
  {
    name: 'Text Transform',
    href: '/dashboard/text-transform',
    icon: Type
  },
  {
    name: 'Generators',
    href: '/dashboard/generators',
    icon: Wand2
  },
  {
    name: 'JSON Editor',
    href: '/dashboard/json-editor',
    icon: FileJson
  },
]

function NavItem({ item, level = 0 }: { item: MenuItem; level?: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const Icon = item.icon

  const hasChildren = item.children && item.children.length > 0
  const isActive = item.href ? pathname === item.href : false

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors',
            'hover:bg-gray-800',
            level > 0 && 'pl-8'
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className="h-4 w-4" />
            <span>{item.name}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {isOpen && item.children && (
          <div className="mt-1 space-y-1">
            {item.children.map((child) => (
              <NavItem key={child.name} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!item.href) return null

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors',
        level > 0 && 'pl-8',
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{item.name}</span>
    </Link>
  )
}

export function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold">Toolkit</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>
    </div>
  )
}
