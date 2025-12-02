#!/bin/bash

# Test script for car edit functionality
BASE_URL="http://localhost:3000"

echo "=== Testing Car Edit API ==="
echo ""

# First, get all cars to find an ID to edit
echo "1. Getting all cars..."
CARS_RESPONSE=$(curl -s "$BASE_URL/api/cars")
echo "Response: $CARS_RESPONSE"
echo ""

# Extract first car ID (requires jq)
if command -v jq &> /dev/null; then
    CAR_ID=$(echo $CARS_RESPONSE | jq -r '.[0].id')
    echo "Found car ID: $CAR_ID"
    echo ""
    
    # Get specific car details
    echo "2. Getting car details..."
    curl -s "$BASE_URL/api/cars/$CAR_ID" | jq '.'
    echo ""
    
    # Update car details
    echo "3. Updating car details..."
    UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/cars/$CAR_ID" \
      -H "Content-Type: application/json" \
      -d '{
        "color": "Updated Blue",
        "mileage": 55000,
        "registrationNo": "ABC-123-UPDATED"
      }')
    echo "Update response:"
    echo $UPDATE_RESPONSE | jq '.'
    echo ""
    
    # Verify the update
    echo "4. Verifying update..."
    curl -s "$BASE_URL/api/cars/$CAR_ID" | jq '.color, .mileage, .registrationNo'
    echo ""
else
    echo "jq not installed. Install it to parse JSON responses."
    echo "You can manually test with:"
    echo "  GET:    curl $BASE_URL/api/cars"
    echo "  GET:    curl $BASE_URL/api/cars/{id}"
    echo "  PUT:    curl -X PUT $BASE_URL/api/cars/{id} -H 'Content-Type: application/json' -d '{\"color\":\"Blue\"}'"
    echo "  DELETE: curl -X DELETE $BASE_URL/api/cars/{id}"
fi

echo ""
echo "=== Test Complete ==="
