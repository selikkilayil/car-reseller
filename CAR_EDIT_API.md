# Car Edit API Documentation

## Overview
The car edit functionality allows you to update car details after purchase. This is useful for correcting information or updating details as they change.

## API Endpoints

### 1. Get Single Car
```
GET /api/cars/[id]
```
Retrieves detailed information about a specific car.

**Response:**
```json
{
  "id": "car_id",
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "color": "Blue",
  "mileage": 50000,
  ...
}
```

### 2. Update Car
```
PUT /api/cars/[id]
```
Updates car details. All fields are optional - only send the fields you want to update.

**Request Body:**
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "vin": "1HGBH41JXMN109186",
  "registrationNo": "ABC-123",
  "color": "Blue",
  "mileage": 50000,
  "purchaseDate": "2024-01-15",
  "purchasePrice": 15000,
  "purchasePartyId": "party_id",
  "purchaseSource": "DIRECT_USER",
  "purchaseBrokerId": "broker_id",
  "brokerageAmount": 500,
  "isInLoan": false,
  "loanAmount": 0,
  "loanDetails": "",
  "amountPaidToSeller": 15000,
  "netRate": 18000
}
```

**Response:**
Returns the updated car object with all relations included.

### 3. Delete Car
```
DELETE /api/cars/[id]
```
Deletes a car and all related records (repairs, expenses, transactions).

**Response:**
```json
{
  "message": "Car deleted successfully"
}
```

## Editable Fields

### Basic Information
- `make` - Car manufacturer
- `model` - Car model
- `year` - Manufacturing year
- `vin` - Vehicle Identification Number
- `registrationNo` - Registration/license plate number
- `color` - Car color
- `mileage` - Current mileage

### Purchase Details
- `purchaseDate` - Date of purchase (ISO string)
- `purchasePrice` - Purchase price
- `purchasePartyId` - Seller party ID
- `purchaseSource` - Either "DIRECT_USER" or "DEALERSHIP"
- `purchaseBrokerId` - Broker party ID (optional)
- `brokerageAmount` - Brokerage fee (optional)

### Loan Information
- `isInLoan` - Whether car has a loan
- `loanAmount` - Loan amount
- `loanDetails` - Additional loan details
- `amountPaidToSeller` - Actual amount paid to seller

### Sale Information
- `netRate` - Base selling rate (set when ready for sale)

## Usage Examples

### Update car color and mileage
```bash
curl -X PUT http://localhost:3000/api/cars/car_123 \
  -H "Content-Type: application/json" \
  -d '{
    "color": "Red",
    "mileage": 55000
  }'
```

### Update purchase details
```bash
curl -X PUT http://localhost:3000/api/cars/car_123 \
  -H "Content-Type: application/json" \
  -d '{
    "purchasePrice": 16000,
    "amountPaidToSeller": 14000,
    "isInLoan": true,
    "loanAmount": 2000
  }'
```

### Get car details
```bash
curl http://localhost:3000/api/cars/car_123
```

### Delete car
```bash
curl -X DELETE http://localhost:3000/api/cars/car_123
```

## Testing

Run the test script to verify the edit functionality:
```bash
./test-car-edit.sh
```

Make sure your development server is running first:
```bash
npm run dev
```

## Notes

- Only fields provided in the request will be updated
- All validations from the purchase schema apply
- Deleting a car will cascade delete all related records (repairs, expenses, transactions)
- The car status cannot be changed through this endpoint (use specific status endpoints)
- Financial transactions are not automatically adjusted when updating prices
