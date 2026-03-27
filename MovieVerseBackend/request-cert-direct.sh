#!/bin/bash

echo "=========================================="
echo "Direct Certificate Request"
echo "=========================================="
echo ""

DOMAIN="movieversebackend.jefin.xyz"
EMAIL="jefinfrancis11@gmail.com"

echo "Step 1: Ensuring HTTP-only nginx config..."
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

echo "Step 2: Restarting nginx..."
docker-compose restart nginx
sleep 5
echo ""

echo "Step 3: Testing nginx..."
curl -I http://localhost/api/web/catalog/ 2>&1 | head -3
echo ""

echo "Step 4: Creating challenge directory..."
mkdir -p certbot/www/.well-known/acme-challenge
chmod -R 755 certbot/www
echo ""

echo "Step 5: Requesting certificate (overriding entrypoint)..."
echo "This will take 30-60 seconds..."
echo ""

# Override the entrypoint to run certbot command directly
docker run --rm \
  --name certbot-request \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  --network movieversebackend_default \
  certbot/certbot \
  certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d $DOMAIN

RESULT=$?
echo ""

if [ $RESULT -eq 0 ]; then
    echo "=========================================="
    echo "✓ Certificate obtained!"
    echo "=========================================="
    echo ""
    
    echo "Verifying certificate files..."
    ls -lh certbot/conf/live/$DOMAIN/
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
    echo "✓ HTTPS is now enabled!"
    echo ""
    echo "Test: https://$DOMAIN/api/web/catalog/"
    echo ""
    echo "Update frontend:"
    echo "NEXT_PUBLIC_API_BASE_URL=https://$DOMAIN"
    echo "=========================================="
    
else
    echo "=========================================="
    echo "✗ Certificate request failed (exit code: $RESULT)"
    echo "=========================================="
    echo ""
    
    echo "Possible issues:"
    echo "1. AWS Security Group blocking port 80 from Let's Encrypt servers"
    echo "2. Rate limit exceeded (wait 1 hour)"
    echo "3. Domain verification failed"
    echo ""
    echo "To debug, check if port 80 is accessible from outside:"
    echo "  (Run on your LOCAL computer, not the server)"
    echo "  curl -I http://$DOMAIN"
    echo ""
    echo "Your backend is still on HTTP:"
    echo "  http://$DOMAIN/api/web/catalog/"
fi
