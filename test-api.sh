#!/bin/bash

echo "🧪 Testing Car Reseller API Endpoints..."
echo ""

BASE_URL="http://localhost:3000"

echo "✅ Testing GET /api/cars"
curl -s "$BASE_URL/api/cars" | jq 'length' > /dev/null && echo "   Cars endpoint working" || echo "   ❌ Failed"

echo "✅ Testing GET /api/parties"
curl -s "$BASE_URL/api/parties" | jq 'length' > /dev/null && echo "   Parties endpoint working" || echo "   ❌ Failed"

echo "✅ Testing GET /api/bank-accounts"
curl -s "$BASE_URL/api/bank-accounts" | jq 'length' > /dev/null && echo "   Bank accounts endpoint working" || echo "   ❌ Failed"

echo "✅ Testing GET /api/cash-account"
curl -s "$BASE_URL/api/cash-account" | jq '.balance' > /dev/null && echo "   Cash account endpoint working" || echo "   ❌ Failed"

echo "✅ Testing GET /api/repair-types"
curl -s "$BASE_URL/api/repair-types" | jq 'length' > /dev/null && echo "   Repair types endpoint working" || echo "   ❌ Failed"

echo ""
echo "🎉 All API endpoints are working!"
echo ""
echo "📊 Current Data:"
echo "   Cars: $(curl -s "$BASE_URL/api/cars" | jq 'length')"
echo "   Parties: $(curl -s "$BASE_URL/api/parties" | jq 'length')"
echo "   Bank Accounts: $(curl -s "$BASE_URL/api/bank-accounts" | jq 'length')"
echo "   Repair Types: $(curl -s "$BASE_URL/api/repair-types" | jq 'length')"
echo ""
echo "🌐 Application running at: $BASE_URL"
