'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatCurrency } from '@/lib/currency'
import { saleSchema, SaleInput } from '@/lib/validations'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useFetch, postData } from '@/hooks/useData'

interface Party { id: string; name: string; type: string }
interface BankAccount { id: string; name: string; bankName: string }

interface Props {
  carId: string
  totalCost: number
  onSuccess: () => void
  onCancel: () => void
}

export function SaleForm({ carId, totalCost, onSuccess, onCancel }: Props) {
  const { data: parties } = useFetch<Party[]>('/api/parties')
  const { data: banks } = useFetch<BankAccount[]>('/api/bank-accounts')
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SaleInput>({
    resolver: zodResolver(saleSchema) as any,
    defaultValues: { carId, paymentMethod: 'CASH', saleType: 'CASH' },
  })

  const paymentMethod = watch('paymentMethod')
  const salePrice = watch('salePrice')

  const buyers = parties?.filter(p => p.type === 'BUYER') || []
  const brokers = parties?.filter(p => p.type === 'BROKER') || []
  const estimatedProfit = salePrice ? salePrice - totalCost : 0

  const onSubmit = async (data: SaleInput) => {
    await postData(`/api/cars/${carId}/sale`, data)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">Total Cost: <span className="font-bold">{formatCurrency(totalCost)}</span></p>
        <p className="text-sm text-blue-800">Estimated Profit: <span className={`font-bold ${estimatedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(estimatedProfit)}</span></p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Net Rate" type="number" {...register('netRate')} error={errors.netRate?.message} />
        <Input label="Sale Price" type="number" {...register('salePrice')} error={errors.salePrice?.message} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Buyer"
          {...register('salePartyId')}
          error={errors.salePartyId?.message}
          options={buyers.map(p => ({ value: p.id, label: p.name }))}
        />
        <Select
          label="Sale Type"
          {...register('saleType')}
          options={[
            { value: 'CASH', label: 'Cash Sale' },
            { value: 'LOAN', label: 'Loan Sale' },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Broker (Optional)"
          {...register('saleBrokerId')}
          options={brokers.map(p => ({ value: p.id, label: p.name }))}
        />
        <Input label="Broker Commission" type="number" {...register('saleBrokerage')} />
      </div>

      <Select
        label="Payment Received Via"
        {...register('paymentMethod')}
        options={[
          { value: 'CASH', label: 'Cash' },
          { value: 'BANK', label: 'Bank Transfer' },
          { value: 'MIXED', label: 'Mixed (Bank + Cash)' },
        ]}
      />

      {(paymentMethod === 'BANK' || paymentMethod === 'MIXED') && (
        <Select
          label="Bank Account"
          {...register('bankAccountId')}
          options={banks?.map(b => ({ value: b.id, label: `${b.name} - ${b.bankName}` })) || []}
        />
      )}

      {paymentMethod === 'MIXED' && (
        <div className="grid grid-cols-2 gap-4">
          <Input label="Bank Amount" type="number" {...register('bankAmount')} />
          <Input label="Cash Amount" type="number" {...register('cashAmount')} />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Processing...' : 'Complete Sale'}
        </Button>
      </div>
    </form>
  )
}
