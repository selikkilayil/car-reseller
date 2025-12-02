'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { carPurchaseSchema, CarPurchaseInput, partySchema, PartyInput } from '@/lib/validations'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useFetch, postData } from '@/hooks/useData'
import { Plus } from 'lucide-react'

interface Party { id: string; name: string; type: string }
interface BankAccount { id: string; name: string; bankName: string }

interface Props {
  onSuccess: () => void
  onCancel: () => void
}

export function PurchaseForm({ onSuccess, onCancel }: Props) {
  const { data: parties, refetch: refetchParties } = useFetch<Party[]>('/api/parties')
  const { data: banks } = useFetch<BankAccount[]>('/api/bank-accounts')
  const [showPartyForm, setShowPartyForm] = useState(false)
  const [showBrokerForm, setShowBrokerForm] = useState(false)
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<CarPurchaseInput>({
    resolver: zodResolver(carPurchaseSchema) as any,
    defaultValues: {
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseSource: 'DIRECT_USER',
      paymentMethod: 'CASH',
      isInLoan: false,
    },
  })

  const { register: registerParty, handleSubmit: handlePartySubmit, reset: resetParty, formState: { errors: partyErrors, isSubmitting: isPartySubmitting } } = useForm<PartyInput>({
    resolver: zodResolver(partySchema) as any,
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      type: undefined,
    },
  })

  const paymentMethod = watch('paymentMethod')
  const isInLoan = watch('isInLoan')

  const onSubmit = async (data: CarPurchaseInput) => {
    await postData('/api/cars', data)
    onSuccess()
  }

  const onPartySubmit = async (data: PartyInput, isBroker: boolean = false) => {
    try {
      const result = await postData<Party>('/api/parties', data)
      resetParty()
      if (isBroker) {
        setShowBrokerForm(false)
        setValue('purchaseBrokerId', result.id)
      } else {
        setShowPartyForm(false)
        setValue('purchasePartyId', result.id)
      }
      await refetchParties()
    } catch (error) {
      alert(`Failed to add party: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const sellers = parties?.filter(p => p.type === 'SELLER' || p.type === 'DEALERSHIP') || []
  const brokers = parties?.filter(p => p.type === 'BROKER') || []

  return (
    <>
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
        <div>
          <Select
            label="Seller"
            {...register('purchasePartyId')}
            error={errors.purchasePartyId?.message}
            options={sellers.map(p => ({ value: p.id, label: p.name }))}
          />
          <Button 
            type="button" 
            variant="secondary" 
            size="sm" 
            onClick={() => setShowPartyForm(true)}
            className="mt-2 w-full"
          >
            <Plus className="w-3 h-3 mr-1" /> Add New Seller
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Select
            label="Broker (Optional)"
            {...register('purchaseBrokerId')}
            options={brokers.map(p => ({ value: p.id, label: p.name }))}
          />
          <Button 
            type="button" 
            variant="secondary" 
            size="sm" 
            onClick={() => setShowBrokerForm(true)}
            className="mt-2 w-full"
          >
            <Plus className="w-3 h-3 mr-1" /> Add New Broker
          </Button>
        </div>
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

      <Select
        label="Payment Method"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Bank Amount" type="number" {...register('bankAmount')} />
          <Input label="Cash Amount" type="number" {...register('cashAmount')} />
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="w-full sm:w-auto">Cancel</Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? 'Saving...' : 'Create Purchase'}
        </Button>
      </div>
    </form>

    {/* Add Seller Modal */}
    <Modal isOpen={showPartyForm} onClose={() => setShowPartyForm(false)} title="Add New Seller">
      <form onSubmit={handlePartySubmit((data) => onPartySubmit(data, false))} className="space-y-4">
        <Input label="Name" {...registerParty('name')} error={partyErrors.name?.message} />
        <Input label="Phone" {...registerParty('phone')} />
        <Input label="Email" type="email" {...registerParty('email')} error={partyErrors.email?.message} />
        <Input label="Address" {...registerParty('address')} />
        <Select
          label="Type"
          {...registerParty('type', { required: 'Type is required' })}
          error={partyErrors.type?.message}
          options={[
            { value: 'SELLER', label: 'Seller' },
            { value: 'DEALERSHIP', label: 'Dealership' },
          ]}
          required
        />
        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={() => setShowPartyForm(false)} className="w-full sm:w-auto">Cancel</Button>
          <Button type="submit" disabled={isPartySubmitting} className="w-full sm:w-auto">
            {isPartySubmitting ? 'Adding...' : 'Add Seller'}
          </Button>
        </div>
      </form>
    </Modal>

    {/* Add Broker Modal */}
    <Modal isOpen={showBrokerForm} onClose={() => setShowBrokerForm(false)} title="Add New Broker">
      <form onSubmit={handlePartySubmit((data) => onPartySubmit(data, true))} className="space-y-4">
        <Input label="Name" {...registerParty('name')} error={partyErrors.name?.message} />
        <Input label="Phone" {...registerParty('phone')} />
        <Input label="Email" type="email" {...registerParty('email')} error={partyErrors.email?.message} />
        <Input label="Address" {...registerParty('address')} />
        <input type="hidden" {...registerParty('type')} value="BROKER" />
        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={() => setShowBrokerForm(false)} className="w-full sm:w-auto">Cancel</Button>
          <Button type="submit" disabled={isPartySubmitting} className="w-full sm:w-auto">
            {isPartySubmitting ? 'Adding...' : 'Add Broker'}
          </Button>
        </div>
      </form>
    </Modal>
    </>
  )
}
