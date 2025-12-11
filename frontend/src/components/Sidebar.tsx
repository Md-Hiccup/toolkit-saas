'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Merge, Minimize2, Image, FileText, Edit, Lock, Unlock } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Compress PDF', href: '/dashboard/compress', icon: Minimize2 },
  { name: 'Merge PDFs', href: '/dashboard/merge', icon: Merge },
  { name: 'PDF to Image', href: '/dashboard/pdf-to-image', icon: Image },
  { name: 'Image to PDF', href: '/dashboard/image-to-pdf', icon: Image },
  { name: 'View PDF', href: '/dashboard/view-pdf', icon: Edit },
  { name: 'Extract Text', href: '/dashboard/extract-text', icon: FileText },
  { name: 'Protect PDF', href: '/dashboard/encrypt-pdf', icon: Lock },
  { name: 'Unlock PDF', href: '/dashboard/decrypt-pdf', icon: Unlock },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold">PDF Toolkit</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
