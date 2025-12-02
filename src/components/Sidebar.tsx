'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Car, Users, CreditCard, Wrench, LayoutDashboard, Menu, X, Receipt } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/cars', label: 'Cars', icon: Car },
  { href: '/parties', label: 'Parties', icon: Users },
  { href: '/accounts', label: 'Accounts', icon: CreditCard },
  { href: '/transactions', label: 'Transactions', icon: Receipt },
  { href: '/repair-types', label: 'Repair Types', icon: Wrench },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile header with burger menu */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center">
          <Image 
            src="/logo.png" 
            alt="Car Reseller Logo" 
            width={160} 
            height={54}
            className="h-11 w-auto object-contain"
          />
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 h-screen z-40
        w-64 bg-white border-r border-slate-200 p-6
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Desktop logo */}
        <div className="hidden lg:flex items-center mb-10 px-2">
          <Image 
            src="/logo.png" 
            alt="Car Reseller Logo" 
            width={180} 
            height={60}
            className="h-12 w-auto object-contain"
          />
        </div>

        {/* Mobile close button and logo */}
        <div className="lg:hidden flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="Car Reseller Logo" 
              width={180} 
              height={60}
              className="h-12 w-auto object-contain"
            />
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 font-medium shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
