'use client'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useFetch, putData } from '@/hooks/useData'

const repairEditSchema = z.object({
  repairTypeId: z.string().min(1, 'Repair type is required'),
  description: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  vendorName: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  cost: z.coerce.number().min(0, 'Cost must be positive'),
})

type RepairEditInput = z.infer<typeof repairEditSchema>

interface RepairType { id: string; name: string }

interface Props {
  repair: any
  onSuccess: () => void
  onCancel: () => void
}

export function EditRepairForm({ repair, onSuccess, onCancel }: Props) {
  const { data: repairTypes } = useFetch<RepairType[]>('/api/repair-types')
  
  console.log('Repair data:', repair)
  console.log('Repair types:', repairTypes)
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<RepairEditInput>({
    resolver: zodResolver(repairEditSchema) as any,
    defaultValues: {
      repairTypeId: repair.repairTypeId || '',
      description: repair.description || '',
      vendorName: repair.vendorName || '',
      cost: repair.cost,
    },
  })
  
  // Ensure the repair type is set when repair types load
  React.useEffect(() => {
    if (repair.repairTypeId && repairTypes) {
      console.log('Setting repairTypeId to:', repair.repairTypeId)
      setValue('repairTypeId', repair.repairTypeId)
    }
  }, [repair.repairTypeId, repairTypes, setValue])

  const onSubmit = async (data: RepairEditInput) => {
    await putData(`/api/repairs/${repair.id}`, data)
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

      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
        <strong>Note:</strong> Changing the cost will automatically adjust the related account balance.
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto">Cancel</Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? 'Saving...' : 'Update Repair'}
        </Button>
      </div>
    </form>
  )
}
