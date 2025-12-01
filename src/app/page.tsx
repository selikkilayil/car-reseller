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

  if (loading) return <div className="text-center py-12 text-slate-600">Loading...</div>

  const purchased = cars?.filter(c => c.status === 'PURCHASED').length || 0
  const inRepair = cars?.filter(c => c.status === 'IN_REPAIR').length || 0
  const readyForSale = cars?.filter(c => c.status === 'READY_FOR_SALE').length || 0
  const sold = cars?.filter(c => c.status === 'SOLD' || c.status === 'DELIVERED').length || 0
  
  const totalBankBalance = bankAccounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0
  const totalCash = cashAccount?.balance || 0

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1 text-sm sm:text-base">Overview of your car reselling business</p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <StatCard icon={Car} label="Purchased" value={purchased} color="blue" />
        <StatCard icon={Wrench} label="In Repair" value={inRepair} color="yellow" />
        <StatCard icon={ShoppingCart} label="Ready for Sale" value={readyForSale} color="purple" />
        <StatCard icon={DollarSign} label="Sold" value={sold} color="green" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 p-5 sm:p-6 text-white">
          <h3 className="text-xs sm:text-sm font-medium opacity-90 mb-2">Total Bank Balance</h3>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{formatCurrency(totalBankBalance)}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/20 p-5 sm:p-6 text-white">
          <h3 className="text-xs sm:text-sm font-medium opacity-90 mb-2">Cash on Hand</h3>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{formatCurrency(totalCash)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">Recent Cars</h3>
          <Link href="/cars" className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm transition-colors">
            View All →
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {cars?.slice(0, 5).map(car => (
            <Link 
              key={car.id} 
              href={`/cars/${car.id}`} 
              className="flex flex-col sm:flex-row justify-between sm:items-center p-4 sm:p-5 hover:bg-slate-50 transition-colors group gap-2 sm:gap-3"
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                  {car.make} {car.model}
                </span>
                <span className={`text-xs px-2 sm:px-3 py-1 rounded-full font-medium ${getStatusColor(car.status)}`}>
                  {car.status.replace('_', ' ')}
                </span>
              </div>
              <span className="text-slate-600 font-medium text-sm sm:text-base">{formatCurrency(car.purchasePrice)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 shadow-blue-500/10',
    yellow: 'bg-amber-50 text-amber-600 shadow-amber-500/10',
    purple: 'bg-purple-50 text-purple-600 shadow-purple-500/10',
    green: 'bg-emerald-50 text-emerald-600 shadow-emerald-500/10',
  }
  
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${colors[color]} flex items-center justify-center mb-3 sm:mb-4 shadow-lg`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <p className="text-slate-600 text-xs sm:text-sm font-medium mb-1">{label}</p>
      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    PURCHASED: 'bg-slate-100 text-slate-700',
    IN_REPAIR: 'bg-amber-100 text-amber-700',
    READY_FOR_SALE: 'bg-purple-100 text-purple-700',
    SOLD: 'bg-emerald-100 text-emerald-700',
    DELIVERED: 'bg-emerald-100 text-emerald-700',
  }
  return colors[status] || colors.PURCHASED
}
