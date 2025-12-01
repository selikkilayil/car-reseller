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
import { patchData } from '@/hooks/useData'
import { Plus, Wrench, DollarSign, ShoppingCart, Truck } from 'lucide-react'

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
  const [modal, setModal] = useState<'repair' | 'expense-purchase' | 'expense-repair' | 'expense-sale' | 'sale' | null>(null)

  const updateStatus = async (status: string) => {
    await patchData(`/api/cars/${car.id}/status`, { status })
    onUpdate()
  }

  const handleFormSuccess = () => {
    setModal(null)
    onUpdate()
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{car.make} {car.model} ({car.year})</h2>
            <p className="text-gray-500">{car.registrationNo || car.vin || 'No ID'}</p>
          </div>
          <Badge variant={statusColors[car.status]}>{car.status.replace('_', ' ')}</Badge>
        </div>
        
        <div className="mt-4 flex gap-2">
          {car.status === 'PURCHASED' && (
            <Button size="sm" onClick={() => updateStatus('IN_REPAIR')}>
              <Wrench className="w-4 h-4 mr-1" /> Start Repair
            </Button>
          )}
          {car.status === 'IN_REPAIR' && (
            <Button size="sm" onClick={() => updateStatus('READY_FOR_SALE')}>
              <ShoppingCart className="w-4 h-4 mr-1" /> Mark Ready for Sale
            </Button>
          )}
          {car.status === 'READY_FOR_SALE' && (
            <Button size="sm" onClick={() => setModal('sale')}>
              <DollarSign className="w-4 h-4 mr-1" /> Record Sale
            </Button>
          )}
          {car.status === 'SOLD' && (
            <Button size="sm" onClick={() => updateStatus('DELIVERED')}>
              <Truck className="w-4 h-4 mr-1" /> Mark Delivered
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="purchase" className="p-6">
        <TabsList>
          <TabsTrigger value="purchase">Purchase</TabsTrigger>
          <TabsTrigger value="repairs">Repairs ({car.repairs?.length || 0})</TabsTrigger>
          <TabsTrigger value="sale">Sale</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="purchase">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Purchase Expenses</h4>
                <Button size="sm" variant="ghost" onClick={() => setModal('expense-purchase')}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {car.expenses?.filter((e: any) => e.category === 'PURCHASE').map((exp: any) => (
                  <div key={exp.id} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>{exp.type}: {exp.description || '-'}</span>
                    <span className="font-medium">{formatCurrency(exp.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="repairs">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Repairs</h4>
            <Button size="sm" onClick={() => setModal('repair')}>
              <Plus className="w-4 h-4 mr-1" /> Add Repair
            </Button>
          </div>
          <div className="space-y-2">
            {car.repairs?.map((repair: any) => (
              <div key={repair.id} className="flex justify-between p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{repair.repairType?.name}</span>
                  {repair.description && <p className="text-sm text-gray-500">{repair.description}</p>}
                  {repair.vendorName && <p className="text-sm text-gray-500">Vendor: {repair.vendorName}</p>}
                </div>
                <span className="font-medium">{formatCurrency(repair.cost)}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Repair Expenses</h4>
              <Button size="sm" variant="ghost" onClick={() => setModal('expense-repair')}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            <div className="space-y-2">
              {car.expenses?.filter((e: any) => e.category === 'REPAIR').map((exp: any) => (
                <div key={exp.id} className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>{exp.type}: {exp.description || '-'}</span>
                  <span className="font-medium">${exp.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sale">
          {car.salePrice ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-gray-500">Net Rate:</span> <span className="font-medium">{formatCurrency(car.netRate)}</span></div>
                <div><span className="text-gray-500">Sale Price:</span> <span className="font-medium">{formatCurrency(car.salePrice)}</span></div>
                <div><span className="text-gray-500">Buyer:</span> <span className="font-medium">{car.saleParty?.name}</span></div>
                <div><span className="text-gray-500">Sale Type:</span> <span className="font-medium">{car.saleType}</span></div>
                {car.saleBroker && <div><span className="text-gray-500">Broker:</span> <span className="font-medium">{car.saleBroker.name} ({formatCurrency(car.saleBrokerage)})</span></div>}
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Sale Expenses</h4>
                  <Button size="sm" variant="ghost" onClick={() => setModal('expense-sale')}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {car.expenses?.filter((e: any) => e.category === 'SALE').map((exp: any) => (
                    <div key={exp.id} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>{exp.type}: {exp.description || '-'}</span>
                      <span className="font-medium">${exp.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Car not sold yet</p>
          )}
        </TabsContent>

        <TabsContent value="summary">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div><span className="text-gray-500">Purchase Price:</span> <span className="font-medium">{formatCurrency(car.summary?.purchaseTotal)}</span></div>
              <div><span className="text-gray-500">Purchase Expenses:</span> <span className="font-medium">{formatCurrency(car.summary?.purchaseExpenses)}</span></div>
              <div><span className="text-gray-500">Repair Costs:</span> <span className="font-medium">{formatCurrency(car.summary?.repairTotal)}</span></div>
              <div><span className="text-gray-500">Repair Expenses:</span> <span className="font-medium">{formatCurrency(car.summary?.repairExpenses)}</span></div>
              <div><span className="text-gray-500">Sale Expenses:</span> <span className="font-medium">{formatCurrency(car.summary?.saleExpenses)}</span></div>
              <div className="col-span-2 border-t pt-2">
                <span className="text-gray-500">Total Cost:</span> <span className="font-bold text-lg">{formatCurrency(car.summary?.totalCost)}</span>
              </div>
            </div>
            
            {car.salePrice && (
              <div className={`p-4 rounded-lg ${car.summary?.profit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-lg">Sale Price: {formatCurrency(car.salePrice)}</span>
                  <span className={`text-2xl font-bold ${car.summary?.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
      
      <Modal isOpen={modal === 'sale'} onClose={() => setModal(null)} title="Record Sale">
        <SaleForm carId={car.id} totalCost={car.summary?.totalCost || 0} onSuccess={handleFormSuccess} onCancel={() => setModal(null)} />
      </Modal>
    </div>
  )
}
