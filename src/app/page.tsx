'use client'
import { useFetch } from '@/hooks/useData'
import { formatCurrency } from '@/lib/currency'
import { Car, DollarSign, Wrench, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

interface CarData {
  id: string
  make: string
  model: string
  status: string
  purchasePrice: number
  salePrice?: number
}

export default function Dashboard() {
  const { data: cars, loading } = useFetch<CarData[]>('/api/cars')
  const { data: cashAccount } = useFetch<{ balance: number }>('/api/cash-account')
  const { data: bankAccounts } = useFetch<{ balance: number }[]>('/api/bank-accounts')

  if (loading) return <div className="text-center py-8 text-gray-900">Loading...</div>

  const purchased = cars?.filter(c => c.status === 'PURCHASED').length || 0
  const inRepair = cars?.filter(c => c.status === 'IN_REPAIR').length || 0
  const readyForSale = cars?.filter(c => c.status === 'READY_FOR_SALE').length || 0
  const sold = cars?.filter(c => c.status === 'SOLD' || c.status === 'DELIVERED').length || 0
  
  const totalBankBalance = bankAccounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0
  const totalCash = cashAccount?.balance || 0

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard icon={Car} label="Purchased" value={purchased} color="blue" />
        <StatCard icon={Wrench} label="In Repair" value={inRepair} color="yellow" />
        <StatCard icon={ShoppingCart} label="Ready for Sale" value={readyForSale} color="purple" />
        <StatCard icon={DollarSign} label="Sold" value={sold} color="green" />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Total Bank Balance</h3>
          <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalBankBalance)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Cash on Hand</h3>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalCash)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Recent Cars</h3>
          <Link href="/cars" className="text-blue-600 hover:underline">View All</Link>
        </div>
        <div className="divide-y">
          {cars?.slice(0, 5).map(car => (
            <Link key={car.id} href={`/cars/${car.id}`} className="flex justify-between items-center p-4 hover:bg-gray-50">
              <div>
                <span className="font-medium">{car.make} {car.model}</span>
                <span className={`ml-3 text-xs px-2 py-1 rounded-full ${getStatusColor(car.status)}`}>
                  {car.status.replace('_', ' ')}
                </span>
              </div>
              <span className="text-gray-500">{formatCurrency(car.purchasePrice)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    PURCHASED: 'bg-gray-100 text-gray-800',
    IN_REPAIR: 'bg-yellow-100 text-yellow-800',
    READY_FOR_SALE: 'bg-purple-100 text-purple-800',
    SOLD: 'bg-green-100 text-green-800',
    DELIVERED: 'bg-green-100 text-green-800',
  }
  return colors[status] || colors.PURCHASED
}
