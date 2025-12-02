'use client'
import { useState } from 'react'
import { formatCurrency } from '@/lib/currency'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { RepairForm } from '@/components/forms/RepairForm'
import { ExpenseForm } from '@/components/forms/ExpenseForm'
import { SaleForm } from '@/components/forms/SaleForm'
import { ReadyForSaleForm } from '@/components/forms/ReadyForSaleForm'
import { EditCarForm } from '@/components/forms/EditCarForm'
import { EditExpenseForm } from '@/components/forms/EditExpenseForm'
import { EditRepairForm } from '@/components/forms/EditRepairForm'
import { patchData, deleteData } from '@/hooks/useData'
import { Plus, Wrench, DollarSign, ShoppingCart, Truck, Edit, Trash2, Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CarDetailProps {
  car: any
  onUpdate: () => void
}

const statusColors: Record<string, 'default' | 'warning' | 'info' | 'success' | 'danger'> = {
  PURCHASED: 'default',
  IN_REPAIR: 'warning',
  READY_FOR_SALE: 'info',
  SOLD: 'success',
  DELIVERED: 'success',
}

export function CarDetail({ car, onUpdate }: CarDetailProps) {
  const router = useRouter()
  const [modal, setModal] = useState<'repair' | 'expense-purchase' | 'expense-repair' | 'expense-sale' | 'sale' | 'ready-for-sale' | 'edit' | null>(null)
  const [editingExpense, setEditingExpense] = useState<any>(null)
  const [editingRepair, setEditingRepair] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const updateStatus = async (status: string) => {
    await patchData(`/api/cars/${car.id}/status`, { status })
    onUpdate()
  }

  const handleFormSuccess = () => {
    setModal(null)
    onUpdate()
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this car? This action cannot be undone.')) {
      try {
        await deleteData(`/api/cars/${car.id}`)
        router.push('/cars')
      } catch (error) {
        alert('Failed to delete car')
      }
    }
  }

  const handleDeleteExpense = async (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense? The amount will be refunded to the account.')) {
      try {
        await deleteData(`/api/expenses/${expenseId}`)
        onUpdate()
      } catch (error) {
        alert('Failed to delete expense')
      }
    }
  }

  const handleExpenseEditSuccess = () => {
    setEditingExpense(null)
    onUpdate()
  }

  const handleDeleteRepair = async (repairId: string) => {
    if (confirm('Are you sure you want to delete this repair? The cost will be refunded to the account.')) {
      try {
        await deleteData(`/api/repairs/${repairId}`)
        onUpdate()
      } catch (error) {
        alert('Failed to delete repair')
      }
    }
  }

  const handleRepairEditSuccess = () => {
    setEditingRepair(null)
    onUpdate()
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 sm:p-6 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{car.make} {car.model} ({car.year})</h2>
            <p className="text-gray-500 text-sm sm:text-base">{car.registrationNo || car.vin || 'No ID'}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setModal('edit')}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </Button>
            <Badge variant={statusColors[car.status]}>{car.status.replace('_', ' ')}</Badge>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {car.status === 'PURCHASED' && (
            <Button size="sm" onClick={() => updateStatus('IN_REPAIR')} className="flex-1 sm:flex-none">
              <Wrench className="w-4 h-4 mr-1" /> Start Repair
            </Button>
          )}
          {car.status === 'IN_REPAIR' && (
            <Button size="sm" onClick={() => setModal('ready-for-sale')} className="flex-1 sm:flex-none">
              <ShoppingCart className="w-4 h-4 mr-1" /> Mark Ready for Sale
            </Button>
          )}
          {car.status === 'READY_FOR_SALE' && (
            <Button size="sm" onClick={() => setModal('sale')} className="flex-1 sm:flex-none">
              <DollarSign className="w-4 h-4 mr-1" /> Record Sale
            </Button>
          )}
          {car.status === 'SOLD' && (
            <Button size="sm" onClick={() => updateStatus('DELIVERED')} className="flex-1 sm:flex-none">
              <Truck className="w-4 h-4 mr-1" /> Mark Delivered
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="purchase" className="p-4 sm:p-6">
        <TabsList className="w-full overflow-x-auto flex-nowrap">
          <TabsTrigger value="purchase" className="whitespace-nowrap">Purchase</TabsTrigger>
          <TabsTrigger value="repairs" className="whitespace-nowrap">Repairs ({car.repairs?.length || 0})</TabsTrigger>
          <TabsTrigger value="sale" className="whitespace-nowrap">Sale</TabsTrigger>
          <TabsTrigger value="transactions" className="whitespace-nowrap">Transactions ({car.transactions?.length || 0})</TabsTrigger>
          <TabsTrigger value="summary" className="whitespace-nowrap">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="purchase">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
              <div><span className="text-gray-500">Purchase Price:</span> <span className="font-medium">{formatCurrency(car.purchasePrice)}</span></div>
              <div><span className="text-gray-500">Source:</span> <span className="font-medium">{car.purchaseSource}</span></div>
              <div><span className="text-gray-500">Seller:</span> <span className="font-medium">{car.purchaseParty?.name}</span></div>
              {car.purchaseBroker && <div><span className="text-gray-500">Broker:</span> <span className="font-medium">{car.purchaseBroker.name} ({formatCurrency(car.brokerageAmount)})</span></div>}
              {car.isInLoan && (
                <>
                  <div><span className="text-gray-500">Loan Amount:</span> <span className="font-medium">{formatCurrency(car.loanAmount)}</span></div>
                  <div><span className="text-gray-500">Paid to Seller:</span> <span className="font-medium">{formatCurrency(car.amountPaidToSeller)}</span></div>
                </>
              )}
            </div>
            
            <div className="mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                <h4 className="font-medium text-sm sm:text-base">Purchase Expenses</h4>
                <Button size="sm" variant="ghost" onClick={() => setModal('expense-purchase')} className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {car.expenses?.filter((e: any) => e.category === 'PURCHASE').map((exp: any) => (
                  <div key={exp.id} className="flex justify-between items-center p-2 bg-gray-50 rounded gap-2 text-sm">
                    <span className="flex-1">{exp.type}: {exp.description || '-'}</span>
                    <span className="font-medium">{formatCurrency(exp.amount)}</span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditingExpense(exp)} className="h-7 w-7 p-0">
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteExpense(exp.id)} className="h-7 w-7 p-0 text-red-600 hover:text-red-700">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="repairs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h4 className="font-medium text-sm sm:text-base">Repairs</h4>
            <Button size="sm" onClick={() => setModal('repair')} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-1" /> Add Repair
            </Button>
          </div>
          <div className="space-y-2">
            {car.repairs?.map((repair: any) => (
              <div key={repair.id} className="flex justify-between items-start p-3 bg-gray-50 rounded gap-2">
                <div className="flex-1 text-sm sm:text-base">
                  <span className="font-medium">{repair.repairType?.name}</span>
                  {repair.description && <p className="text-xs sm:text-sm text-gray-500">{repair.description}</p>}
                  {repair.vendorName && <p className="text-xs sm:text-sm text-gray-500">Vendor: {repair.vendorName}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm sm:text-base">{formatCurrency(repair.cost)}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditingRepair(repair)} className="h-7 w-7 p-0">
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteRepair(repair.id)} className="h-7 w-7 p-0 text-red-600 hover:text-red-700">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
              <h4 className="font-medium text-sm sm:text-base">Repair Expenses</h4>
              <Button size="sm" variant="ghost" onClick={() => setModal('expense-repair')} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {car.expenses?.filter((e: any) => e.category === 'REPAIR').map((exp: any) => (
                <div key={exp.id} className="flex justify-between items-center p-2 bg-gray-50 rounded gap-2 text-sm">
                  <span className="flex-1">{exp.type}: {exp.description || '-'}</span>
                  <span className="font-medium">{formatCurrency(exp.amount)}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditingExpense(exp)} className="h-7 w-7 p-0">
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteExpense(exp.id)} className="h-7 w-7 p-0 text-red-600 hover:text-red-700">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sale">
          {car.salePrice ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
                <div><span className="text-gray-500">Net Rate:</span> <span className="font-medium">{formatCurrency(car.netRate)}</span></div>
                <div><span className="text-gray-500">Sale Price:</span> <span className="font-medium">{formatCurrency(car.salePrice)}</span></div>
                <div><span className="text-gray-500">Buyer:</span> <span className="font-medium">{car.saleParty?.name}</span></div>
                <div><span className="text-gray-500">Sale Type:</span> <span className="font-medium">{car.saleType}</span></div>
                {car.saleBroker && <div><span className="text-gray-500">Broker:</span> <span className="font-medium">{car.saleBroker.name} ({formatCurrency(car.saleBrokerage)})</span></div>}
              </div>
              
              <div className="mt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                  <h4 className="font-medium text-sm sm:text-base">Sale Expenses</h4>
                  <Button size="sm" variant="ghost" onClick={() => setModal('expense-sale')} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {car.expenses?.filter((e: any) => e.category === 'SALE').map((exp: any) => (
                    <div key={exp.id} className="flex justify-between items-center p-2 bg-gray-50 rounded gap-2 text-sm">
                      <span className="flex-1">{exp.type}: {exp.description || '-'}</span>
                      <span className="font-medium">{formatCurrency(exp.amount)}</span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setEditingExpense(exp)} className="h-7 w-7 p-0">
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteExpense(exp.id)} className="h-7 w-7 p-0 text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm sm:text-base">Car not sold yet</p>
          )}
        </TabsContent>

        <TabsContent value="transactions">
          <div className="space-y-2">
            {car.transactions?.length > 0 ? (
              car.transactions.map((txn: any) => (
                <div key={txn.id} className="flex flex-col sm:flex-row justify-between p-3 bg-gray-50 rounded gap-2">
                  <div className="text-sm">
                    <div className="flex gap-2 items-center mb-1">
                      <span className={`font-medium ${txn.type === 'DEBIT' ? 'text-red-600' : 'text-green-600'}`}>
                        {txn.purpose}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600">{txn.description || '-'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {txn.bankAccount ? `${txn.bankAccount.name} (${txn.bankAccount.bankName})` : 'Cash'}
                    </p>
                  </div>
                  <div className={`text-lg font-bold ${txn.type === 'DEBIT' ? 'text-red-600' : 'text-green-600'}`}>
                    {txn.type === 'DEBIT' ? '-' : '+'}{formatCurrency(txn.amount)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No transactions yet</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="summary">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg text-sm sm:text-base">
              <div><span className="text-gray-500">Purchase Price:</span> <span className="font-medium">{formatCurrency(car.summary?.purchaseTotal)}</span></div>
              <div><span className="text-gray-500">Purchase Expenses:</span> <span className="font-medium">{formatCurrency(car.summary?.purchaseExpenses)}</span></div>
              <div><span className="text-gray-500">Repair Costs:</span> <span className="font-medium">{formatCurrency(car.summary?.repairTotal)}</span></div>
              <div><span className="text-gray-500">Repair Expenses:</span> <span className="font-medium">{formatCurrency(car.summary?.repairExpenses)}</span></div>
              <div><span className="text-gray-500">Sale Expenses:</span> <span className="font-medium">{formatCurrency(car.summary?.saleExpenses)}</span></div>
              <div className="sm:col-span-2 border-t pt-2">
                <span className="text-gray-500">Total Cost:</span> <span className="font-bold text-base sm:text-lg">{formatCurrency(car.summary?.totalCost)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-lg text-sm sm:text-base">
              <div><span className="text-gray-500">Days Since Purchase:</span> <span className="font-medium">{car.summary?.daysSincePurchase || 0} days</span></div>
              {car.summary?.repairDays !== null && car.summary?.repairDays !== undefined && (
                <div><span className="text-gray-500">Days in Repair:</span> <span className="font-medium text-orange-600">{car.summary.repairDays} days</span></div>
              )}
            </div>
            
            {car.salePrice && (
              <div className={`p-3 sm:p-4 rounded-lg ${car.summary?.profit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span className="text-base sm:text-lg">Sale Price: {formatCurrency(car.salePrice)}</span>
                  <span className={`text-xl sm:text-2xl font-bold ${car.summary?.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Profit: {formatCurrency(car.summary?.profit)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Modal isOpen={modal === 'repair'} onClose={() => setModal(null)} title="Add Repair">
        <RepairForm carId={car.id} onSuccess={handleFormSuccess} onCancel={() => setModal(null)} />
      </Modal>
      
      <Modal isOpen={modal === 'expense-purchase'} onClose={() => setModal(null)} title="Add Purchase Expense">
        <ExpenseForm carId={car.id} category="PURCHASE" onSuccess={handleFormSuccess} onCancel={() => setModal(null)} />
      </Modal>
      
      <Modal isOpen={modal === 'expense-repair'} onClose={() => setModal(null)} title="Add Repair Expense">
        <ExpenseForm carId={car.id} category="REPAIR" onSuccess={handleFormSuccess} onCancel={() => setModal(null)} />
      </Modal>
      
      <Modal isOpen={modal === 'expense-sale'} onClose={() => setModal(null)} title="Add Sale Expense">
        <ExpenseForm carId={car.id} category="SALE" onSuccess={handleFormSuccess} onCancel={() => setModal(null)} />
      </Modal>
      
      <Modal isOpen={modal === 'ready-for-sale'} onClose={() => setModal(null)} title="Mark Ready for Sale">
        <ReadyForSaleForm carId={car.id} totalCost={car.summary?.totalCost || 0} onSuccess={handleFormSuccess} onCancel={() => setModal(null)} />
      </Modal>
      
      <Modal isOpen={modal === 'sale'} onClose={() => setModal(null)} title="Record Sale">
        <SaleForm carId={car.id} totalCost={car.summary?.totalCost || 0} netRate={car.netRate} onSuccess={handleFormSuccess} onCancel={() => setModal(null)} />
      </Modal>
      
      <Modal isOpen={modal === 'edit'} onClose={() => setModal(null)} title="Edit Car Details">
        <EditCarForm car={car} onSuccess={handleFormSuccess} onCancel={() => setModal(null)} />
      </Modal>
      
      <Modal isOpen={!!editingExpense} onClose={() => setEditingExpense(null)} title="Edit Expense">
        {editingExpense && (
          <EditExpenseForm expense={editingExpense} onSuccess={handleExpenseEditSuccess} onCancel={() => setEditingExpense(null)} />
        )}
      </Modal>
      
      <Modal isOpen={!!editingRepair} onClose={() => setEditingRepair(null)} title="Edit Repair">
        {editingRepair && (
          <EditRepairForm repair={editingRepair} onSuccess={handleRepairEditSuccess} onCancel={() => setEditingRepair(null)} />
        )}
      </Modal>
    </div>
  )
}
