#!/bin/bash

# Test script for adding money directly to cash

echo "Testing Add Money to Cash API"
echo "======================================"

# Get current cash balance
echo -e "\n1. Getting current cash balance..."
CASH=$(curl -s http://localhost:3000/api/cash-account)
echo "$CASH" | jq '.'

CURRENT_BALANCE=$(echo "$CASH" | jq -r '.balance')
echo "Current cash balance: $CURRENT_BALANCE"

# Add money to cash
echo -e "\n2. Adding 3000 to cash..."
ADD_RESPONSE=$(curl -s -X POST http://localhost:3000/api/cash-account/add-money \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 3000,
    "description": "Test cash income - direct deposit"
  }')

echo "$ADD_RESPONSE" | jq '.'

# Verify the new balance
echo -e "\n3. Verifying new cash balance..."
NEW_CASH=$(curl -s http://localhost:3000/api/cash-account)
NEW_BALANCE=$(echo "$NEW_CASH" | jq -r '.balance')
echo "New cash balance: $NEW_BALANCE"

echo -e "\n✅ Test complete!"
