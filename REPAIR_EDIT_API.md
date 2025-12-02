# Repair Edit API Documentation

## Overview
The repair edit functionality allows you to update or delete repair records. When editing costs, account balances are automatically adjusted. When deleting, the repair cost is refunded to the original account.

## API Endpoints

### 1. Get Single Repair
```
GET /api/repairs/[id]
```
Retrieves detailed information about a specific repair.

**Response:**
```json
{
  "id": "repair_id",
  "carId": "car_id",
  "repairTypeId": "type_id",
  "description": "Engine repair",
  "cost": 5000,
  "vendorName": "Auto Shop",
  "repairType": {...},
  "transactions": [...],
  "car": {...}
}
```

### 2. Update Repair
```
PUT /api/repairs/[id]
```
Updates repair details. All fields are optional - only send the fields you want to update.

**Request Body:**
```json
{
  "repairTypeId": "type_id",
  "description": "Updated description",
  "vendorName": "New Auto Shop",
  "cost": 5500
}
```

**Important Notes:**
- When the cost is changed, the system automatically:
  - Updates the related transaction amount
  - Adjusts the account balance (bank or cash) by the difference
  - Example: If repair was 5000 and you change it to 5500, the account balance decreases by 500

**Response:**
Returns the updated repair object with all relations included.

### 3. Delete Repair
```
DELETE /api/repairs/[id]
```
Deletes a repair and refunds the cost to the original account.

**Important Notes:**
- The repair cost is automatically refunded to the account (bank or cash)
- Related transactions are also deleted (cascade)
- This action cannot be undone

**Response:**
```json
{
  "message": "Repair deleted successfully"
}
```

## Editable Fields

- `repairTypeId` - Type of repair (BODYWORK, ELECTRIC, PAINTING, SPARES, etc.)
- `description` - Optional description
- `vendorName` - Name of the repair shop/vendor
- `cost` - Repair cost (automatically adjusts account balance)

## Frontend Implementation

### Edit Button
Each repair in the car detail page has a pencil icon button. Clicking it opens a modal with the edit form.

### Delete Button
Each repair has a trash icon button that:
- Shows a confirmation dialog
- Refunds the cost to the original account
- Removes the repair from the list

### Edit Form
The edit form (`EditRepairForm`) allows updating:
- Repair type
- Description
- Vendor name
- Cost (with automatic balance adjustment)

### Components
- `EditRepairForm` - Form component for editing repair details
- `CarDetail` - Updated to include edit and delete buttons for each repair
- API routes at `/api/repairs/[id]` - Handle GET, PUT, DELETE operations

## Usage Examples

### Update repair description and cost
```bash
curl -X PUT http://localhost:3000/api/repairs/rep_123 \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Complete engine overhaul",
    "cost": 6000
  }'
```

### Update only the vendor
```bash
curl -X PUT http://localhost:3000/api/repairs/rep_123 \
  -H "Content-Type: application/json" \
  -d '{
    "vendorName": "Premium Auto Service"
  }'
```

### Get repair details
```bash
curl http://localhost:3000/api/repairs/rep_123
```

### Delete repair
```bash
curl -X DELETE http://localhost:3000/api/repairs/rep_123
```

## How to Use (Frontend)

### Edit a Repair
1. Navigate to any car detail page
2. Go to the Repairs tab
3. Find the repair in the list
4. Click the pencil icon
5. Update the fields you want to change
6. Click "Update Repair"

### Delete a Repair
1. Navigate to any car detail page
2. Go to the Repairs tab
3. Find the repair in the list
4. Click the trash icon
5. Confirm the deletion
6. The cost will be refunded to the account automatically

## Important Notes

- ✅ Changing the cost automatically adjusts account balances
- ✅ Deleting a repair refunds the cost to the original account
- ✅ All changes are validated
- ✅ Confirmation required for deletion
- ✅ Real-time UI updates after edit/delete
- ⚠️ You cannot change the payment method (bank/cash) after creation
- ⚠️ You cannot change which car the repair belongs to
- ⚠️ Deletion cannot be undone

## Financial Impact

### When Editing Cost
- **Increase**: Account balance decreases by the difference
- **Decrease**: Account balance increases by the difference
- Example: Change from $5000 to $5500 → Account balance -$500
- Example: Change from $5000 to $4500 → Account balance +$500

### When Deleting
- Full cost is refunded to the original account
- Example: Delete $5000 repair → Account balance +$5000

## Repair Types

Common repair types include:
- BODYWORK - Body and frame repairs
- ELECTRIC - Electrical system repairs
- PAINTING - Paint and finish work
- SPARES - Parts replacement
- ENGINE - Engine repairs
- TRANSMISSION - Transmission work
- SUSPENSION - Suspension repairs
- BRAKES - Brake system repairs
- OTHER - Other repairs

You can manage repair types from the Repair Types page.
