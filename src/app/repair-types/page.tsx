'use client'
import { useState } from 'react'
import { useFetch, postData, patchData, deleteData } from '@/hooks/useData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Plus, Wrench, Pencil, Trash2 } from 'lucide-react'

interface RepairType {
  id: string
  name: string
  description?: string
}

export default function RepairTypesPage() {
  const { data: types, loading, refetch } = useFetch<RepairType[]>('/api/repair-types')
  const [showForm, setShowForm] = useState(false)
  const [editingType, setEditingType] = useState<RepairType | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const openEditForm = (type: RepairType) => {
    setEditingType(type)
    setName(type.name)
    setDescription(type.description || '')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingType(null)
    setName('')
    setDescription('')
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingType) {
        await patchData(`/api/repair-types/${editingType.id}`, { name, description })
      } else {
        await postData('/api/repair-types', { name, description })
      }
      closeForm()
      refetch()
    } catch (error) {
      alert(`Failed to ${editingType ? 'update' : 'add'} repair type: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }
    try {
      await deleteData(`/api/repair-types/${id}`)
      refetch()
    } catch (error) {
      alert(`Failed to delete repair type: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="text-gray-900">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Repair Types</h1>
        <Button onClick={() => { setEditingType(null); setShowForm(true) }} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Add Type
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-900">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {types?.map(type => (
            <div key={type.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-5 h-5 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm sm:text-base truncate">{type.name}</h3>
                  {type.description && <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{type.description}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openEditForm(type)}
                  className="flex-1"
                >
                  <Pencil className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDelete(type.id, type.name)}
                  className="flex-1"
                >
                  <Trash2 className="w-3 h-3 mr-1 text-red-600" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={closeForm} title={editingType ? 'Edit Repair Type' : 'Add Repair Type'}>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={closeForm} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" className="w-full sm:w-auto">
              {editingType ? 'Update Type' : 'Add Type'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
