#!/bin/bash

echo "=========================================="
echo "MovieVerse Backend HTTPS Fix Script"
echo "=========================================="
echo ""

DOMAIN="movieversebackend.jefin.xyz"
EMAIL="jefinfrancis11@gmail.com"

# Step 1: Stop all containers
echo "Step 1: Stopping all containers..."
docker compose down
echo ""

# Step 2: Clean up old certificates (optional - uncomment if needed)
# echo "Step 2: Cleaning up old certificates..."
# rm -rf certbot/conf/*
# rm -rf certbot/www/*
# echo ""

# Step 3: Create directories
echo "Step 2: Creating necessary directories..."
mkdir -p certbot/conf
mkdir -p certbot/www
echo ""

# Step 4: Download TLS parameters
echo "Step 3: Downloading TLS parameters..."
if [ ! -f "certbot/conf/options-ssl-nginx.conf" ]; then
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "certbot/conf/options-ssl-nginx.conf"
fi
if [ ! -f "certbot/conf/ssl-dhparams.pem" ]; then
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "certbot/conf/ssl-dhparams.pem"
fi
echo ""

# Step 5: Create temporary nginx config (HTTP only)
echo "Step 4: Creating temporary nginx config..."
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
echo ""

# Step 6: Backup original config and use temp
echo "Step 5: Backing up nginx config..."
if [ -f "nginx.conf" ]; then
    cp nginx.conf nginx.conf.ssl-backup
fi
cp nginx-temp.conf nginx.conf
echo ""

# Step 7: Start services
echo "Step 6: Starting services..."
docker compose up -d
echo ""

# Step 8: Wait for services to be ready
echo "Step 7: Waiting for services to start (30 seconds)..."
sleep 30
echo ""

# Step 9: Check if services are running
echo "Step 8: Checking services..."
docker compose ps
echo ""

# Step 10: Request certificate
echo "Step 9: Requesting SSL certificate from Let's Encrypt..."
echo "This may take a minute..."
docker compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d $DOMAIN

if [ $? -eq 0 ]; then
    echo "✓ Certificate obtained successfully!"
    echo ""
    
    # Step 11: Restore SSL config
    echo "Step 10: Restoring SSL nginx config..."
    if [ -f "nginx.conf.ssl-backup" ]; then
        cp nginx.conf.ssl-backup nginx.conf
    else
        echo "Warning: nginx.conf.ssl-backup not found, using default SSL config"
    fi
    echo ""
    
    # Step 12: Restart nginx
    echo "Step 11: Restarting nginx with SSL..."
    docker compose restart nginx
    echo ""
    
    # Step 13: Wait and test
    echo "Step 12: Waiting for nginx to restart (10 seconds)..."
    sleep 10
    echo ""
    
    echo "Step 13: Testing HTTPS connection..."
    curl -I https://$DOMAIN/api/web/catalog/
    echo ""
    
    echo "=========================================="
    echo "✓ HTTPS setup complete!"
    echo "Your backend should now be accessible at:"
    echo "https://$DOMAIN"
    echo "=========================================="
else
    echo "✗ Certificate request failed!"
    echo ""
    echo "Common issues:"
    echo "1. DNS not pointing to correct IP (check: nslookup $DOMAIN)"
    echo "2. Port 80 blocked in AWS Security Group"
    echo "3. Domain verification failed"
    echo ""
    echo "Check logs with: docker compose logs certbot"
    echo "=========================================="
fi
