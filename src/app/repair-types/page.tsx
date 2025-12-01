'use client'
import { useState } from 'react'
import { useFetch, postData } from '@/hooks/useData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Plus, Wrench } from 'lucide-react'

interface RepairType {
  id: string
  name: string
  description?: string
}

export default function RepairTypesPage() {
  const { data: types, loading, refetch } = useFetch<RepairType[]>('/api/repair-types')
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await postData('/api/repair-types', { name, description })
    setName('')
    setDescription('')
    setShowForm(false)
    refetch()
  }

  return (
    <div className="text-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Repair Types</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Type
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-900">Loading...</div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {types?.map(type => (
            <div key={type.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{type.name}</h3>
                  {type.description && <p className="text-sm text-gray-500">{type.description}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Repair Type">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit">Add Type</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
