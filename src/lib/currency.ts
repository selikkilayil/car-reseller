export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '₹0'
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatAmount(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '0'
  
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount)
}
