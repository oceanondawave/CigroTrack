#!/bin/bash

# Test Backend Endpoints
# This script tests all key endpoints

BASE_URL="http://localhost:3001"
API_URL="${BASE_URL}/api"

echo "🧪 Testing CigroTrack Backend API"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    local expected_status=${5:-200}
    
    echo -n "Testing: $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "${endpoint}")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "${endpoint}" \
            -H "Content-Type: application/json" \
            -d "${data}")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PUT "${endpoint}" \
            -H "Content-Type: application/json" \
            -d "${data}")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE "${endpoint}")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code, expected $expected_status)"
        echo "  Response: $body"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

echo "1. Testing Health Check"
test_endpoint "GET" "${BASE_URL}/health" "Health check endpoint" "" 200

echo ""
echo "2. Testing API Root"
test_endpoint "GET" "${API_URL}" "API root endpoint" "" 200

echo ""
echo "3. Testing Auth Endpoints (Public)"
test_endpoint "POST" "${API_URL}/auth/signup" "Signup (expect 400 - missing fields)" '{"name":"","email":"","password":""}' 400
test_endpoint "POST" "${API_URL}/auth/login" "Login (expect 400 - missing fields)" '{"email":"","password":""}' 400

echo ""
echo "4. Testing Protected Endpoints (expect 401)"
test_endpoint "GET" "${API_URL}/auth/me" "Get current user (no auth)" "" 401
test_endpoint "GET" "${API_URL}/teams" "Get teams (no auth)" "" 401
test_endpoint "GET" "${API_URL}/projects?teamId=test" "Get projects (no auth)" "" 401

echo ""
echo "=================================="
echo -e "${GREEN}✓ Passed: $PASSED${NC}"
echo -e "${RED}✗ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All basic tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed${NC}"
    exit 1
fi

