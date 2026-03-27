#!/bin/bash

echo "=========================================="
echo "Get Certificate Using Standalone Mode"
echo "=========================================="
echo ""

DOMAIN="movieversebackend.jefin.xyz"
EMAIL="jefinfrancis11@gmail.com"

echo "This method temporarily stops nginx to get the certificate."
echo ""

echo "Step 1: Stopping nginx temporarily..."
docker-compose stop nginx
sleep 3
echo ""

echo "Step 2: Requesting certificate in standalone mode..."
echo "Certbot will start its own web server on port 80"
echo ""

docker-compose run --rm --service-ports certbot certonly \
  --standalone \
  --preferred-challenges http \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d $DOMAIN

RESULT=$?
echo ""

if [ $RESULT -eq 0 ]; then
    echo "=========================================="
    echo "✓ Certificate obtained successfully!"
    echo "=========================================="
    echo ""
    
    echo "Checking certificate files..."
    ls -lh certbot/conf/live/$DOMAIN/ 2>/dev/null || echo "Certificate directory not found!"
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
    
    echo "Starting nginx with SSL config..."
    docker-compose start nginx
    sleep 5
    echo ""
    
    echo "Testing HTTPS..."
    curl -I https://$DOMAIN/api/web/catalog/
    echo ""
    
    echo "=========================================="
    echo "✓ HTTPS is working!"
    echo ""
    echo "Your backend: https://$DOMAIN"
    echo "=========================================="
    
else
    echo "=========================================="
    echo "✗ Certificate request failed!"
    echo "=========================================="
    echo ""
    
    echo "Starting nginx again (HTTP only)..."
    cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name movieversebackend.jefin.xyz;
    
    location / {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        add_header Access-Control-Allow-Origin * always;
    }
}
EOF
    
    docker-compose start nginx
    echo ""
    
    echo "Checking certbot logs..."
    docker-compose run --rm certbot --version
    echo ""
    
    echo "Your backend is still on HTTP:"
    echo "  http://$DOMAIN/api/web/catalog/"
    echo ""
    echo "Common failure reasons:"
    echo "1. AWS Security Group blocking port 80"
    echo "2. Rate limit (5 failures per hour per domain)"
    echo "3. Firewall blocking Let's Encrypt servers"
fi
