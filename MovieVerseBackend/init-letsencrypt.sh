#!/bin/bash

# Initial setup script for Let's Encrypt SSL certificate

DOMAIN="movieversebackend.jefin.xyz"
EMAIL="jefinfrancis11@gmail.com"  # Change this to your email
STAGING=0  # Set to 1 for testing, 0 for production

# Create directories
mkdir -p certbot/conf
mkdir -p certbot/www

# Download recommended TLS parameters
if [ ! -e "certbot/conf/options-ssl-nginx.conf" ] || [ ! -e "certbot/conf/ssl-dhparams.pem" ]; then
  echo "### Downloading recommended TLS parameters ..."
  mkdir -p "certbot/conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "certbot/conf/options-ssl-nginx.conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "certbot/conf/ssl-dhparams.pem"
  echo
fi

# Create temporary nginx config for initial certificate request
echo "### Creating temporary nginx config ..."
cat > nginx-temp.conf << 'EOF'
server {
    listen 80;
    server_name movieversebackend.jefin.xyz;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        proxy_pass http://backend:8000;
    }
}
EOF

# Backup original nginx config
if [ -f "nginx.conf" ]; then
  cp nginx.conf nginx.conf.backup
fi

# Use temporary config
cp nginx-temp.conf nginx.conf

echo "### Starting nginx with temporary config ..."
docker-compose up -d nginx

echo "### Waiting for nginx to start ..."
sleep 5

echo "### Requesting Let's Encrypt certificate ..."
if [ $STAGING != "0" ]; then
  STAGING_ARG="--staging"
else
  STAGING_ARG=""
fi

docker-compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  $STAGING_ARG \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN

# Restore original nginx config
if [ -f "nginx.conf.backup" ]; then
  mv nginx.conf.backup nginx.conf
else
  echo "### Error: nginx.conf.backup not found!"
  exit 1
fi

echo "### Restarting nginx with SSL config ..."
docker-compose restart nginx

echo "### Done! Your site should now be accessible via HTTPS"
