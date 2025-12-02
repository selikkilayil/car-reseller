'use client'
import { useState } from 'react'
import { useFetch, postData } from '@/hooks/useData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

interface BookingFormProps {
  carId: string
  onSuccess: () => void
  onCancel: () => void
}

export function BookingForm({ carId, onSuccess, onCancel }: BookingFormProps) {
  const { data: parties } = useFetch<any[]>('/api/parties')
  const { data: bankAccounts } = useFetch<any[]>('/api/bank-accounts')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    bookingAmount: '',
    bookingPartyId: '',
    paymentMethod: 'CASH' as 'BANK' | 'CASH',
    bankAccountId: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await postData(`/api/cars/${carId}/booking`, {
        ...formData,
        bookingAmount: parseFloat(formData.bookingAmount),
      })
      onSuccess()
    } catch (error) {
      alert('Failed to book car')
    } finally {
      setLoading(false)
    }
  }

  const buyers = parties?.filter(p => p.type === 'BUYER' || p.type === 'DEALERSHIP')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Booking Amount *</label>
        <Input
          type="number"
          step="0.01"
          value={formData.bookingAmount}
          onChange={(e) => setFormData({ ...formData, bookingAmount: e.target.value })}
          required
        />
      </div>

      <Select
        label="Buyer *"
        value={formData.bookingPartyId}
        onChange={(e) => setFormData({ ...formData, bookingPartyId: e.target.value })}
        options={buyers?.map(party => ({ value: party.id, label: party.name })) || []}
        required
      />

      <Select
        label="Payment Method *"
        value={formData.paymentMethod}
        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'BANK' | 'CASH' })}
        options={[
          { value: 'CASH', label: 'Cash' },
          { value: 'BANK', label: 'Bank' },
        ]}
        required
      />

      {formData.paymentMethod === 'BANK' && (
        <Select
          label="Bank Account *"
          value={formData.bankAccountId}
          onChange={(e) => setFormData({ ...formData, bankAccountId: e.target.value })}
          options={bankAccounts?.filter(acc => acc.isActive).map(acc => ({ 
            value: acc.id, 
            label: `${acc.name} - ${acc.bankName}` 
          })) || []}
          required
        />
      )}

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Booking...' : 'Book Car'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  )
}
