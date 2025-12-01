'use client'
import { use } from 'react'
import { useFetch } from '@/hooks/useData'
import { CarDetail } from '@/components/CarDetail'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: car, loading, refetch } = useFetch<any>(`/api/cars/${id}`)

  if (loading) return <div className="text-center py-8 text-gray-900">Loading...</div>
  if (!car) return <div className="text-center py-8 text-gray-900">Car not found</div>

  return (
    <div>
      <Link href="/cars" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Cars
      </Link>
      <CarDetail car={car} onUpdate={refetch} />
    </div>
  )
}
