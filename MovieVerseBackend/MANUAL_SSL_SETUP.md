# Manual SSL Certificate Setup

Your services are already running. Follow these steps to get the SSL certificate:

## Step 1: Create Temporary nginx Config

```bash
cd /home/ec2-user/MovieVerseBackend

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
    }
}
EOF
```

## Step 2: Backup and Replace nginx Config

```bash
cp nginx.conf nginx.conf.backup
cp nginx-temp.conf nginx.conf
```

## Step 3: Restart nginx

```bash
docker-compose restart nginx
```

## Step 4: Request SSL Certificate

Replace `youremail@example.com` with your actual email:

```bash
docker-compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email youremail@example.com \
  --agree-tos \
  --no-eff-email \
  -d movieversebackend.jefin.xyz
```

## Step 5: Restore SSL nginx Config

```bash
mv nginx.conf.backup nginx.conf
```

## Step 6: Restart nginx with SSL

```bash
docker-compose restart nginx
```

## Step 7: Test HTTPS

```bash
curl https://movieversebackend.jefin.xyz/api/web/catalog/
```

## Troubleshooting

### Check if nginx is running
```bash
docker-compose ps
```

### Check nginx logs
```bash
docker-compose logs nginx
```

### Check certbot logs
```bash
docker-compose logs certbot
```

### Test HTTP first
```bash
curl http://movieversebackend.jefin.xyz/api/web/catalog/
```

### Check if port 80 is accessible from outside
```bash
curl -I http://51.20.60.134
```

### Verify DNS
```bash
nslookup movieversebackend.jefin.xyz
```

Should return: `51.20.60.134`
