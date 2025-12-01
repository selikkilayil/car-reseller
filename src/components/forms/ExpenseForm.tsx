'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { expenseSchema, ExpenseInput } from '@/lib/validations'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useFetch, postData } from '@/hooks/useData'

interface BankAccount { id: string; name: string; bankName: string }

interface Props {
  carId: string
  category: 'PURCHASE' | 'REPAIR' | 'SALE'
  onSuccess: () => void
  onCancel: () => void
}

export function ExpenseForm({ carId, category, onSuccess, onCancel }: Props) {
  const { data: banks } = useFetch<BankAccount[]>('/api/bank-accounts')
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: { carId, category, paymentMethod: 'CASH' },
  })

  const paymentMethod = watch('paymentMethod')

  const onSubmit = async (data: ExpenseInput) => {
    await postData('/api/expenses', data)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Expense Type"
        {...register('type')}
        error={errors.type?.message}
        options={[
          { value: 'TRAVEL', label: 'Travel' },
          { value: 'FUEL', label: 'Fuel' },
          { value: 'BROKERAGE', label: 'Brokerage' },
          { value: 'DELIVERY', label: 'Delivery' },
          { value: 'OTHER', label: 'Other' },
        ]}
      />
      
      <Input label="Description" {...register('description')} />
      <Input label="Amount" type="number" {...register('amount')} error={errors.amount?.message} />

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
          {isSubmitting ? 'Saving...' : 'Add Expense'}
        </Button>
      </div>
    </form>
  )
}
