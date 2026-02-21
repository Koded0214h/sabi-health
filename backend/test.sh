#!/bin/bash

# test.sh - Integration test script for Sabi Health API
# Make sure the FastAPI server is running at http://localhost:8000
# Usage: ./test.sh

set -e  # Exit on error

BASE_URL="http://localhost:8000"

echo "🔧 Sabi Health API Test Suite"
echo "=============================="

# Helper function to print colored output
print_success() {
    echo -e "\033[0;32m✅ $1\033[0m"
}
print_error() {
    echo -e "\033[0;31m❌ $1\033[0m"
    exit 1
}
print_info() {
    echo -e "\033[0;34mℹ️ $1\033[0m"
}

# Check if server is reachable
print_info "Checking server health..."
if ! curl -s "$BASE_URL/" > /dev/null; then
    print_error "Server not reachable at $BASE_URL"
fi
print_success "Server is up"

# ----------------------------------------------------------------------
# Register a test user
# ----------------------------------------------------------------------
print_info "Registering a test user (LGA: Lagos, phone: +2348012345678)..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
    -H "Content-Type: application/json" \
    -d '{"name": "Test User", "phone": "+2348012345678", "lga": "Lagos"}')
echo "$REGISTER_RESPONSE" | jq . 2>/dev/null || echo "$REGISTER_RESPONSE"

# Extract user ID
if command -v jq &> /dev/null; then
    USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.id')
else
    # Fallback: extract using grep/sed (assumes "id": "uuid")
    USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"id":"[^"]*' | sed 's/"id":"//')
fi

if [ -z "$USER_ID" ] || [ "$USER_ID" = "null" ]; then
    print_error "Failed to register user"
fi
print_success "User registered with ID: $USER_ID"

# ----------------------------------------------------------------------
# List users
# ----------------------------------------------------------------------
print_info "Listing all registered users..."
curl -s "$BASE_URL/users" | jq . 2>/dev/null || echo "$(curl -s $BASE_URL/users)"
print_success "Users listed"

# ----------------------------------------------------------------------
# Check risk for the user
# ----------------------------------------------------------------------
print_info "Checking risk for user $USER_ID..."
RISK_RESPONSE=$(curl -s "$BASE_URL/risk-check/$USER_ID")
echo "$RISK_RESPONSE" | jq . 2>/dev/null || echo "$RISK_RESPONSE"
print_success "Risk checked"

# ----------------------------------------------------------------------
# Test endpoints
# ----------------------------------------------------------------------
print_info "Testing /test-rainfall for Lagos..."
curl -s "$BASE_URL/test-rainfall?lga=Lagos" | jq . 2>/dev/null || echo "$(curl -s $BASE_URL/test-rainfall?lga=Lagos)"
print_success "Rainfall test done"

print_info "Testing /test-coordinates for Lagos..."
curl -s "$BASE_URL/test-coordinates?lga=Lagos" | jq . 2>/dev/null || echo "$(curl -s $BASE_URL/test-coordinates?lga=Lagos)"
print_success "Coordinates test done"

print_info "Testing /test-hotspot for Kano (should be hotspot)..."
curl -s "$BASE_URL/test-hotspot?lga=Kano" | jq . 2>/dev/null || echo "$(curl -s $BASE_URL/test-hotspot?lga=Kano)"
print_success "Hotspot test done"

print_info "Testing /test-risk for Kano..."
curl -s "$BASE_URL/test-risk?lga=Kano" | jq . 2>/dev/null || echo "$(curl -s $BASE_URL/test-risk?lga=Kano)"
print_success "Risk test done"

# ----------------------------------------------------------------------
# Trigger a call (simulation mode)
# ----------------------------------------------------------------------
print_info "Triggering a call for user $USER_ID..."
CALL_RESPONSE=$(curl -s -X POST "$BASE_URL/call-user/$USER_ID")
echo "$CALL_RESPONSE" | jq . 2>/dev/null || echo "$CALL_RESPONSE"

# Extract call_id
if command -v jq &> /dev/null; then
    CALL_ID=$(echo "$CALL_RESPONSE" | jq -r '.call_id')
else
    CALL_ID=$(echo "$CALL_RESPONSE" | grep -o '"call_id":"[^"]*' | sed 's/"call_id":"//')
fi

if [ -z "$CALL_ID" ] || [ "$CALL_ID" = "null" ]; then
    print_error "Failed to initiate call"
fi
print_success "Call initiated with ID: $CALL_ID"

# ----------------------------------------------------------------------
# Record a response (simulate user pressing "fever")
# ----------------------------------------------------------------------
print_info "Recording response (fever) for call $CALL_ID..."
RESP_RESPONSE=$(curl -s -X POST "$BASE_URL/respond/$CALL_ID" \
    -H "Content-Type: application/json" \
    -d '{"response": "fever"}')
echo "$RESP_RESPONSE" | jq . 2>/dev/null || echo "$RESP_RESPONSE"
print_success "Response recorded"

# ----------------------------------------------------------------------
# View logs
# ----------------------------------------------------------------------
print_info "Fetching call logs..."
curl -s "$BASE_URL/logs" | jq . 2>/dev/null || echo "$(curl -s $BASE_URL/logs)"
print_success "Logs retrieved"

# ----------------------------------------------------------------------
# Final status
# ----------------------------------------------------------------------
print_success "All tests completed successfully!"