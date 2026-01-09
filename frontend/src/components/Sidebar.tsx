'use client'

import { useState, useEffect } from 'react'
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
    name: 'PDF Tools',
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
    name: 'Text Tools',
    icon: Type,
    children: [
      { name: 'Encoders/Decoders', href: '/dashboard/encoder', icon: Code2 },
      { name: 'Formatting', href: '/dashboard/formatting', icon: Braces },
      { name: 'Text Transform', href: '/dashboard/text-transform', icon: Type },
    ]
  },
  {
    name: 'JSON Editor',
    href: '/dashboard/json-editor',
    icon: FileJson
  },
  {
    name: 'Security',
    icon: Hash,
    children: [
      { name: 'Cryptography', href: '/dashboard/cryptography', icon: Hash },
    ]
  },
  {
    name: 'Utilities',
    icon: Wand2,
    children: [
      { name: 'Generators', href: '/dashboard/generators', icon: Wand2 },
    ]
  },
]

function NavItem({ item, level = 0, onLinkClick }: { item: MenuItem; level?: number; onLinkClick?: () => void }) {
  const pathname = usePathname()
  const Icon = item.icon

  const hasChildren = item.children && item.children.length > 0
  const isActive = item.href ? pathname === item.href : false
  
  // Check if any child is active
  const hasActiveChild = hasChildren && item.children?.some(child => child.href === pathname)
  
  // Auto-expand if has active child, keep expanded state
  const [isOpen, setIsOpen] = useState(hasActiveChild || false)
  
  // Update isOpen when pathname changes - expand if child is active, collapse if not
  useEffect(() => {
    setIsOpen(hasActiveChild || false)
  }, [hasActiveChild, pathname])

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
              <NavItem key={child.name} item={child} level={level + 1} onLinkClick={onLinkClick} />
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
      onClick={onLinkClick}
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

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 flex h-screen w-64 flex-col bg-gray-900 text-white transition-transform duration-300 ease-in-out",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Link 
          href="/dashboard" 
          onClick={onClose}
          className="flex h-16 items-center justify-center border-b border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <h1 className="text-xl font-bold">Toolkit</h1>
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} onLinkClick={onClose} />
          ))}
        </nav>
      </div>
    </>
  )
}
