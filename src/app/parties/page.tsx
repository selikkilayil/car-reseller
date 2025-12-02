'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFetch, postData, patchData, deleteData } from '@/hooks/useData'
import { partySchema, PartyInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface Party {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  type: string
}

const typeVariants: Record<string, 'default' | 'info' | 'success' | 'warning'> = {
  SELLER: 'default',
  BUYER: 'success',
  BROKER: 'warning',
  DEALERSHIP: 'info',
}

export default function PartiesPage() {
  const { data: parties, loading, refetch } = useFetch<Party[]>('/api/parties')
  const [showForm, setShowForm] = useState(false)
  const [editingParty, setEditingParty] = useState<Party | null>(null)
  const [filter, setFilter] = useState<string>('')

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<PartyInput>({
    resolver: zodResolver(partySchema) as any,
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      type: undefined,
    },
  })

  const openEditForm = (party: Party) => {
    setEditingParty(party)
    setValue('name', party.name)
    setValue('phone', party.phone || '')
    setValue('email', party.email || '')
    setValue('address', party.address || '')
    setValue('type', party.type as any)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingParty(null)
    reset()
  }

  const onSubmit = async (data: PartyInput) => {
    try {
      if (editingParty) {
        await patchData(`/api/parties/${editingParty.id}`, data)
      } else {
        await postData('/api/parties', data)
      }
      closeForm()
      refetch()
    } catch (error) {
      alert(`Failed to ${editingParty ? 'update' : 'add'} party: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }
    try {
      await deleteData(`/api/parties/${id}`)
      refetch()
    } catch (error) {
      alert(`Failed to delete party: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const filteredParties = filter ? parties?.filter(p => p.type === filter) : parties

  return (
    <div className="text-gray-900">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Parties</h1>
        <Button onClick={() => { setEditingParty(null); setShowForm(true) }} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Add Party
        </Button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <Button variant={filter === '' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('')} className="whitespace-nowrap">All</Button>
        <Button variant={filter === 'SELLER' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('SELLER')} className="whitespace-nowrap">Sellers</Button>
        <Button variant={filter === 'BUYER' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('BUYER')} className="whitespace-nowrap">Buyers</Button>
        <Button variant={filter === 'BROKER' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('BROKER')} className="whitespace-nowrap">Brokers</Button>
        <Button variant={filter === 'DEALERSHIP' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('DEALERSHIP')} className="whitespace-nowrap">Dealerships</Button>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredParties?.map(party => (
                  <tr key={party.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{party.name}</td>
                    <td className="px-6 py-4 text-gray-500">{party.phone || '-'}</td>
                    <td className="px-6 py-4 text-gray-500">{party.email || '-'}</td>
                    <td className="px-6 py-4">
                      <Badge variant={typeVariants[party.type]}>{party.type}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openEditForm(party)}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDelete(party.id, party.name)}
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="md:hidden space-y-3">
            {filteredParties?.map(party => (
              <div key={party.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-gray-900">{party.name}</div>
                  <Badge variant={typeVariants[party.type]}>{party.type}</Badge>
                </div>
                <div className="text-sm text-gray-500 space-y-1 mb-3">
                  <div>Phone: {party.phone || '-'}</div>
                  <div>Email: {party.email || '-'}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEditForm(party)}
                    className="flex-1"
                  >
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDelete(party.id, party.name)}
                    className="flex-1"
                  >
                    <Trash2 className="w-3 h-3 mr-1 text-red-600" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal isOpen={showForm} onClose={closeForm} title={editingParty ? 'Edit Party' : 'Add Party'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" {...register('name')} error={errors.name?.message} />
          <Input label="Phone" {...register('phone')} />
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Address" {...register('address')} />
          <Select
            label="Type"
            {...register('type', { required: 'Type is required' })}
            error={errors.type?.message}
            options={[
              { value: 'SELLER', label: 'Seller' },
              { value: 'BUYER', label: 'Buyer' },
              { value: 'BROKER', label: 'Broker' },
              { value: 'DEALERSHIP', label: 'Dealership' },
            ]}
            required
          />
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={closeForm} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? 'Saving...' : (editingParty ? 'Update Party' : 'Add Party')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
