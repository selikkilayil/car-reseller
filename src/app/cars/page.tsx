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
  purchaseParty?: { name: string }
}

const statusVariants: Record<string, 'default' | 'warning' | 'info' | 'success'> = {
  PURCHASED: 'default',
  IN_REPAIR: 'warning',
  READY_FOR_SALE: 'info',
  SOLD: 'success',
  DELIVERED: 'success',
}

export default function CarsPage() {
  const { data: cars, loading, refetch } = useFetch<Car[]>('/api/cars')
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<string>('')

  const filteredCars = filter ? cars?.filter(c => c.status === filter) : cars

  return (
    <div className="text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cars</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Purchase
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        <Button variant={filter === '' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('')}>All</Button>
        <Button variant={filter === 'PURCHASED' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('PURCHASED')}>Purchased</Button>
        <Button variant={filter === 'IN_REPAIR' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('IN_REPAIR')}>In Repair</Button>
        <Button variant={filter === 'READY_FOR_SALE' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('READY_FOR_SALE')}>Ready for Sale</Button>
        <Button variant={filter === 'SOLD' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('SOLD')}>Sold</Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-900">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
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
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Car Purchase">
        <PurchaseForm onSuccess={() => { setShowForm(false); refetch() }} onCancel={() => setShowForm(false)} />
      </Modal>
    </div>
  )
}
