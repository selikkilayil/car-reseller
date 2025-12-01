'use client'
import { useState } from 'react'
import { useFetch } from '@/hooks/useData'
import { formatCurrency } from '@/lib/currency'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Transaction {
  id: string
  amount: number
  type: 'DEBIT' | 'CREDIT'
  purpose: string
  description: string | null
  createdAt: string
  bankAccount?: { name: string; bankName: string }
  cashAccount?: { id: string }
  car?: { make: string; model: string; year: number; id: string }
}

const purposeColors: Record<string, 'default' | 'warning' | 'info' | 'success' | 'danger'> = {
  PURCHASE: 'danger',
  REPAIR: 'warning',
  EXPENSE: 'info',
  SALE: 'success',
}

export default function TransactionsPage() {
  const { data: transactions, loading } = useFetch<Transaction[]>('/api/transactions')
  const [filter, setFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  const filteredTransactions = transactions?.filter(t => {
    if (filter && t.purpose !== filter) return false
    if (typeFilter && t.type !== typeFilter) return false
    return true
  })

  const totalDebit = transactions?.filter(t => t.type === 'DEBIT').reduce((sum, t) => sum + t.amount, 0) || 0
  const totalCredit = transactions?.filter(t => t.type === 'CREDIT').reduce((sum, t) => sum + t.amount, 0) || 0
  const netFlow = totalCredit - totalDebit

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Transactions</h1>
        <p className="text-slate-600 mt-1 text-sm sm:text-base">View all financial transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Debit</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDebit)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Credit</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCredit)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Net Flow</p>
          <p className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(netFlow)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <Button variant={filter === '' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('')} className="whitespace-nowrap">
            All Purposes
          </Button>
          <Button variant={filter === 'PURCHASE' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('PURCHASE')} className="whitespace-nowrap">
            Purchase
          </Button>
          <Button variant={filter === 'REPAIR' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('REPAIR')} className="whitespace-nowrap">
            Repair
          </Button>
          <Button variant={filter === 'EXPENSE' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('EXPENSE')} className="whitespace-nowrap">
            Expense
          </Button>
          <Button variant={filter === 'SALE' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('SALE')} className="whitespace-nowrap">
            Sale
          </Button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <Button variant={typeFilter === '' ? 'primary' : 'secondary'} size="sm" onClick={() => setTypeFilter('')} className="whitespace-nowrap">
            All Types
          </Button>
          <Button variant={typeFilter === 'DEBIT' ? 'primary' : 'secondary'} size="sm" onClick={() => setTypeFilter('DEBIT')} className="whitespace-nowrap">
            Debit
          </Button>
          <Button variant={typeFilter === 'CREDIT' ? 'primary' : 'secondary'} size="sm" onClick={() => setTypeFilter('CREDIT')} className="whitespace-nowrap">
            Credit
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-900">Loading...</div>
      ) : (
        <>
          {/* Desktop table view */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Car</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTransactions?.map(txn => (
                  <tr key={txn.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={purposeColors[txn.purpose]}>{txn.purpose}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{txn.description || '-'}</td>
                    <td className="px-6 py-4 text-sm">
                      {txn.car ? (
                        <Link href={`/cars/${txn.car.id}`} className="text-blue-600 hover:underline">
                          {txn.car.make} {txn.car.model} ({txn.car.year})
                        </Link>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {txn.bankAccount ? `${txn.bankAccount.name} (${txn.bankAccount.bankName})` : 'Cash'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${txn.type === 'DEBIT' ? 'text-red-600' : 'text-green-600'}`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-medium ${txn.type === 'DEBIT' ? 'text-red-600' : 'text-green-600'}`}>
                      {txn.type === 'DEBIT' ? '-' : '+'}{formatCurrency(txn.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTransactions?.length === 0 && (
              <div className="text-center py-8 text-gray-500">No transactions found</div>
            )}
          </div>

          {/* Mobile card view */}
          <div className="md:hidden space-y-3">
            {filteredTransactions?.map(txn => (
              <div key={txn.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-2">
                    <Badge variant={purposeColors[txn.purpose]}>{txn.purpose}</Badge>
                    <span className={`text-sm font-medium ${txn.type === 'DEBIT' ? 'text-red-600' : 'text-green-600'}`}>
                      {txn.type}
                    </span>
                  </div>
                  <div className={`text-lg font-bold ${txn.type === 'DEBIT' ? 'text-red-600' : 'text-green-600'}`}>
                    {txn.type === 'DEBIT' ? '-' : '+'}{formatCurrency(txn.amount)}
                  </div>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <div>Date: {new Date(txn.createdAt).toLocaleDateString()}</div>
                  <div>Description: {txn.description || '-'}</div>
                  {txn.car && (
                    <div>
                      Car: <Link href={`/cars/${txn.car.id}`} className="text-blue-600 hover:underline">
                        {txn.car.make} {txn.car.model} ({txn.car.year})
                      </Link>
                    </div>
                  )}
                  <div>Account: {txn.bankAccount ? `${txn.bankAccount.name} (${txn.bankAccount.bankName})` : 'Cash'}</div>
                </div>
              </div>
            ))}
            {filteredTransactions?.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-white rounded-lg">No transactions found</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
