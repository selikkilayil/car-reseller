'use client'
import { useState } from 'react'
import { useFetch } from '@/hooks/useData'
import { formatCurrency } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { PurchaseForm } from '@/components/forms/PurchaseForm'
import { Plus } from 'lucide-react'
import Link from 'next/link'

interface Car {
  id: string
  make: string
  model: string
  year: number
  registrationNo?: string
  status: string
  purchasePrice: number
  purchaseDate: string
  purchaseParty?: { name: string }
  summary?: {
    totalExpenses: number
    daysSincePurchase: number
    repairDays: number | null
  }
}

const statusVariants: Record<string, 'default' | 'warning' | 'info' | 'success'> = {
  PURCHASED: 'default',
  IN_REPAIR: 'warning',
  READY_FOR_SALE: 'info',
  BOOKED: 'warning',
  SOLD: 'success',
  DELIVERED: 'success',
}

export default function CarsPage() {
  const { data: cars, loading, refetch } = useFetch<Car[]>('/api/cars')
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<string>('')

  const filteredCars = filter ? cars?.filter(c => c.status === filter) : cars

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Cars</h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">Manage your car inventory</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> New Purchase
        </Button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <Button variant={filter === '' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('')} className="whitespace-nowrap">All</Button>
        <Button variant={filter === 'PURCHASED' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('PURCHASED')} className="whitespace-nowrap">Purchased</Button>
        <Button variant={filter === 'IN_REPAIR' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('IN_REPAIR')} className="whitespace-nowrap">In Repair</Button>
        <Button variant={filter === 'READY_FOR_SALE' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('READY_FOR_SALE')} className="whitespace-nowrap">Ready for Sale</Button>
        <Button variant={filter === 'BOOKED' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('BOOKED')} className="whitespace-nowrap">Booked</Button>
        <Button variant={filter === 'SOLD' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('SOLD')} className="whitespace-nowrap">Sold</Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-900">Loading...</div>
      ) : (
        <>
          {/* Desktop table view */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expenses</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCars?.map(car => (
                  <tr key={car.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/cars/${car.id}`} className="text-blue-600 hover:underline font-medium">
                        {car.make} {car.model} ({car.year})
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{car.registrationNo || '-'}</td>
                    <td className="px-6 py-4 text-gray-500">{car.purchaseParty?.name || '-'}</td>
                    <td className="px-6 py-4">{formatCurrency(car.purchasePrice)}</td>
                    <td className="px-6 py-4 text-gray-500">{formatCurrency(car.summary?.totalExpenses || 0)}</td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="text-sm">
                        <div>{car.summary?.daysSincePurchase || 0}d</div>
                        {car.summary?.repairDays !== null && car.summary?.repairDays !== undefined && (
                          <div className="text-xs text-orange-600">Repair: {car.summary.repairDays}d</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariants[car.status]}>{car.status.replace('_', ' ')}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCars?.length === 0 && (
              <div className="text-center py-8 text-gray-500">No cars found</div>
            )}
          </div>

          {/* Mobile card view */}
          <div className="md:hidden space-y-3">
            {filteredCars?.map(car => (
              <Link 
                key={car.id} 
                href={`/cars/${car.id}`}
                className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-blue-600">
                    {car.make} {car.model} ({car.year})
                  </div>
                  <Badge variant={statusVariants[car.status]}>{car.status.replace('_', ' ')}</Badge>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <div>Registration: {car.registrationNo || '-'}</div>
                  <div>Seller: {car.purchaseParty?.name || '-'}</div>
                  <div className="font-medium text-gray-900 mt-2">{formatCurrency(car.purchasePrice)}</div>
                  <div className="text-xs mt-2 flex gap-3">
                    <span>Expenses: {formatCurrency(car.summary?.totalExpenses || 0)}</span>
                    <span>Days: {car.summary?.daysSincePurchase || 0}d</span>
                    {car.summary?.repairDays !== null && car.summary?.repairDays !== undefined && (
                      <span className="text-orange-600">Repair: {car.summary.repairDays}d</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            {filteredCars?.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-white rounded-lg">No cars found</div>
            )}
          </div>
        </>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Car Purchase">
        <PurchaseForm onSuccess={() => { setShowForm(false); refetch() }} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  )
}
