# HTTPS Setup Guide for MovieVerse Backend

This guide will help you set up HTTPS for your backend using nginx and Let's Encrypt.

## Prerequisites

1. Your domain `movieversebackend.jefin.xyz` must point to your server IP `51.20.60.134`
2. Ports 80 and 443 must be open in your AWS security group
3. Docker and Docker Compose must be installed on your server

## Step-by-Step Instructions

### Step 1: Verify DNS Configuration

First, verify your domain points to the correct IP:

```bash
nslookup movieversebackend.jefin.xyz
```

or

```bash
dig movieversebackend.jefin.xyz
```

It should return `51.20.60.134`. If not, update your DNS A record and wait for propagation (can take up to 48 hours, usually much faster).

### Step 2: Check AWS Security Group

Make sure your EC2 instance security group allows:
- Port 80 (HTTP) - for Let's Encrypt verification
- Port 443 (HTTPS) - for secure connections
- Port 22 (SSH) - for server access

### Step 3: Connect to Your Server

SSH into your AWS server:

```bash
ssh -i your-key.pem ubuntu@51.20.60.134
```

(Replace `ubuntu` with your username if different)

### Step 4: Navigate to Backend Directory

```bash
cd /path/to/MovieVerseBackend
```

### Step 5: Stop Existing Containers

```bash
docker compose down
```

### Step 6: Update Email in Setup Script

Edit the `init-letsencrypt.sh` file and change the email:

```bash
nano init-letsencrypt.sh
```

Change this line:
```bash
EMAIL="your-email@example.com"
```

To your actual email:
```bash
EMAIL="youremail@example.com"
```

Save and exit (Ctrl+X, then Y, then Enter).

### Step 7: Make Script Executable

```bash
chmod +x init-letsencrypt.sh
```

### Step 8: Run the Setup Script

```bash
./init-letsencrypt.sh
```

This script will:
1. Create necessary directories
2. Download TLS parameters
3. Start nginx temporarily
4. Request SSL certificate from Let's Encrypt
5. Configure nginx with SSL
6. Restart services

### Step 9: Verify HTTPS is Working

Test your backend:

```bash
curl https://movieversebackend.jefin.xyz/api/web/catalog/
```

Or visit in your browser:
```
https://movieversebackend.jefin.xyz/api/web/catalog/
```

### Step 10: Update Frontend Configuration

Update your website's `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=https://movieversebackend.jefin.xyz
```

## Troubleshooting

### Certificate Request Failed

If the certificate request fails:

1. Check DNS is pointing correctly:
   ```bash
   nslookup movieversebackend.jefin.xyz
   ```

2. Check ports 80 and 443 are accessible:
   ```bash
   curl http://movieversebackend.jefin.xyz
   ```

3. Check nginx logs:
   ```bash
   docker compose logs nginx
   ```

4. Check certbot logs:
   ```bash
   docker compose logs certbot
   ```

### Test with Staging First

If you want to test without hitting Let's Encrypt rate limits, edit `init-letsencrypt.sh` and change:

```bash
STAGING=0
```

to:

```bash
STAGING=1
```

This will use Let's Encrypt's staging environment. Once it works, change back to `STAGING=0` and run again.

### Certificate Renewal

Certificates auto-renew every 12 hours via the certbot container. To manually renew:

```bash
docker compose run --rm certbot renew
docker compose restart nginx
```

### View Certificate Expiry

```bash
docker compose run --rm certbot certificates
```

## Manual Alternative (Without Script)

If the script doesn't work, you can do it manually:

### 1. Start services without SSL

Create a temporary `nginx-temp.conf`:

```nginx
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
```

Rename your `nginx.conf` and use the temp one:

```bash
mv nginx.conf nginx.conf.ssl
mv nginx-temp.conf nginx.conf
docker compose up -d
```

### 2. Request certificate

```bash
docker compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email youremail@example.com \
  --agree-tos \
  --no-eff-email \
  -d movieversebackend.jefin.xyz
```

### 3. Restore SSL config

```bash
mv nginx.conf nginx-temp.conf
mv nginx.conf.ssl nginx.conf
docker compose restart nginx
```

## Maintenance

### View Running Containers

```bash
docker compose ps
```

### View Logs

```bash
docker compose logs -f nginx
docker compose logs -f backend
docker compose logs -f certbot
```

### Restart Services

```bash
docker compose restart
```

### Stop Services

```bash
docker compose down
```

### Start Services

```bash
docker compose up -d
```

## Security Notes

1. Certificates are stored in `./certbot/conf/`
2. Keep your `.env` file secure (contains database credentials)
3. Consider setting `DJANGO_DEBUG=False` in production
4. Update `DJANGO_ALLOWED_HOSTS` to only include your domain

## Support

If you encounter issues:
1. Check all logs: `docker compose logs`
2. Verify DNS: `nslookup movieversebackend.jefin.xyz`
3. Check firewall/security groups
4. Ensure Docker is running: `docker ps`
