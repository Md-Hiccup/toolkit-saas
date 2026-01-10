'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Merge, Minimize2, Image, FileText, Edit, Lock, Unlock, 
  Code2, ChevronDown, ChevronRight, FileType, Hash, Braces, 
  Type, Wand2, FileJson, Home, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

type MenuItem = {
  name: string
  href?: string
  icon: any
  children?: MenuItem[]
  badge?: string
}

const navigation: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home
  },
  {
    name: 'PDF Tools',
    icon: FileType,
    badge: '8',
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
    badge: '3',
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

function NavItem({ item, level = 0, onLinkClick, isCollapsed, onExpand }: { item: MenuItem; level?: number; onLinkClick?: () => void; isCollapsed?: boolean; onExpand?: () => void }) {
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

  const handleCategoryClick = () => {
    if (isCollapsed && onExpand) {
      // If sidebar is collapsed, expand it first
      onExpand()
      // Then open the dropdown after a short delay
      setTimeout(() => setIsOpen(true), 100)
    } else {
      // Normal toggle behavior when expanded
      setIsOpen(!isOpen)
    }
  }

  if (hasChildren) {
    return (
      <div className="mb-0.5">
        <button
          onClick={handleCategoryClick}
          className={cn(
            'w-full flex items-center justify-between py-2 text-xs font-medium rounded-md transition-all duration-200',
            'hover:bg-gray-800/70',
            'group relative',
            hasActiveChild && 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-600/20',
            level > 0 && 'pl-6',
            isCollapsed ? 'px-0 justify-center' : 'px-2.5'
          )}
          title={isCollapsed ? item.name : undefined}
        >
          <div className={cn("flex items-center gap-2", isCollapsed && "flex-col gap-0.5")}>
            <div className={cn(
              "p-1 rounded-md transition-all duration-200",
              hasActiveChild 
                ? 'bg-white/20 text-white' 
                : 'text-gray-400 group-hover:text-white'
            )}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            {!isCollapsed && (
              <>
                <span className={cn(
                  "transition-colors font-medium",
                  hasActiveChild ? 'text-white' : 'text-gray-300 group-hover:text-white'
                )}>{item.name}</span>
                {item.badge && (
                  <span className={cn(
                    "ml-auto mr-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full",
                    hasActiveChild 
                      ? 'bg-white/20 text-white' 
                      : 'bg-blue-600/20 text-blue-400'
                  )}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </div>
          {!isCollapsed && (
            <ChevronDown className={cn(
              "h-3 w-3 transition-transform duration-200",
              isOpen ? "rotate-0" : "-rotate-90",
              hasActiveChild ? 'text-white' : 'text-gray-400 group-hover:text-white'
            )} />
          )}
        </button>
        {!isCollapsed && (
          <div className={cn(
            "overflow-hidden transition-all duration-200 ease-in-out",
            isOpen ? "max-h-96 opacity-100 mt-0.5" : "max-h-0 opacity-0"
          )}>
            {item.children && (
              <div className="space-y-0.5 ml-1.5 pl-2 border-l border-gray-800">
                {item.children.map((child) => (
                  <NavItem key={child.name} item={child} level={level + 1} onLinkClick={onLinkClick} isCollapsed={isCollapsed} onExpand={onExpand} />
                ))}
              </div>
            )}
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
        'flex items-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 group relative mb-0.5',
        level > 0 && 'pl-2',
        isActive
          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-600/20'
          : 'text-gray-300 hover:bg-gray-800/70 hover:text-white',
        isCollapsed ? 'px-0 justify-center flex-col gap-0.5' : 'px-2.5'
      )}
      title={isCollapsed ? item.name : undefined}
    >
      <div className={cn(
        "p-1 rounded-md transition-all duration-200",
        isActive 
          ? 'bg-white/20 text-white' 
          : 'text-gray-400 group-hover:text-white'
      )}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      {!isCollapsed && (
        <>
          <span className="flex-1 font-medium">{item.name}</span>
          {isActive && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-l-full" />
          )}
        </>
      )}
    </Link>
  )
}

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  onToggle?: () => void
}

export function Sidebar({ isOpen = true, onClose, onToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay - only on mobile when open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed lg:relative inset-y-0 left-0 z-50 flex h-screen flex-col bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white transition-all duration-300 ease-in-out shadow-2xl",
        isOpen ? "w-72" : "w-20",
        // On mobile, hide completely when closed
        !isOpen && "max-lg:-translate-x-full"
      )}>
        {/* Header with Hamburger */}
        <div className="flex h-14 items-center border-b border-gray-800/50 flex-shrink-0">
          {/* Hamburger Menu Button */}
          <button
            onClick={onToggle}
            className={cn(
              "flex items-center justify-center h-14 text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-200 group flex-shrink-0",
              isOpen ? "w-14" : "w-20"
            )}
            aria-label="Toggle sidebar"
          >
            <div className="flex flex-col gap-1">
              <span className="block h-0.5 w-5 bg-current transition-all duration-300"></span>
              <span className="block h-0.5 w-5 bg-current transition-all duration-300"></span>
              <span className="block h-0.5 w-5 bg-current transition-all duration-300"></span>
            </div>
          </button>

          {/* Logo - only show when expanded */}
          {isOpen && (
            <Link 
              href="/dashboard" 
              onClick={onClose}
              className="flex items-center gap-2.5 flex-1 px-3 hover:bg-gray-800/30 h-full transition-all duration-200 group overflow-hidden"
            >
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 shadow-md shadow-blue-600/20 group-hover:shadow-blue-600/30 transition-shadow">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="whitespace-nowrap">
                <h1 className="text-base font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Toolkit</h1>
                <p className="text-[10px] text-gray-400 leading-tight">Your productivity suite</p>
              </div>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className={cn(
          "flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent",
          isOpen ? "px-3" : "px-2"
        )}>
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavItem 
                key={item.name} 
                item={item} 
                onLinkClick={onClose} 
                isCollapsed={!isOpen}
                onExpand={() => onToggle && onToggle()}
              />
            ))}
          </div>
        </nav>
      </div>
    </>
  )
}
