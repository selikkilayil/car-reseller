'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Car, Users, CreditCard, Wallet, Wrench, LayoutDashboard } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/cars', label: 'Cars', icon: Car },
  { href: '/parties', label: 'Parties', icon: Users },
  { href: '/accounts', label: 'Accounts', icon: CreditCard },
  { href: '/repair-types', label: 'Repair Types', icon: Wrench },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="flex items-center gap-2 mb-8 px-2">
        <Car className="w-8 h-8 text-blue-400" />
        <span className="text-xl font-bold">Car Reseller</span>
      </div>
      
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
