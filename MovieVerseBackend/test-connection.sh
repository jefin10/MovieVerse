#!/bin/bash

DOMAIN="movieversebackend.jefin.xyz"
IP="51.20.60.134"

echo "Testing MovieVerse Backend Connection"
echo "======================================"
echo ""

# Test 1: DNS
echo "1. DNS Resolution:"
nslookup $DOMAIN | grep -A1 "Name:" | tail -2
echo ""

# Test 2: Ping
echo "2. Server Reachability:"
ping -c 3 $IP
echo ""

# Test 3: Port 80
echo "3. Port 80 (HTTP):"
timeout 5 bash -c "echo > /dev/tcp/$IP/80" && echo "✓ Port 80 is open" || echo "✗ Port 80 is closed"
echo ""

# Test 4: Port 443
echo "4. Port 443 (HTTPS):"
timeout 5 bash -c "echo > /dev/tcp/$IP/443" && echo "✓ Port 443 is open" || echo "✗ Port 443 is closed"
echo ""

# Test 5: HTTP Request
echo "5. HTTP Request:"
curl -I -m 10 http://$DOMAIN/api/web/catalog/ 2>&1 | head -5
echo ""

# Test 6: HTTPS Request
echo "6. HTTPS Request:"
curl -I -m 10 https://$DOMAIN/api/web/catalog/ 2>&1 | head -5
echo ""

echo "======================================"
echo "Test Complete"
