#!/bin/bash
# Debug script: Test Thrad SSP API with different payload formats
# Tests the bid-request endpoint to diagnose 403 "Origin not allowed" errors

API_URL="https://ssp.thrads.ai/api/v1/ssp/bid-request"
API_KEY="sk_698d80d0539c4e54921d3297e3b2a057qCK1Lbo6PZSa_nGFUsJZAg"

echo "=========================================="
echo "TEST 1: Docs-format payload, NO Origin header"
echo "=========================================="
echo ""
curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "thrad-api-key: $API_KEY" \
  -d '{
    "client_id": "test_user_123",
    "turn_number": 1,
    "adtype": "text",
    "messages": [
      {
        "role": "user",
        "content": "What are the best running shoes for beginners?"
      },
      {
        "role": "assistant",
        "content": "Great question! For beginners, I recommend looking at shoes with good cushioning and support."
      }
    ],
    "production": false
  }'

echo ""
echo ""
echo "=========================================="
echo "TEST 2: Docs-format payload, WITH Origin header (localhost)"
echo "=========================================="
echo ""
curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "thrad-api-key: $API_KEY" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "client_id": "test_user_123",
    "turn_number": 1,
    "adtype": "text",
    "messages": [
      {
        "role": "user",
        "content": "What are the best running shoes for beginners?"
      },
      {
        "role": "assistant",
        "content": "Great question! For beginners, I recommend looking at shoes with good cushioning and support."
      }
    ],
    "production": false
  }'

echo ""
echo ""
echo "=========================================="
echo "TEST 3: Current app payload format (userId/chatId), NO Origin"
echo "=========================================="
echo ""
curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "thrad-api-key: $API_KEY" \
  -d '{
    "userId": "user_test_123",
    "chatId": "chat_abc",
    "messages": [
      {
        "role": "user",
        "content": "What are the best running shoes for beginners?",
        "timestamp": "2026-02-10T12:00:00.000Z"
      },
      {
        "role": "assistant",
        "content": "Great question! For beginners, I recommend looking at shoes with good cushioning and support.",
        "timestamp": "2026-02-10T12:00:01.000Z"
      }
    ],
    "production": false
  }'

echo ""
echo ""
echo "=========================================="
echo "TEST 4: Minimal payload, NO Origin"
echo "=========================================="
echo ""
curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "thrad-api-key: $API_KEY" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "What are the best running shoes for beginners?"
      }
    ]
  }'

echo ""
echo ""
echo "=========================================="
echo "TEST 5: Docs-format, Origin set to 'None' (simulating no-origin)"
echo "=========================================="
echo ""
curl -s -w "\n\nHTTP Status: %{http_code}\n" \
  -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "thrad-api-key: $API_KEY" \
  -H "Origin: None" \
  -d '{
    "client_id": "test_user_123",
    "turn_number": 1,
    "adtype": "text",
    "messages": [
      {
        "role": "user",
        "content": "What are the best running shoes for beginners?"
      },
      {
        "role": "assistant",
        "content": "Great question! For beginners, I recommend looking at shoes with good cushioning and support."
      }
    ],
    "production": false
  }'

echo ""
echo ""
echo "Done. Check results above."
