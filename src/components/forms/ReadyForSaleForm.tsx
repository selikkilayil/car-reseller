'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { formatCurrency } from '@/lib/currency'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { postData } from '@/hooks/useData'

const readyForSaleSchema = z.object({
  netRate: z.coerce.number().positive('Net rate must be positive'),
})

type ReadyForSaleInput = z.infer<typeof readyForSaleSchema>

interface Props {
  carId: string
  totalCost: number
  onSuccess: () => void
  onCancel: () => void
}

export function ReadyForSaleForm({ carId, totalCost, onSuccess, onCancel }: Props) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ReadyForSaleInput>({
    resolver: zodResolver(readyForSaleSchema) as any,
  })

  const netRate = watch('netRate')
  const estimatedProfit = netRate ? netRate - totalCost : 0

  const onSubmit = async (data: ReadyForSaleInput) => {
    await postData(`/api/cars/${carId}/ready-for-sale`, data)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="p-3 sm:p-4 bg-blue-50 rounded-lg text-sm">
        <p className="text-blue-800">Total Cost: <span className="font-bold">{formatCurrency(totalCost)}</span></p>
        {netRate && (
          <p className="text-blue-800 mt-1">
            Expected Profit: <span className={`font-bold ${estimatedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(estimatedProfit)}
            </span>
          </p>
        )}
      </div>

      <Input 
        label="Net Rate (Base Price)" 
        type="number" 
        step="0.01"
        placeholder="Enter the net rate for this vehicle"
        {...register('netRate')} 
        error={errors.netRate?.message} 
      />

      <p className="text-sm text-gray-500">
        This is the base price you want to set for the vehicle. The actual selling price can be different and will be recorded during the sale.
      </p>

      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? 'Processing...' : 'Mark Ready for Sale'}
        </Button>
      </div>
    </form>
  )
}
