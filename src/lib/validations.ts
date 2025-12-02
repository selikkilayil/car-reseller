import { z } from 'zod'

export const bankAccountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  accountNo: z.string().min(1, 'Account number is required'),
  balance: z.number().default(0),
})

export const partySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  type: z.enum(['SELLER', 'BUYER', 'BROKER', 'DEALERSHIP']),
})

export const carPurchaseSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  vin: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  registrationNo: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  color: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  mileage: z.coerce.number().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  purchaseDate: z.string(),
  purchasePrice: z.coerce.number().min(0, 'Price must be positive'),
  purchasePartyId: z.string().min(1, 'Seller is required'),
  purchaseSource: z.enum(['DIRECT_USER', 'DEALERSHIP']),
  purchaseBrokerId: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  brokerageAmount: z.coerce.number().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  isInLoan: z.boolean().default(false),
  loanAmount: z.coerce.number().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  loanDetails: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  amountPaidToSeller: z.coerce.number().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  // Payment info
  paymentMethod: z.enum(['BANK', 'CASH', 'MIXED']),
  bankAccountId: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  bankAmount: z.coerce.number().optional().or(z.literal('')).transform(val => val || undefined),
  cashAmount: z.coerce.number().optional().or(z.literal('')).transform(val => val || undefined),
})

export const repairSchema = z.object({
  carId: z.string().min(1),
  repairTypeId: z.string().min(1, 'Repair type is required'),
  description: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  cost: z.coerce.number().min(0),
  vendorName: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  paymentMethod: z.enum(['BANK', 'CASH']),
  bankAccountId: z.string().optional().or(z.literal('')).transform(val => val || undefined),
})

export const expenseSchema = z.object({
  carId: z.string().min(1),
  category: z.enum(['PURCHASE', 'REPAIR', 'SALE']),
  type: z.enum(['TRAVEL', 'FUEL', 'BROKERAGE', 'DELIVERY', 'OTHER']),
  description: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  amount: z.coerce.number().min(0),
  paymentMethod: z.enum(['BANK', 'CASH']),
  bankAccountId: z.string().optional().or(z.literal('')).transform(val => val || undefined),
})

export const saleSchema = z.object({
  carId: z.string().min(1),
  salePrice: z.coerce.number().min(0, 'Sale price is required'),
  salePartyId: z.string().min(1, 'Buyer is required'),
  saleBrokerId: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  saleBrokerage: z.coerce.number().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  saleType: z.enum(['CASH', 'LOAN']),
  paymentMethod: z.enum(['BANK', 'CASH', 'MIXED']),
  bankAccountId: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  bankAmount: z.coerce.number().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  cashAmount: z.coerce.number().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
})

export type BankAccountInput = z.infer<typeof bankAccountSchema>
export type PartyInput = z.infer<typeof partySchema>
export type CarPurchaseInput = z.infer<typeof carPurchaseSchema>
export type RepairInput = z.infer<typeof repairSchema>
export type ExpenseInput = z.infer<typeof expenseSchema>
export type SaleInput = z.infer<typeof saleSchema>

export const carEditSchema = z.object({
  make: z.string().min(1, 'Make is required').optional(),
  model: z.string().min(1, 'Model is required').optional(),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1).optional(),
  vin: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  registrationNo: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  color: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  mileage: z.coerce.number().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  purchaseDate: z.string().optional(),
  purchasePrice: z.coerce.number().min(0, 'Price must be positive').optional(),
  purchasePartyId: z.string().min(1, 'Seller is required').optional(),
  purchaseSource: z.enum(['DIRECT_USER', 'DEALERSHIP']).optional(),
  purchaseBrokerId: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  brokerageAmount: z.coerce.number().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  isInLoan: z.boolean().optional(),
  loanAmount: z.coerce.number().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  loanDetails: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  amountPaidToSeller: z.coerce.number().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  netRate: z.coerce.number().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
})

export type CarEditInput = z.infer<typeof carEditSchema>
