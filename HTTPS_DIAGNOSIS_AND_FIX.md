# HTTPS Issue - Diagnosis and Fix

## What We Found

From your diagnostic output:

### ✓ Working:
- DNS is correctly pointing to 51.20.60.134

### ✗ Problems:
1. **Docker containers are NOT running** - This is the main issue!
2. Ports 80 and 443 are not listening (because containers aren't running)
3. No SSL certificate exists yet
4. Your Docker version uses `docker-compose` (with hyphen), not `docker compose`

## Root Cause

Your Docker containers stopped or were never started. Without running containers:
- nginx isn't running → ports not listening
- Backend isn't running → no API
- Can't get SSL certificate → no HTTPS

## The Fix

I've updated all scripts to use `docker-compose` (with hyphen) for your Docker version.

### Run This Command:

```bash
cd /home/ec2-user/MovieVerseBackend
chmod +x simple-fix.sh
./simple-fix.sh
```

This will:
1. Stop any existing containers
2. Start all services (backend, nginx, certbot)
3. Wait for them to be ready
4. Request SSL certificate from Let's Encrypt
5. Configure nginx for HTTPS
6. Test the connection

## What to Check First

### 1. AWS Security Group (CRITICAL!)

Before running the fix script, verify your AWS Security Group allows traffic:

**In AWS Console:**
- EC2 → Instances → Your instance
- Security tab → Security group
- Edit inbound rules
- Ensure these exist:
  - HTTP (Port 80) from 0.0.0.0/0
  - HTTPS (Port 443) from 0.0.0.0/0

**This is the #1 reason SSL certificate requests fail!**

### 2. Verify docker-compose is installed

```bash
docker-compose --version
```

If not installed:
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Step-by-Step Manual Process

If the script doesn't work, do this manually:

### 1. Start containers
```bash
cd /home/ec2-user/MovieVerseBackend
docker-compose up -d
```

### 2. Wait and check
```bash
sleep 30
docker-compose ps
```

All containers should show "Up" status.

### 3. Test backend is working
```bash
curl http://localhost:8000/api/web/catalog/
```

Should return JSON data.

### 4. Create HTTP-only nginx config
```bash
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
        
        add_header Access-Control-Allow-Origin * always;
    }
}
EOF

cp nginx.conf nginx.conf.ssl-backup
cp nginx-temp.conf nginx.conf
docker-compose restart nginx
```

### 5. Request certificate
```bash
docker-compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email jefinfrancis11@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d movieversebackend.jefin.xyz
```

### 6. Restore SSL config
```bash
cp nginx.conf.ssl-backup nginx.conf
docker-compose restart nginx
```

### 7. Test HTTPS
```bash
curl https://movieversebackend.jefin.xyz/api/web/catalog/
```

## Troubleshooting

### If certificate request fails:

**Error: "Connection refused" or "Timeout"**
- AWS Security Group is blocking port 80
- Fix: Add HTTP (port 80) inbound rule in AWS

**Error: "Domain verification failed"**
- DNS not propagated yet (wait 10 minutes)
- OR port 80 blocked

**Error: "Rate limit exceeded"**
- You've requested too many certificates
- Wait 1 hour and try again
- OR use staging mode first (see below)

### Use Staging Mode (for testing)

Edit `simple-fix.sh` and add `--staging` flag to the certbot command:

```bash
docker-compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --staging \
  --email jefinfrancis11@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d movieversebackend.jefin.xyz
```

Once it works with staging, remove `--staging` and run again for real certificate.

## Verification

After the fix, these should all work:

```bash
# From server
curl https://movieversebackend.jefin.xyz/api/web/catalog/

# Check certificate
echo | openssl s_client -servername movieversebackend.jefin.xyz -connect movieversebackend.jefin.xyz:443 2>/dev/null | openssl x509 -noout -dates

# View certificate details
docker-compose run --rm certbot certificates
```

## Files Updated

I've fixed these scripts to use `docker-compose` (with hyphen):
- ✓ diagnose-https.sh
- ✓ fix-https.sh
- ✓ init-letsencrypt.sh
- ✓ simple-fix.sh (NEW - easiest to use!)

## Next Steps

1. **Fix AWS Security Group** (if not done)
2. **Run `./simple-fix.sh`**
3. **Test HTTPS works**
4. **Update frontend to use HTTPS URL**

## Quick Reference

```bash
# Start containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs backend
docker-compose logs nginx

# Restart
docker-compose restart

# Stop
docker-compose down

# Run fix script
./simple-fix.sh

# Run diagnostics
./diagnose-https.sh
```

## After HTTPS Works

Update `movieverse-website/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=https://movieversebackend.jefin.xyz
```

Restart your Next.js dev server.

## Need More Help?

Run diagnostics and share output:
```bash
./diagnose-https.sh > diagnostics.txt
docker-compose logs > logs.txt
```

Also share:
- Screenshot of AWS Security Group inbound rules
- Output of: `docker-compose ps`
