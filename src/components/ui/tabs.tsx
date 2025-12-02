'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

interface TabsContextType {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextType | null>(null)

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: ReactNode
  className?: string
}

export function Tabs({ defaultValue, value, onValueChange, children, className = '' }: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultValue || '')
  
  const activeTab = value !== undefined ? value : internalActiveTab
  const setActiveTab = (tab: string) => {
    if (onValueChange) {
      onValueChange(tab)
    } else {
      setInternalActiveTab(tab)
    }
  }
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex border-b border-gray-200 mb-2 ${className}`}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children, className = '' }: { value: string; children: ReactNode; className?: string }) {
  const ctx = useContext(TabsContext)
  if (!ctx) return null
  
  const isActive = ctx.activeTab === value
  
  return (
    <button
      onClick={() => ctx.setActiveTab(value)}
      className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
        isActive
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      } ${className}`}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useContext(TabsContext)
  if (!ctx || ctx.activeTab !== value) return null
  
  return <div className="py-4">{children}</div>
}
