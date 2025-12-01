// Quick test to verify INR formatting
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0'
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

console.log('Testing INR Currency Formatting:')
console.log('120000 =>', formatCurrency(120000))
console.log('1500000 =>', formatCurrency(1500000))
console.log('50000 =>', formatCurrency(50000))
console.log('0 =>', formatCurrency(0))
console.log('null =>', formatCurrency(null))
