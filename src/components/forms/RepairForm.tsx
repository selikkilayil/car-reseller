'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { repairSchema, RepairInput } from '@/lib/validations'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useFetch, postData } from '@/hooks/useData'

interface RepairType { id: string; name: string }
interface BankAccount { id: string; name: string; bankName: string }

interface Props {
  carId: string
  onSuccess: () => void
  onCancel: () => void
}

export function RepairForm({ carId, onSuccess, onCancel }: Props) {
  const { data: repairTypes } = useFetch<RepairType[]>('/api/repair-types')
  const { data: banks } = useFetch<BankAccount[]>('/api/bank-accounts')
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RepairInput>({
    resolver: zodResolver(repairSchema) as any,
    defaultValues: { carId, paymentMethod: 'CASH' },
  })

  const paymentMethod = watch('paymentMethod')

  const onSubmit = async (data: RepairInput) => {
    await postData('/api/repairs', data)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Repair Type"
        {...register('repairTypeId')}
        error={errors.repairTypeId?.message}
        options={repairTypes?.map(t => ({ value: t.id, label: t.name })) || []}
      />
      
      <Input label="Description" {...register('description')} />
      <Input label="Vendor Name" {...register('vendorName')} />
      <Input label="Cost" type="number" {...register('cost')} error={errors.cost?.message} />

      <Select
        label="Payment Method"
        {...register('paymentMethod')}
        options={[
          { value: 'CASH', label: 'Cash' },
          { value: 'BANK', label: 'Bank Transfer' },
        ]}
      />

      {paymentMethod === 'BANK' && (
        <Select
          label="Bank Account"
          {...register('bankAccountId')}
          options={banks?.map(b => ({ value: b.id, label: `${b.name} - ${b.bankName}` })) || []}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto">Cancel</Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? 'Saving...' : 'Add Repair'}
        </Button>
      </div>
    </form>
  )
}
