#!/bin/bash

echo "=========================================="
echo "Simple HTTPS Fix for MovieVerse Backend"
echo "=========================================="
echo ""

DOMAIN="movieversebackend.jefin.xyz"
EMAIL="jefinfrancis11@gmail.com"

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: docker-compose is not installed!"
    echo "Install it with: sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose"
    echo "Then: sudo chmod +x /usr/local/bin/docker-compose"
    exit 1
fi

echo "Step 1: Stopping any running containers..."
docker-compose down
echo ""

echo "Step 2: Creating directories..."
mkdir -p certbot/conf certbot/www
echo ""

echo "Step 3: Downloading TLS parameters..."
if [ ! -f "certbot/conf/options-ssl-nginx.conf" ]; then
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "certbot/conf/options-ssl-nginx.conf"
fi
if [ ! -f "certbot/conf/ssl-dhparams.pem" ]; then
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "certbot/conf/ssl-dhparams.pem"
fi
echo ""

echo "Step 4: Creating HTTP-only nginx config..."
cat > nginx-temp.conf << 'EOF'
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

# Backup original config
if [ -f "nginx.conf" ] && [ ! -f "nginx.conf.ssl-backup" ]; then
    cp nginx.conf nginx.conf.ssl-backup
fi
cp nginx-temp.conf nginx.conf
echo ""

echo "Step 5: Starting services..."
docker-compose up -d
echo ""

echo "Step 6: Waiting for services to be ready (30 seconds)..."
sleep 30
echo ""

echo "Step 7: Checking if services are running..."
docker-compose ps
echo ""

echo "Step 8: Testing HTTP connection..."
HTTP_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/web/catalog/ 2>&1)
if [ "$HTTP_TEST" == "200" ]; then
    echo "✓ Backend is responding on HTTP"
else
    echo "⚠ Backend returned status: $HTTP_TEST"
    echo "Checking backend logs..."
    docker-compose logs --tail=20 backend
fi
echo ""

echo "Step 9: Requesting SSL certificate..."
docker-compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d $DOMAIN

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Certificate obtained successfully!"
    echo ""
    
    echo "Step 10: Restoring SSL nginx config..."
    if [ -f "nginx.conf.ssl-backup" ]; then
        cp nginx.conf.ssl-backup nginx.conf
    fi
    echo ""
    
    echo "Step 11: Restarting nginx with SSL..."
    docker-compose restart nginx
    echo ""
    
    echo "Step 12: Waiting for nginx to restart..."
    sleep 10
    echo ""
    
    echo "Step 13: Testing HTTPS..."
    curl -I https://$DOMAIN/api/web/catalog/
    echo ""
    
    echo "=========================================="
    echo "✓ Setup complete!"
    echo ""
    echo "Test your backend:"
    echo "  https://$DOMAIN/api/web/catalog/"
    echo "=========================================="
else
    echo ""
    echo "✗ Certificate request failed!"
    echo ""
    echo "Checking certbot logs..."
    docker-compose logs certbot
    echo ""
    echo "Common issues:"
    echo "1. Port 80 blocked in AWS Security Group"
    echo "2. DNS not pointing correctly"
    echo "3. Let's Encrypt rate limit (wait 1 hour)"
    echo ""
    echo "Your backend is still running on HTTP:"
    echo "  http://$DOMAIN/api/web/catalog/"
    echo "=========================================="
fi
