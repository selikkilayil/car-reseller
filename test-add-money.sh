#!/bin/bash

# Test script for adding money to bank accounts

echo "Testing Add Money to Bank Account API"
echo "======================================"

# First, get the list of bank accounts
echo -e "\n1. Getting bank accounts..."
ACCOUNTS=$(curl -s http://localhost:3000/api/bank-accounts)
echo "$ACCOUNTS" | jq '.'

# Extract the first bank account ID
BANK_ID=$(echo "$ACCOUNTS" | jq -r '.[0].id')
echo -e "\nUsing bank account ID: $BANK_ID"

# Get current balance
CURRENT_BALANCE=$(echo "$ACCOUNTS" | jq -r '.[0].balance')
echo "Current balance: $CURRENT_BALANCE"

# Add money to the bank account
echo -e "\n2. Adding 5000 to bank account..."
ADD_RESPONSE=$(curl -s -X POST http://localhost:3000/api/bank-accounts/$BANK_ID/add-money \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "description": "Test deposit - adding funds"
  }')

echo "$ADD_RESPONSE" | jq '.'

# Verify the new balance
echo -e "\n3. Verifying new balance..."
NEW_ACCOUNTS=$(curl -s http://localhost:3000/api/bank-accounts)
NEW_BALANCE=$(echo "$NEW_ACCOUNTS" | jq -r '.[0].balance')
echo "New balance: $NEW_BALANCE"

echo -e "\n✅ Test complete!"
