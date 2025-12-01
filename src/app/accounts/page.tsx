'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFetch, postData } from '@/hooks/useData'
import { formatCurrency } from '@/lib/currency'
import { bankAccountSchema, BankAccountInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Plus, Wallet, CreditCard } from 'lucide-react'

interface BankAccount {
  id: string
  name: string
  bankName: string
  accountNo: string
  balance: number
}

interface CashAccount {
  id: string
  balance: number
}

export default function AccountsPage() {
  const { data: banks, loading, refetch } = useFetch<BankAccount[]>('/api/bank-accounts')
  const { data: cash, refetch: refetchCash } = useFetch<CashAccount>('/api/cash-account')
  const [showForm, setShowForm] = useState(false)
  const [editingCash, setEditingCash] = useState(false)
  const [cashBalance, setCashBalance] = useState('')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<BankAccountInput>({
    resolver: zodResolver(bankAccountSchema) as any,
  })

  const onSubmit = async (data: BankAccountInput) => {
    await postData('/api/bank-accounts', data)
    reset()
    setShowForm(false)
    refetch()
  }

  const updateCash = async () => {
    await fetch('/api/cash-account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ balance: parseFloat(cashBalance) }),
    })
    setEditingCash(false)
    refetchCash()
  }

  const totalBankBalance = banks?.reduce((sum, acc) => sum + acc.balance, 0) || 0

  return (
    <div className="text-gray-900">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Accounts</h1>
        <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Add Bank Account
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg shadow p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Cash on Hand</p>
              <p className="text-xl sm:text-2xl font-bold">{formatCurrency(cash?.balance || 0)}</p>
            </div>
          </div>
          {editingCash ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="number"
                value={cashBalance}
                onChange={(e) => setCashBalance(e.target.value)}
                placeholder="Enter balance"
                className="flex-1"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={updateCash} className="flex-1 sm:flex-none">Save</Button>
                <Button size="sm" variant="secondary" onClick={() => setEditingCash(false)} className="flex-1 sm:flex-none">Cancel</Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => { setEditingCash(true); setCashBalance(String(cash?.balance || 0)) }} className="w-full sm:w-auto">
              Update Balance
            </Button>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Total Bank Balance</p>
              <p className="text-xl sm:text-2xl font-bold">{formatCurrency(totalBankBalance)}</p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-lg sm:text-xl font-semibold mb-4">Bank Accounts</h2>
      
      {loading ? (
        <div className="text-center py-8 text-gray-900">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banks?.map(account => (
            <div key={account.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-sm sm:text-base">{account.name}</h3>
              <p className="text-xs sm:text-sm text-gray-500">{account.bankName}</p>
              <p className="text-xs text-gray-400">****{account.accountNo.slice(-4)}</p>
              <p className="text-lg sm:text-xl font-bold mt-2">{formatCurrency(account.balance)}</p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Bank Account">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Account Name" {...register('name')} error={errors.name?.message} />
          <Input label="Bank Name" {...register('bankName')} error={errors.bankName?.message} />
          <Input label="Account Number" {...register('accountNo')} error={errors.accountNo?.message} />
          <Input label="Initial Balance" type="number" {...register('balance')} />
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? 'Saving...' : 'Add Account'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
