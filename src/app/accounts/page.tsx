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
import { Plus, Wallet, CreditCard, ArrowDownToLine, ArrowUpFromLine, PlusCircle } from 'lucide-react'
import { Select } from '@/components/ui/select'

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
  const [showCashModal, setShowCashModal] = useState(false)
  const [cashTransactionType, setCashTransactionType] = useState<'add' | 'withdraw'>('add')
  const [cashAmount, setCashAmount] = useState('')
  const [selectedBankAccount, setSelectedBankAccount] = useState('')
  const [cashDescription, setCashDescription] = useState('')
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false)
  const [addMoneyAmount, setAddMoneyAmount] = useState('')
  const [addMoneyDescription, setAddMoneyDescription] = useState('')
  const [selectedBankForAddMoney, setSelectedBankForAddMoney] = useState('')
  const [showAddCashModal, setShowAddCashModal] = useState(false)
  const [addCashAmount, setAddCashAmount] = useState('')
  const [addCashDescription, setAddCashDescription] = useState('')

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<BankAccountInput>({
    resolver: zodResolver(bankAccountSchema) as any,
    defaultValues: {
      name: '',
      bankName: '',
      accountNo: '',
      balance: 0,
    },
  })

  const onSubmit = async (data: BankAccountInput) => {
    try {
      console.log('Submitting bank account data:', data)
      await postData('/api/bank-accounts', data)
      reset()
      setShowForm(false)
      refetch()
    } catch (error) {
      console.error('Failed to add bank account:', error)
      alert(`Failed to add bank account: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleCashTransaction = async () => {
    try {
      const amount = parseFloat(cashAmount)
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount')
        return
      }

      if (!selectedBankAccount) {
        alert('Please select a bank account')
        return
      }

      const response = await fetch('/api/cash-account/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: cashTransactionType,
          amount,
          bankAccountId: selectedBankAccount,
          description: cashDescription || `${cashTransactionType === 'add' ? 'Deposit to' : 'Withdrawal from'} cash`,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Transaction failed')
      }

      setShowCashModal(false)
      setCashAmount('')
      setSelectedBankAccount('')
      setCashDescription('')
      refetchCash()
      refetch()
    } catch (error) {
      console.error('Cash transaction failed:', error)
      alert(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleAddMoney = async () => {
    try {
      const amount = parseFloat(addMoneyAmount)
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount')
        return
      }

      if (!selectedBankForAddMoney) {
        alert('Please select a bank account')
        return
      }

      const response = await fetch(`/api/bank-accounts/${selectedBankForAddMoney}/add-money`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description: addMoneyDescription || 'Money added to account',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add money')
      }

      setShowAddMoneyModal(false)
      setAddMoneyAmount('')
      setAddMoneyDescription('')
      setSelectedBankForAddMoney('')
      refetch()
    } catch (error) {
      console.error('Add money failed:', error)
      alert(`Failed to add money: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleAddCash = async () => {
    try {
      const amount = parseFloat(addCashAmount)
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount')
        return
      }

      const response = await fetch('/api/cash-account/add-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description: addCashDescription || 'Money added to cash',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add cash')
      }

      setShowAddCashModal(false)
      setAddCashAmount('')
      setAddCashDescription('')
      refetchCash()
    } catch (error) {
      console.error('Add cash failed:', error)
      alert(`Failed to add cash: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const totalBankBalance = banks?.reduce((sum, acc) => sum + acc.balance, 0) || 0

  return (
    <div className="text-gray-900">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Accounts</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={() => setShowAddMoneyModal(true)} variant="secondary" className="w-full sm:w-auto">
            <PlusCircle className="w-4 h-4 mr-2" /> Add Money
          </Button>
          <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Add Bank Account
          </Button>
        </div>
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
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowAddCashModal(true)} 
              className="flex-1 sm:flex-none text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              <PlusCircle className="w-4 h-4 mr-1" /> Add Cash
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => { setCashTransactionType('add'); setShowCashModal(true) }} 
              className="flex-1 sm:flex-none text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <ArrowDownToLine className="w-4 h-4 mr-1" /> Withdraw
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => { setCashTransactionType('withdraw'); setShowCashModal(true) }} 
              className="flex-1 sm:flex-none text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <ArrowUpFromLine className="w-4 h-4 mr-1" /> Deposit
            </Button>
          </div>
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
        <form onSubmit={handleSubmit(onSubmit, (errors) => console.log('Validation errors:', errors))} className="space-y-4">
          <Input label="Account Name" {...register('name')} error={errors.name?.message} />
          <Input label="Bank Name" {...register('bankName')} error={errors.bankName?.message} />
          <Input label="Account Number" {...register('accountNo')} error={errors.accountNo?.message} />
          <Input 
            label="Initial Balance" 
            type="number" 
            step="0.01"
            {...register('balance', { valueAsNumber: true })} 
            error={errors.balance?.message}
          />
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? 'Saving...' : 'Add Account'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={showCashModal} 
        onClose={() => setShowCashModal(false)} 
        title={cashTransactionType === 'add' ? 'Withdraw Cash from Bank' : 'Deposit Cash to Bank'}
      >
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${cashTransactionType === 'add' ? 'bg-green-50' : 'bg-blue-50'}`}>
            <p className="text-sm font-medium mb-2">
              {cashTransactionType === 'add' ? (
                <>
                  <ArrowDownToLine className="w-4 h-4 inline mr-1" />
                  Withdrawing cash from bank account
                </>
              ) : (
                <>
                  <ArrowUpFromLine className="w-4 h-4 inline mr-1" />
                  Depositing cash to bank account
                </>
              )}
            </p>
            <p className="text-xs text-gray-600">
              {cashTransactionType === 'add' 
                ? 'This will decrease the selected bank account balance and increase cash on hand.'
                : 'This will increase the selected bank account balance and decrease cash on hand.'}
            </p>
          </div>

          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={cashAmount}
            onChange={(e) => setCashAmount(e.target.value)}
            placeholder="Enter amount"
            required
          />

          <Select
            label={cashTransactionType === 'add' ? 'Withdraw From Bank Account' : 'Deposit To Bank Account'}
            value={selectedBankAccount}
            onChange={(e) => setSelectedBankAccount(e.target.value)}
            options={banks?.map(b => ({ 
              value: b.id, 
              label: `${b.name} - ${b.bankName} (${formatCurrency(b.balance)})` 
            })) || []}
            required
          />

          <Input
            label="Description (Optional)"
            value={cashDescription}
            onChange={(e) => setCashDescription(e.target.value)}
            placeholder="e.g., ATM withdrawal, cash deposit"
          />

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setShowCashModal(false)} 
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleCashTransaction} 
              className="w-full sm:w-auto"
            >
              {cashTransactionType === 'add' ? 'Withdraw Cash' : 'Deposit Cash'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={showAddMoneyModal} 
        onClose={() => setShowAddMoneyModal(false)} 
        title="Add Money to Bank Account"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-green-50">
            <p className="text-sm font-medium mb-2">
              <PlusCircle className="w-4 h-4 inline mr-1" />
              Adding money to bank account
            </p>
            <p className="text-xs text-gray-600">
              This will increase the selected bank account balance. Use this for deposits, transfers, or other income.
            </p>
          </div>

          <Select
            label="Select Bank Account"
            value={selectedBankForAddMoney}
            onChange={(e) => setSelectedBankForAddMoney(e.target.value)}
            options={banks?.map(b => ({ 
              value: b.id, 
              label: `${b.name} - ${b.bankName} (${formatCurrency(b.balance)})` 
            })) || []}
            required
          />

          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={addMoneyAmount}
            onChange={(e) => setAddMoneyAmount(e.target.value)}
            placeholder="Enter amount"
            required
          />

          <Input
            label="Description (Optional)"
            value={addMoneyDescription}
            onChange={(e) => setAddMoneyDescription(e.target.value)}
            placeholder="e.g., Bank transfer, deposit, income"
          />

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setShowAddMoneyModal(false)} 
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleAddMoney} 
              className="w-full sm:w-auto"
            >
              Add Money
            </Button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={showAddCashModal} 
        onClose={() => setShowAddCashModal(false)} 
        title="Add Money to Cash"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-purple-50">
            <p className="text-sm font-medium mb-2">
              <PlusCircle className="w-4 h-4 inline mr-1" />
              Adding money directly to cash
            </p>
            <p className="text-xs text-gray-600">
              This will increase your cash on hand without any bank transfer. Use this for cash income, sales, or other cash receipts.
            </p>
          </div>

          <Input
            label="Amount"
            type="number"
            step="0.01"
            value={addCashAmount}
            onChange={(e) => setAddCashAmount(e.target.value)}
            placeholder="Enter amount"
            required
          />

          <Input
            label="Description (Optional)"
            value={addCashDescription}
            onChange={(e) => setAddCashDescription(e.target.value)}
            placeholder="e.g., Cash sale, payment received, income"
          />

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setShowAddCashModal(false)} 
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleAddCash} 
              className="w-full sm:w-auto"
            >
              Add Cash
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
