'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Car, Users, CreditCard, Wrench, LayoutDashboard, Menu, X, Receipt, Shield, LogOut } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/cars', label: 'Cars', icon: Car },
  { href: '/parties', label: 'Parties', icon: Users },
  { href: '/accounts', label: 'Accounts', icon: CreditCard },
  { href: '/transactions', label: 'Transactions', icon: Receipt },
  { href: '/repair-types', label: 'Repair Types', icon: Wrench },
  { href: '/users', label: 'Users', icon: Shield, adminOnly: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

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
        flex flex-col
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
        
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            if (item.adminOnly && user?.role !== 'ADMIN') return null
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

        {user && (
          <div className="mt-auto pt-6 border-t border-slate-200">
            <div className="px-4 py-3 bg-slate-50 rounded-lg mb-2">
              <div className="text-sm font-medium text-slate-900">{user.name}</div>
              <div className="text-xs text-slate-500">@{user.username}</div>
              <div className="mt-1">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                  {user.role}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50 w-full"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
