#!/bin/bash

echo "=========================================="
echo "MovieVerse Backend HTTPS Diagnostics"
echo "=========================================="
echo ""

DOMAIN="movieversebackend.jefin.xyz"
IP="51.20.60.134"

# 1. Check DNS Resolution
echo "1. Checking DNS resolution..."
DNS_IP=$(nslookup $DOMAIN | grep -A1 "Name:" | grep "Address:" | awk '{print $2}' | tail -1)
if [ "$DNS_IP" == "$IP" ]; then
    echo "✓ DNS is correctly pointing to $IP"
else
    echo "✗ DNS issue: $DOMAIN resolves to $DNS_IP instead of $IP"
    echo "  Fix: Update your DNS A record to point to $IP"
fi
echo ""

# 2. Check Docker containers
echo "2. Checking Docker containers..."
docker compose ps
echo ""

# 3. Check if ports are listening
echo "3. Checking if ports are listening..."
if netstat -tuln | grep -q ":80 "; then
    echo "✓ Port 80 is listening"
else
    echo "✗ Port 80 is NOT listening"
fi

if netstat -tuln | grep -q ":443 "; then
    echo "✓ Port 443 is listening"
else
    echo "✗ Port 443 is NOT listening"
fi
echo ""

# 4. Check SSL certificate
echo "4. Checking SSL certificate..."
if [ -d "certbot/conf/live/$DOMAIN" ]; then
    echo "✓ Certificate directory exists"
    docker compose run --rm certbot certificates
else
    echo "✗ Certificate directory does NOT exist"
    echo "  You need to run the certificate request"
fi
echo ""

# 5. Test HTTP connection
echo "5. Testing HTTP connection..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN/api/web/catalog/ 2>&1)
if [ "$HTTP_STATUS" == "301" ] || [ "$HTTP_STATUS" == "200" ]; then
    echo "✓ HTTP connection works (Status: $HTTP_STATUS)"
else
    echo "✗ HTTP connection failed (Status: $HTTP_STATUS)"
fi
echo ""

# 6. Test HTTPS connection
echo "6. Testing HTTPS connection..."
HTTPS_RESULT=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/web/catalog/ 2>&1)
if [ "$HTTPS_RESULT" == "200" ]; then
    echo "✓ HTTPS connection works!"
else
    echo "✗ HTTPS connection failed (Status: $HTTPS_RESULT)"
fi
echo ""

# 7. Check nginx logs
echo "7. Recent nginx logs (last 20 lines)..."
docker compose logs --tail=20 nginx
echo ""

# 8. Check certbot logs
echo "8. Recent certbot logs (last 20 lines)..."
docker compose logs --tail=20 certbot
echo ""

# 9. Check backend logs
echo "9. Recent backend logs (last 20 lines)..."
docker compose logs --tail=20 backend
echo ""

echo "=========================================="
echo "Diagnostics Complete"
echo "=========================================="
