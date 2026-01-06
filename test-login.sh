#!/bin/bash

# Test Login Script
# This script helps diagnose login issues by testing the login endpoint directly

echo "🔍 Testing Login Endpoint"
echo "=========================="
echo ""

# Configuration
API_URL="${API_URL:-http://localhost:8001}"
EMAIL="${EMAIL:-ogcnewfinity@gmail.com}"
PASSWORD="${PASSWORD:-FiniTy-2026-Data.CoM}"

echo "API URL: $API_URL"
echo "Email: $EMAIL"
echo ""

# Test 1: Login with form data (FastAPI Users format)
echo "Test 1: Login with form data (application/x-www-form-urlencoded)"
echo "---------------------------------------------------------------"
curl -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}" \
  -v

echo ""
echo ""
echo "=========================="
echo ""

# Test 2: Check if user exists (requires token from Test 1)
echo "Test 2: Get current user (requires valid token)"
echo "-------------------------------------------------"
echo "Note: Replace TOKEN with the access_token from Test 1"
echo "curl -X GET \"$API_URL/api/users/me\" -H \"Authorization: Bearer TOKEN\""
echo ""

# Test 3: Health check
echo "Test 3: Health check"
echo "--------------------"
curl -X GET "$API_URL/health" -v

echo ""
echo ""
echo "=========================="
echo "✅ Testing complete!"
echo ""
echo "If login fails, check:"
echo "1. Backend is running on $API_URL"
echo "2. User exists in database"
echo "3. User is verified (is_verified = true)"
echo "4. User is active (is_active = true)"
echo "5. Password is correct"
