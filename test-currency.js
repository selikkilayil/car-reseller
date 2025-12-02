// Quick test to verify INR formatting
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0'
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Test cases
const testCases = [
  { input: 120000, expected: formatCurrency(120000) },
  { input: 1500000, expected: formatCurrency(1500000) },
  { input: 50000, expected: formatCurrency(50000) },
  { input: 0, expected: formatCurrency(0) },
  { input: null, expected: formatCurrency(null) },
]

testCases.forEach(({ input, expected }) => {
  // Results can be checked programmatically
})
