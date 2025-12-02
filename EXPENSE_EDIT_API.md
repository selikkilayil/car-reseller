# Expense Edit API Documentation

## Overview
The expense edit functionality allows you to update or delete expense records. When editing amounts, account balances are automatically adjusted. When deleting, the expense amount is refunded to the original account.

## API Endpoints

### 1. Get Single Expense
```
GET /api/expenses/[id]
```
Retrieves detailed information about a specific expense.

**Response:**
```json
{
  "id": "expense_id",
  "carId": "car_id",
  "category": "PURCHASE",
  "type": "TRAVEL",
  "description": "Trip to seller location",
  "amount": 500,
  "transactions": [...],
  "car": {...}
}
```

### 2. Update Expense
```
PUT /api/expenses/[id]
```
Updates expense details. All fields are optional - only send the fields you want to update.

**Request Body:**
```json
{
  "type": "TRAVEL",
  "description": "Updated description",
  "amount": 600
}
```

**Important Notes:**
- When the amount is changed, the system automatically:
  - Updates the related transaction amount
  - Adjusts the account balance (bank or cash) by the difference
  - Example: If expense was 500 and you change it to 600, the account balance decreases by 100

**Response:**
Returns the updated expense object with all relations included.

### 3. Delete Expense
```
DELETE /api/expenses/[id]
```
Deletes an expense and refunds the amount to the original account.

**Important Notes:**
- The expense amount is automatically refunded to the account (bank or cash)
- Related transactions are also deleted (cascade)
- This action cannot be undone

**Response:**
```json
{
  "message": "Expense deleted successfully"
}
```

## Editable Fields

- `type` - Expense type (TRAVEL, FUEL, BROKERAGE, DELIVERY, OTHER)
- `description` - Optional description
- `amount` - Expense amount (automatically adjusts account balance)

## Frontend Implementation

### Edit Button
Each expense in the car detail page has a pencil icon button. Clicking it opens a modal with the edit form.

### Delete Button
Each expense has a trash icon button that:
- Shows a confirmation dialog
- Refunds the amount to the original account
- Removes the expense from the list

### Edit Form
The edit form (`EditExpenseForm`) allows updating:
- Expense type
- Description
- Amount (with automatic balance adjustment)

### Components
- `EditExpenseForm` - Form component for editing expense details
- `CarDetail` - Updated to include edit and delete buttons for each expense
- API routes at `/api/expenses/[id]` - Handle GET, PUT, DELETE operations

## Usage Examples

### Update expense description and amount
```bash
curl -X PUT http://localhost:3000/api/expenses/exp_123 \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated travel expense",
    "amount": 750
  }'
```

### Update only the type
```bash
curl -X PUT http://localhost:3000/api/expenses/exp_123 \
  -H "Content-Type: application/json" \
  -d '{
    "type": "FUEL"
  }'
```

### Get expense details
```bash
curl http://localhost:3000/api/expenses/exp_123
```

### Delete expense
```bash
curl -X DELETE http://localhost:3000/api/expenses/exp_123
```

## How to Use (Frontend)

### Edit an Expense
1. Navigate to any car detail page
2. Go to the Purchase, Repairs, or Sale tab (depending on expense category)
3. Find the expense in the list
4. Click the pencil icon
5. Update the fields you want to change
6. Click "Update Expense"

### Delete an Expense
1. Navigate to any car detail page
2. Find the expense in the appropriate tab
3. Click the trash icon
4. Confirm the deletion
5. The amount will be refunded to the account automatically

## Important Notes

- ✅ Changing the amount automatically adjusts account balances
- ✅ Deleting an expense refunds the amount to the original account
- ✅ All changes are validated
- ✅ Confirmation required for deletion
- ✅ Real-time UI updates after edit/delete
- ⚠️ You cannot change the payment method (bank/cash) after creation
- ⚠️ You cannot change the expense category (PURCHASE/REPAIR/SALE)
- ⚠️ Deletion cannot be undone

## Financial Impact

### When Editing Amount
- **Increase**: Account balance decreases by the difference
- **Decrease**: Account balance increases by the difference
- Example: Change from $500 to $600 → Account balance -$100
- Example: Change from $500 to $400 → Account balance +$100

### When Deleting
- Full amount is refunded to the original account
- Example: Delete $500 expense → Account balance +$500
