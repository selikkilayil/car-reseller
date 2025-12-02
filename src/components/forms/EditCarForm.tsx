'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { carEditSchema, CarEditInput } from '@/lib/validations'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useFetch, putData } from '@/hooks/useData'

interface Party { id: string; name: string; type: string }

interface Props {
  car: any
  onSuccess: () => void
  onCancel: () => void
}

export function EditCarForm({ car, onSuccess, onCancel }: Props) {
  const { data: parties } = useFetch<Party[]>('/api/parties')
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<CarEditInput>({
    resolver: zodResolver(carEditSchema) as any,
    defaultValues: {
      make: car.make,
      model: car.model,
      year: car.year,
      color: car.color || '',
      vin: car.vin || '',
      registrationNo: car.registrationNo || '',
      mileage: car.mileage || '',
      purchaseDate: car.purchaseDate ? new Date(car.purchaseDate).toISOString().split('T')[0] : '',
      purchasePrice: car.purchasePrice,
      purchasePartyId: car.purchasePartyId,
      purchaseSource: car.purchaseSource,
      purchaseBrokerId: car.purchaseBrokerId || '',
      brokerageAmount: car.brokerageAmount || '',
      isInLoan: car.isInLoan,
      loanAmount: car.loanAmount || '',
      loanDetails: car.loanDetails || '',
      amountPaidToSeller: car.amountPaidToSeller || '',
      netRate: car.netRate || '',
    },
  })

  const isInLoan = watch('isInLoan')

  const onSubmit = async (data: CarEditInput) => {
    await putData(`/api/cars/${car.id}`, data)
    onSuccess()
  }

  const sellers = parties?.filter(p => p.type === 'SELLER' || p.type === 'DEALERSHIP') || []
  const brokers = parties?.filter(p => p.type === 'BROKER') || []

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Make" {...register('make')} error={errors.make?.message} />
        <Input label="Model" {...register('model')} error={errors.model?.message} />
        <Input label="Year" type="number" {...register('year')} error={errors.year?.message} />
        <Input label="Color" {...register('color')} />
        <Input label="VIN" {...register('vin')} />
        <Input label="Registration No" {...register('registrationNo')} />
        <Input label="Mileage" type="number" {...register('mileage')} />
        <Input label="Purchase Date" type="date" {...register('purchaseDate')} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Purchase Source"
          {...register('purchaseSource')}
          options={[
            { value: 'DIRECT_USER', label: 'Direct User' },
            { value: 'DEALERSHIP', label: 'Dealership' },
          ]}
        />
        <Select
          label="Seller"
          {...register('purchasePartyId')}
          error={errors.purchasePartyId?.message}
          options={sellers.map(p => ({ value: p.id, label: p.name }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Broker (Optional)"
          {...register('purchaseBrokerId')}
          options={brokers.map(p => ({ value: p.id, label: p.name }))}
        />
        <Input label="Brokerage Amount" type="number" {...register('brokerageAmount')} />
      </div>

      <Input label="Purchase Price" type="number" {...register('purchasePrice')} error={errors.purchasePrice?.message} />

      <div className="flex items-center gap-2">
        <input type="checkbox" id="isInLoan" {...register('isInLoan')} className="rounded" />
        <label htmlFor="isInLoan" className="text-sm">Vehicle is in loan</label>
      </div>

      {isInLoan && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
          <Input label="Loan Amount" type="number" {...register('loanAmount')} />
          <Input label="Amount Paid to Seller" type="number" {...register('amountPaidToSeller')} />
          <div className="sm:col-span-2">
            <Input label="Loan Details" {...register('loanDetails')} />
          </div>
        </div>
      )}

      {car.netRate && (
        <Input label="Net Rate" type="number" {...register('netRate')} />
      )}

      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto">Cancel</Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? 'Saving...' : 'Update Car'}
        </Button>
      </div>
    </form>
  )
}
