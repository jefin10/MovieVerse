#!/bin/bash

echo "Checking if ports are accessible from outside..."
echo ""

DOMAIN="movieversebackend.jefin.xyz"
IP="51.20.60.134"

echo "1. Testing port 80 from inside server:"
curl -I http://localhost/api/web/catalog/ 2>&1 | head -3
echo ""

echo "2. Testing port 80 via domain from inside server:"
curl -I http://$DOMAIN/api/web/catalog/ 2>&1 | head -3
echo ""

echo "3. Testing if port 80 is open (from outside perspective):"
echo "   You need to test this from your LOCAL computer, not the server:"
echo "   curl -I http://$DOMAIN"
echo ""

echo "4. Checking nginx access logs:"
docker-compose exec nginx cat /var/log/nginx/access.log 2>/dev/null | tail -10 || echo "No access logs found"
echo ""

echo "5. Checking nginx error logs:"
docker-compose exec nginx cat /var/log/nginx/error.log 2>/dev/null | tail -10 || echo "No error logs found"
echo ""

echo "6. Testing Let's Encrypt challenge directory:"
docker-compose exec nginx ls -la /var/www/certbot/.well-known/acme-challenge/ 2>/dev/null || echo "Challenge directory not accessible"
echo ""

echo "7. Checking if nginx is serving the challenge path:"
echo "test" > certbot/www/test.txt
sleep 2
curl http://localhost/test.txt 2>&1
rm -f certbot/www/test.txt
echo ""

echo "=========================================="
echo "If you see 'Connection refused' or timeouts,"
echo "your AWS Security Group is blocking port 80!"
echo "=========================================="
