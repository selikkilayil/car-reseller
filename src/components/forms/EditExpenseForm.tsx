'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { putData } from '@/hooks/useData'

const expenseEditSchema = z.object({
  type: z.enum(['TRAVEL', 'FUEL', 'BROKERAGE', 'DELIVERY', 'OTHER']),
  description: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  amount: z.coerce.number().min(0, 'Amount must be positive'),
})

type ExpenseEditInput = z.infer<typeof expenseEditSchema>

interface Props {
  expense: any
  onSuccess: () => void
  onCancel: () => void
}

export function EditExpenseForm({ expense, onSuccess, onCancel }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ExpenseEditInput>({
    resolver: zodResolver(expenseEditSchema) as any,
    defaultValues: {
      type: expense.type,
      description: expense.description || '',
      amount: expense.amount,
    },
  })

  const onSubmit = async (data: ExpenseEditInput) => {
    await putData(`/api/expenses/${expense.id}`, data)
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

      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
        <strong>Note:</strong> Changing the amount will automatically adjust the related account balance.
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto">Cancel</Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? 'Saving...' : 'Update Expense'}
        </Button>
      </div>
    </form>
  )
}
