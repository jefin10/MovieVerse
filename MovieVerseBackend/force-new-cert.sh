#!/bin/bash

echo "=========================================="
echo "Force New SSL Certificate Request"
echo "=========================================="
echo ""

DOMAIN="movieversebackend.jefin.xyz"
EMAIL="jefinfrancis11@gmail.com"

echo "Step 1: Stopping certbot container if running..."
docker-compose stop certbot
echo ""

echo "Step 2: Removing any existing certificate data..."
echo "Backing up old certs (if any)..."
if [ -d "certbot/conf/live" ]; then
    mv certbot/conf/live certbot/conf/live.backup.$(date +%s) 2>/dev/null
fi
if [ -d "certbot/conf/archive" ]; then
    mv certbot/conf/archive certbot/conf/archive.backup.$(date +%s) 2>/dev/null
fi
if [ -d "certbot/conf/renewal" ]; then
    mv certbot/conf/renewal certbot/conf/renewal.backup.$(date +%s) 2>/dev/null
fi
echo ""

echo "Step 3: Ensuring HTTP-only nginx config..."
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name movieversebackend.jefin.xyz;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
        
        if ($request_method = OPTIONS) {
            return 204;
        }
    }
}
EOF
echo ""

echo "Step 4: Restarting nginx..."
docker-compose restart nginx
sleep 5
echo ""

echo "Step 5: Testing nginx responds..."
HTTP_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/web/catalog/)
echo "HTTP Status: $HTTP_TEST"
if [ "$HTTP_TEST" != "200" ] && [ "$HTTP_TEST" != "404" ]; then
    echo "Warning: nginx might not be responding correctly"
fi
echo ""

echo "Step 6: Creating challenge directory..."
mkdir -p certbot/www/.well-known/acme-challenge
chmod -R 755 certbot/www
echo ""

echo "Step 7: Testing challenge path is accessible..."
echo "test-file" > certbot/www/.well-known/acme-challenge/test.txt
sleep 2
CHALLENGE_TEST=$(curl -s http://localhost/.well-known/acme-challenge/test.txt)
if [ "$CHALLENGE_TEST" == "test-file" ]; then
    echo "✓ Challenge path is accessible"
else
    echo "✗ Challenge path NOT accessible - this will cause certificate request to fail!"
    echo "Got: $CHALLENGE_TEST"
fi
rm -f certbot/www/.well-known/acme-challenge/test.txt
echo ""

echo "Step 8: Requesting NEW certificate (not renewal)..."
echo "This should take 30-60 seconds..."
echo ""

# Use certonly with explicit new certificate request
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  --keep-until-expiring \
  --non-interactive \
  -d $DOMAIN

RESULT=$?
echo ""

if [ $RESULT -eq 0 ]; then
    echo "=========================================="
    echo "✓ Certificate obtained!"
    echo "=========================================="
    echo ""
    
    echo "Verifying certificate files..."
    if [ -f "certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
        echo "✓ Certificate files exist"
        ls -lh certbot/conf/live/$DOMAIN/
        echo ""
        
        echo "Certificate details:"
        docker-compose run --rm certbot certificates
        echo ""
        
        echo "Creating SSL nginx config..."
        cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name movieversebackend.jefin.xyz;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name movieversebackend.jefin.xyz;
    
    ssl_certificate /etc/letsencrypt/live/movieversebackend.jefin.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/movieversebackend.jefin.xyz/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    location / {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
        
        if ($request_method = OPTIONS) {
            return 204;
        }
    }
}
EOF
        
        echo "Restarting nginx with SSL..."
        docker-compose restart nginx
        sleep 5
        echo ""
        
        echo "Testing HTTPS..."
        curl -I https://$DOMAIN/api/web/catalog/
        echo ""
        
        echo "=========================================="
        echo "✓ HTTPS is now working!"
        echo ""
        echo "Your backend: https://$DOMAIN"
        echo ""
        echo "Update frontend .env.local:"
        echo "NEXT_PUBLIC_API_BASE_URL=https://$DOMAIN"
        echo "=========================================="
    else
        echo "✗ Certificate files not found!"
        echo "Something went wrong during certificate creation"
    fi
else
    echo "=========================================="
    echo "✗ Certificate request failed with code: $RESULT"
    echo "=========================================="
    echo ""
    
    echo "Checking certbot logs..."
    if [ -f "certbot/conf/letsencrypt.log" ]; then
        echo "Last 30 lines of certbot log:"
        tail -30 certbot/conf/letsencrypt.log
    fi
    echo ""
    
    echo "Possible issues:"
    echo "1. AWS Security Group blocking port 80"
    echo "2. Rate limit (5 failed attempts per hour)"
    echo "3. Domain verification failed"
    echo ""
    echo "To check from outside, run on your LOCAL computer:"
    echo "  curl http://$DOMAIN/.well-known/acme-challenge/test.txt"
    echo ""
    echo "Your backend is still on HTTP:"
    echo "  http://$DOMAIN/api/web/catalog/"
fi
