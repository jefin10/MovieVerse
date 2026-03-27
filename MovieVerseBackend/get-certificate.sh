#!/bin/bash

echo "=========================================="
echo "Getting SSL Certificate"
echo "=========================================="
echo ""

DOMAIN="movieversebackend.jefin.xyz"
EMAIL="jefinfrancis11@gmail.com"

echo "Step 1: Checking current nginx config..."
echo "Current nginx.conf first few lines:"
head -10 nginx.conf
echo ""

echo "Step 2: Creating HTTP-only nginx config for certificate request..."
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

echo "✓ Created HTTP-only config"
echo ""

echo "Step 3: Restarting nginx..."
docker-compose restart nginx
sleep 5
echo ""

echo "Step 4: Testing nginx is responding..."
curl -I http://localhost/api/web/catalog/ 2>&1 | head -3
echo ""

echo "Step 5: Requesting SSL certificate..."
echo "This will take about 30 seconds..."
echo ""

docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  --verbose \
  -d $DOMAIN

CERT_RESULT=$?

if [ $CERT_RESULT -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✓ Certificate obtained successfully!"
    echo "=========================================="
    echo ""
    
    echo "Step 6: Checking certificate files..."
    ls -la certbot/conf/live/$DOMAIN/
    echo ""
    
    echo "Step 7: Creating SSL nginx config..."
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
    
    echo "✓ Created SSL config"
    echo ""
    
    echo "Step 8: Restarting nginx with SSL..."
    docker-compose restart nginx
    sleep 5
    echo ""
    
    echo "Step 9: Testing HTTPS..."
    curl -I https://$DOMAIN/api/web/catalog/
    echo ""
    
    echo "=========================================="
    echo "✓ HTTPS is now enabled!"
    echo ""
    echo "Test your backend:"
    echo "  https://$DOMAIN/api/web/catalog/"
    echo ""
    echo "Update your frontend .env.local:"
    echo "  NEXT_PUBLIC_API_BASE_URL=https://$DOMAIN"
    echo "=========================================="
    
else
    echo ""
    echo "=========================================="
    echo "✗ Certificate request failed!"
    echo "=========================================="
    echo ""
    echo "Checking detailed certbot logs..."
    docker-compose run --rm certbot certificates
    echo ""
    echo "Common issues:"
    echo "1. Port 80 blocked in AWS Security Group"
    echo "2. Rate limit (wait 1 hour and try again)"
    echo "3. Domain verification failed"
    echo ""
    echo "Your backend is still accessible via HTTP:"
    echo "  http://$DOMAIN/api/web/catalog/"
    echo "=========================================="
fi
