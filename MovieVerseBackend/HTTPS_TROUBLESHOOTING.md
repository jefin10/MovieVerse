# HTTPS Connection Troubleshooting Guide

## Quick Diagnosis

Run this command on your AWS server to diagnose the issue:

```bash
cd /home/ec2-user/MovieVerseBackend
chmod +x diagnose-https.sh
./diagnose-https.sh
```

## Common Issues and Solutions

### Issue 1: DNS Not Resolving Correctly

**Symptom:** Domain doesn't point to your server IP

**Check:**
```bash
nslookup movieversebackend.jefin.xyz
```

**Should return:** `51.20.60.134`

**Fix:** Update your DNS A record at your domain registrar to point to `51.20.60.134`

---

### Issue 2: AWS Security Group Blocking Ports

**Symptom:** Ports 80 or 443 not accessible from outside

**Check:** In AWS Console:
1. Go to EC2 → Instances
2. Select your instance
3. Click "Security" tab
4. Check "Security groups"

**Fix:** Add these inbound rules:
- Type: HTTP, Port: 80, Source: 0.0.0.0/0
- Type: HTTPS, Port: 443, Source: 0.0.0.0/0
- Type: SSH, Port: 22, Source: Your IP

---

### Issue 3: SSL Certificate Not Generated

**Symptom:** Certificate files don't exist

**Check:**
```bash
ls -la certbot/conf/live/movieversebackend.jefin.xyz/
```

**Fix:** Run the automated fix script:
```bash
chmod +x fix-https.sh
./fix-https.sh
```

---

### Issue 4: nginx Not Starting with SSL Config

**Symptom:** nginx container keeps restarting

**Check:**
```bash
docker compose logs nginx
```

**Fix:** The SSL config references certificates that don't exist yet. Use the fix script which:
1. Starts with HTTP-only config
2. Gets the certificate
3. Switches to SSL config

---

### Issue 5: Certificate Request Fails

**Symptom:** Let's Encrypt can't verify domain ownership

**Common causes:**
1. DNS not propagated yet (wait 5-10 minutes)
2. Port 80 blocked
3. nginx not serving the verification challenge

**Check:**
```bash
# Test if port 80 is accessible
curl http://movieversebackend.jefin.xyz

# Check nginx logs
docker compose logs nginx
```

**Fix:**
```bash
# Make sure services are running
docker compose up -d

# Try certificate request again
docker compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email jefinfrancis11@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d movieversebackend.jefin.xyz
```

---

## Step-by-Step Fix Process

### Option A: Automated Fix (Recommended)

```bash
cd /home/ec2-user/MovieVerseBackend
chmod +x fix-https.sh
./fix-https.sh
```

This script will:
1. Stop all containers
2. Set up HTTP-only nginx
3. Request SSL certificate
4. Configure nginx with SSL
5. Restart everything

### Option B: Manual Fix

#### 1. Verify Prerequisites

```bash
# Check DNS
nslookup movieversebackend.jefin.xyz
# Should return: 51.20.60.134

# Check Docker is running
docker ps

# Check you're in the right directory
pwd
# Should be: /home/ec2-user/MovieVerseBackend
```

#### 2. Stop Everything

```bash
docker compose down
```

#### 3. Create Temporary HTTP-Only Config

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
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Backup and use temp config
cp nginx.conf nginx.conf.ssl-backup
cp nginx-temp.conf nginx.conf
```

#### 4. Start Services

```bash
docker compose up -d
```

#### 5. Wait and Verify

```bash
# Wait 30 seconds
sleep 30

# Check services are running
docker compose ps

# Test HTTP works
curl http://movieversebackend.jefin.xyz/api/web/catalog/
```

#### 6. Request Certificate

```bash
docker compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email jefinfrancis11@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d movieversebackend.jefin.xyz
```

#### 7. Restore SSL Config

```bash
cp nginx.conf.ssl-backup nginx.conf
docker compose restart nginx
```

#### 8. Test HTTPS

```bash
curl https://movieversebackend.jefin.xyz/api/web/catalog/
```

---

## Verification Commands

### Check if HTTPS is working:
```bash
curl -I https://movieversebackend.jefin.xyz/api/web/catalog/
```

### Check certificate details:
```bash
docker compose run --rm certbot certificates
```

### Check certificate expiry:
```bash
echo | openssl s_client -servername movieversebackend.jefin.xyz -connect movieversebackend.jefin.xyz:443 2>/dev/null | openssl x509 -noout -dates
```

### View all logs:
```bash
docker compose logs
```

### View specific service logs:
```bash
docker compose logs nginx
docker compose logs certbot
docker compose logs backend
```

---

## Emergency Rollback

If HTTPS breaks and you need to quickly go back to HTTP-only:

```bash
cd /home/ec2-user/MovieVerseBackend

# Create simple HTTP config
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name movieversebackend.jefin.xyz;
    
    location / {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    }
}
EOF

# Restart
docker compose restart nginx
```

---

## Testing from Your Local Machine

```bash
# Test DNS
nslookup movieversebackend.jefin.xyz

# Test HTTP
curl http://movieversebackend.jefin.xyz/api/web/catalog/

# Test HTTPS
curl https://movieversebackend.jefin.xyz/api/web/catalog/

# Test with verbose output
curl -v https://movieversebackend.jefin.xyz/api/web/catalog/
```

---

## Still Not Working?

1. **Check AWS Security Group** - Most common issue
   - Ensure ports 80 and 443 are open to 0.0.0.0/0

2. **Check DNS Propagation** - Can take up to 48 hours
   - Use: https://dnschecker.org/

3. **Check Docker Logs**
   ```bash
   docker compose logs --tail=100
   ```

4. **Verify Backend is Running**
   ```bash
   docker compose exec backend python manage.py check
   ```

5. **Check nginx Config Syntax**
   ```bash
   docker compose exec nginx nginx -t
   ```

---

## Contact Information

If you're still stuck, gather this information:

```bash
# Run diagnostics
./diagnose-https.sh > diagnostics.txt

# Get all logs
docker compose logs > docker-logs.txt
```

Then share:
- diagnostics.txt
- docker-logs.txt
- Screenshot of AWS Security Group rules
- Output of: `nslookup movieversebackend.jefin.xyz`
