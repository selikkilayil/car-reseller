# Car Booking Feature

## Overview
The booking feature allows you to accept advance payments (booking amounts) from buyers before completing the final sale. This is useful when a buyer wants to reserve a car but isn't ready to complete the full purchase immediately.

## How It Works

### 1. Booking a Car
- Car must be in **READY_FOR_SALE** status
- Click "Book Car" button on the car detail page
- Enter:
  - Booking amount (advance payment)
  - Buyer (from parties list)
  - Payment method (Bank or Cash)
  - Bank account (if Bank payment selected)
- The booking amount is immediately recorded as a transaction
- Car status changes to **BOOKED**

### 2. Booked Car Status
When a car is booked:
- Shows "BOOKED" status badge
- Displays booking details in the Sale tab:
  - Booking amount received
  - Buyer name
  - Booking date
- Two action buttons available:
  - **Complete Sale**: Finalize the sale
  - **Cancel Booking**: Cancel and refund booking

### 3. Completing Sale for Booked Car
When recording a sale for a booked car:
- System shows booking amount already received
- Calculates remaining amount to collect
- Transaction records only the remaining amount
- Total sale price includes booking amount
- Car status changes to **SOLD**

### 4. Canceling a Booking
- Click "Cancel Booking" button
- Booking amount is NOT automatically refunded (manual refund needed)
- Car status returns to **READY_FOR_SALE**
- Booking details are cleared

## Database Changes

### New Fields in Car Model
```prisma
isBooked        Boolean   @default(false)
bookingAmount   Float?
bookingDate     DateTime?
bookingPartyId  String?
bookingParty    Party?    @relation("BookingParty", fields: [bookingPartyId], references: [id])
```

### New Status
- **BOOKED**: Car has received booking amount and is reserved for a buyer

## API Endpoints

### POST /api/cars/[id]/booking
Book a car with advance payment.

**Request Body:**
```json
{
  "bookingAmount": 50000,
  "bookingPartyId": "party-id",
  "paymentMethod": "BANK",
  "bankAccountId": "bank-id"
}
```

**Response:**
```json
{
  "id": "car-id",
  "status": "BOOKED",
  "isBooked": true,
  "bookingAmount": 50000,
  "bookingDate": "2024-12-02T...",
  "bookingPartyId": "party-id"
}
```

### DELETE /api/cars/[id]/booking
Cancel a booking.

**Response:**
```json
{
  "id": "car-id",
  "status": "READY_FOR_SALE",
  "isBooked": false,
  "bookingAmount": null,
  "bookingDate": null,
  "bookingPartyId": null
}
```

## UI Components

### New Components
- **BookingForm**: Form to book a car with advance payment
  - Located at: `src/components/forms/BookingForm.tsx`

### Updated Components
- **CarDetail**: Added booking actions and display
  - Book Car button (READY_FOR_SALE status)
  - Complete Sale button (BOOKED status)
  - Cancel Booking button (BOOKED status)
  - Booking details display in Sale tab

- **SaleForm**: Shows booking information
  - Displays booking amount received
  - Calculates remaining amount to collect
  - Updated payment recording logic

- **Cars List**: Added BOOKED filter and status badge

## Example Workflow

1. **Car is ready for sale**
   - Status: READY_FOR_SALE
   - Net Rate: ₹5,00,000

2. **Buyer books the car**
   - Booking amount: ₹50,000 (paid via Bank)
   - Status changes to: BOOKED
   - Transaction recorded: +₹50,000 to bank account

3. **Complete the sale**
   - Sale price: ₹5,50,000
   - Booking amount: ₹50,000 (already received)
   - Remaining to collect: ₹5,00,000
   - Transaction recorded: +₹5,00,000 (remaining amount)
   - Total received: ₹5,50,000
   - Status changes to: SOLD

## Benefits

1. **Cash Flow**: Receive advance payments to improve cash flow
2. **Commitment**: Booking amount ensures buyer commitment
3. **Tracking**: Clear visibility of booked vs available cars
4. **Accounting**: Proper transaction recording for all payments
5. **Flexibility**: Can cancel bookings if needed

## Notes

- Booking is optional - you can still directly sell without booking
- Booking amount is part of the total sale price
- When completing sale, only remaining amount is collected
- All transactions are properly recorded in the system
- Booking details are visible in the Sale tab
