# Edit Features - Quick Guide

## 🚗 Car Editing

### Where to Find It
- Go to any car detail page
- Look at the top header next to the car name

### Available Actions
- **✏️ Edit Button** (Pencil icon) - Opens edit form
- **🗑️ Delete Button** (Trash icon) - Deletes the car

### What You Can Edit
- Basic info: Make, Model, Year, Color, VIN, Registration, Mileage
- Purchase details: Date, Price, Seller, Source, Broker
- Loan information: Loan amount, amount paid, loan details
- Net rate: Base selling price (if ready for sale)

### What Happens When You Delete
- ⚠️ Car is permanently deleted
- All repairs are deleted
- All expenses are deleted
- All transactions are deleted
- You're redirected to the cars list

---

## 💰 Expense Editing

### Where to Find It
- Go to any car detail page
- Navigate to Purchase, Repairs, or Sale tab
- Each expense has two small icons on the right

### Available Actions
- **✏️ Edit Button** (Pencil icon) - Opens edit form
- **🗑️ Delete Button** (Trash icon) - Deletes and refunds

### What You Can Edit
- Expense type (Travel, Fuel, Brokerage, Delivery, Other)
- Description
- Amount (⚠️ automatically adjusts account balance)

### What Happens When You Edit Amount

**Example 1: Increase Amount**
- Original: $500
- New: $600
- Result: Account balance decreases by $100

**Example 2: Decrease Amount**
- Original: $500
- New: $400
- Result: Account balance increases by $100

### What Happens When You Delete
- ⚠️ Expense is permanently deleted
- Full amount is refunded to the original account
- Example: Delete $500 expense → Account gets +$500

---

## 🔧 Repair Editing

### Where to Find It
- Go to any car detail page
- Navigate to the Repairs tab
- Each repair has two small icons on the right

### Available Actions
- **✏️ Edit Button** (Pencil icon) - Opens edit form
- **🗑️ Delete Button** (Trash icon) - Deletes and refunds

### What You Can Edit
- Repair type (Bodywork, Electric, Painting, Spares, etc.)
- Description
- Vendor name
- Cost (⚠️ automatically adjusts account balance)

### What Happens When You Edit Cost

**Example 1: Increase Cost**
- Original: $5000
- New: $5500
- Result: Account balance decreases by $500

**Example 2: Decrease Cost**
- Original: $5000
- New: $4500
- Result: Account balance increases by $500

### What Happens When You Delete
- ⚠️ Repair is permanently deleted
- Full cost is refunded to the original account
- Example: Delete $5000 repair → Account gets +$5000

---

## 🎯 Quick Tips

### Before Editing
- ✅ Make sure you have the correct information
- ✅ Check which account was used (bank or cash)
- ✅ Understand that amount changes affect account balances

### Before Deleting
- ⚠️ Deletions cannot be undone
- ⚠️ Deleting a car removes ALL related data
- ⚠️ Deleting an expense refunds the money
- ✅ Always confirm you're deleting the right item

### Best Practices
- Edit expenses to fix mistakes in amount or description
- Edit repairs to fix mistakes in cost or vendor information
- Delete expenses/repairs only if they were entered by mistake
- Edit car details to keep information up to date
- Delete cars only if they were entered by mistake

---

## 🔒 What You Cannot Change

### For Cars
- ❌ Status (use status buttons instead)
- ❌ Related repairs/expenses (edit them individually)

### For Expenses
- ❌ Payment method (bank/cash)
- ❌ Category (PURCHASE/REPAIR/SALE)
- ❌ Which car it belongs to

### For Repairs
- ❌ Payment method (bank/cash)
- ❌ Which car it belongs to

---

## 📱 Mobile Support

All edit features work on mobile devices:
- Buttons are touch-friendly
- Forms are responsive
- Confirmations work on all devices

---

## 🆘 Troubleshooting

**"Failed to update"**
- Check your internet connection
- Make sure all required fields are filled
- Verify amounts are positive numbers

**"Failed to delete"**
- Check your internet connection
- Try refreshing the page
- Make sure the item still exists

**Account balance seems wrong**
- Check the transactions tab
- Verify all expenses are correct
- Look for duplicate entries

---

## 🎨 Visual Guide

### Car Detail Header
```
[Car Name]                    [✏️] [🗑️] [Status Badge]
```

### Expense List Item
```
Travel: Trip to seller    $500    [✏️] [🗑️]
```

### Repair List Item
```
BODYWORK                  $5000   [✏️] [🗑️]
Complete body repair
Vendor: Auto Body Shop
```

### Edit Modal
```
┌─────────────────────────┐
│ Edit Expense            │
├─────────────────────────┤
│ Type: [Dropdown]        │
│ Description: [Input]    │
│ Amount: [Input]         │
│                         │
│ [Cancel] [Update]       │
└─────────────────────────┘
```
