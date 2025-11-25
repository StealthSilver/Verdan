#!/bin/bash

echo "🔍 Testing Backend Connectivity and CORS"
echo "========================================"

BACKEND_URL="http://13.61.104.179:8000"
FRONTEND_URL="https://verdan-beige.vercel.app"

echo "🌐 Backend URL: $BACKEND_URL"
echo "🖥️  Frontend URL: $FRONTEND_URL"
echo ""

# Test basic connectivity
echo "1. Testing basic connectivity..."
curl -s -I "$BACKEND_URL/" | head -1

# Test CORS headers
echo ""
echo "2. Testing CORS headers..."
curl -s -I -H "Origin: $FRONTEND_URL" "$BACKEND_URL/" | grep -i "access-control"

# Test CORS preflight
echo ""
echo "3. Testing CORS preflight..."
curl -s -I -X OPTIONS \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  "$BACKEND_URL/auth/signin" | head -1

# Test actual endpoint
echo ""
echo "4. Testing CORS test endpoint..."
curl -s -H "Origin: $FRONTEND_URL" "$BACKEND_URL/cors-test" | jq .message 2>/dev/null || curl -s -H "Origin: $FRONTEND_URL" "$BACKEND_URL/cors-test"

echo ""
echo "✅ Tests completed!"