'use client'
import { useFetch } from '@/hooks/useData'
import { formatCurrency } from '@/lib/currency'
import { 
  Car, DollarSign, Wrench, ShoppingCart, TrendingUp, TrendingDown, 
  Wallet, Package, Calendar, BarChart3, ArrowUpRight, ArrowDownRight 
} from 'lucide-react'
import Link from 'next/link'

interface CarData {
  id: string
  make: string
  model: string
  status: string
  purchasePrice: number
  salePrice?: number
}

interface DashboardStats {
  overview: {
    totalCars: number
    purchased: number
    inRepair: number
    readyForSale: number
    sold: number
  }
  thisMonth: {
    carsPurchased: number
    carsSold: number
    revenue: number
    profit: number
  }
  lastMonth: {
    carsSold: number
    revenue: number
  }
  financial: {
    totalInvestment: number
    totalRevenue: number
    totalProfit: number
    inventoryValue: number
    totalLiquidity: number
    totalBankBalance: number
    totalCash: number
  }
  averages: {
    purchasePrice: number
    salePrice: number
    profit: number
  }
}

export default function Dashboard() {
  const { data: cars, loading: carsLoading } = useFetch<CarData[]>('/api/cars')
  const { data: stats, loading: statsLoading } = useFetch<DashboardStats>('/api/dashboard/stats')

  const loading = carsLoading || statsLoading

  if (loading) return <div className="text-center py-12 text-slate-600">Loading...</div>

  const revenueChange = stats?.lastMonth.revenue 
    ? ((stats.thisMonth.revenue - stats.lastMonth.revenue) / stats.lastMonth.revenue) * 100 
    : 0
  
  const salesChange = stats?.lastMonth.carsSold 
    ? ((stats.thisMonth.carsSold - stats.lastMonth.carsSold) / stats.lastMonth.carsSold) * 100 
    : 0

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1 text-sm sm:text-base">Overview of your car reselling business</p>
      </div>

      {/* This Month Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={Calendar}
          label="Cars Purchased This Month"
          value={stats?.thisMonth.carsPurchased || 0}
          color="blue"
        />
        <MetricCard
          icon={DollarSign}
          label="Sales This Month"
          value={stats?.thisMonth.carsSold || 0}
          trend={salesChange}
          color="green"
        />
        <MetricCard
          icon={TrendingUp}
          label="Revenue This Month"
          value={formatCurrency(stats?.thisMonth.revenue || 0)}
          trend={revenueChange}
          color="purple"
        />
        <MetricCard
          icon={BarChart3}
          label="Profit This Month"
          value={formatCurrency(stats?.thisMonth.profit || 0)}
          color="emerald"
        />
      </div>
      
      {/* Inventory Status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard icon={Car} label="Purchased" value={stats?.overview.purchased || 0} color="blue" />
        <StatCard icon={Wrench} label="In Repair" value={stats?.overview.inRepair || 0} color="yellow" />
        <StatCard icon={ShoppingCart} label="Ready for Sale" value={stats?.overview.readyForSale || 0} color="purple" />
        <StatCard icon={DollarSign} label="Sold" value={stats?.overview.sold || 0} color="green" />
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 p-5 sm:p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 opacity-90" />
            <h3 className="text-xs sm:text-sm font-medium opacity-90">Total Liquidity</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold mb-1">{formatCurrency(stats?.financial.totalLiquidity || 0)}</p>
          <p className="text-xs opacity-75">Bank: {formatCurrency(stats?.financial.totalBankBalance || 0)} | Cash: {formatCurrency(stats?.financial.totalCash || 0)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/20 p-5 sm:p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 opacity-90" />
            <h3 className="text-xs sm:text-sm font-medium opacity-90">Inventory Value</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold mb-1">{formatCurrency(stats?.financial.inventoryValue || 0)}</p>
          <p className="text-xs opacity-75">{stats?.overview.totalCars || 0} cars in inventory</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/20 p-5 sm:p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 opacity-90" />
            <h3 className="text-xs sm:text-sm font-medium opacity-90">Total Profit</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold mb-1">{formatCurrency(stats?.financial.totalProfit || 0)}</p>
          <p className="text-xs opacity-75">From {stats?.overview.sold || 0} sold cars</p>
        </div>
      </div>

      {/* Averages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Avg Purchase Price</h3>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats?.averages.purchasePrice || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Avg Sale Price</h3>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats?.averages.salePrice || 0)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Avg Profit per Car</h3>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats?.averages.profit || 0)}</p>
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

function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  color 
}: { 
  icon: any
  label: string
  value: string | number
  trend?: number
  color: string 
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-slate-600 text-xs font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3 shadow-lg`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-slate-600 text-xs font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
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
