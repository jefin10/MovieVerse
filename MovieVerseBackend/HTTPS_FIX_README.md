# HTTPS Not Working? Start Here! 🔧

## Quick Fix (Do This First!)

SSH into your AWS server and run:

```bash
cd /home/ec2-user/MovieVerseBackend
chmod +x fix-https.sh
./fix-https.sh
```

This automated script will fix most HTTPS issues in about 2 minutes.

---

## What's Probably Wrong

Based on your setup, the most common issues are:

### 1. AWS Security Group (90% of cases)
Your EC2 instance firewall might be blocking ports 80 and 443.

**Fix in AWS Console:**
1. Go to EC2 → Instances
2. Click your instance
3. Click "Security" tab
4. Click the security group link
5. Click "Edit inbound rules"
6. Add these rules if missing:
   - Type: HTTP, Port: 80, Source: 0.0.0.0/0
   - Type: HTTPS, Port: 443, Source: 0.0.0.0/0

### 2. SSL Certificate Not Generated
The certificate files don't exist yet, so nginx can't start with SSL.

**Fix:** Run `./fix-https.sh` (it handles this automatically)

### 3. DNS Not Propagated
Your domain might not be pointing to the server yet.

**Check:**
```bash
nslookup movieversebackend.jefin.xyz
```

Should return: `51.20.60.134`

If not, update your DNS A record and wait 5-10 minutes.

---

## Diagnostic Tools

### Run Full Diagnostics
```bash
chmod +x diagnose-https.sh
./diagnose-https.sh
```

### Quick Connection Test
```bash
chmod +x test-connection.sh
./test-connection.sh
```

### Check What's Running
```bash
docker compose ps
```

### View Logs
```bash
# All logs
docker compose logs

# Just nginx
docker compose logs nginx

# Just certbot
docker compose logs certbot
```

---

## Manual Step-by-Step Fix

If the automated script doesn't work, follow the manual process in `HTTPS_TROUBLESHOOTING.md`.

---

## After HTTPS is Working

### Update Your Frontend

In `movieverse-website/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=https://movieversebackend.jefin.xyz
```

In `MovieVerseApp` (React Native), update the API base URL to use HTTPS.

### Test the Connection

```bash
# From your local machine
curl https://movieversebackend.jefin.xyz/api/web/catalog/
```

Should return JSON data about movies.

---

## Files in This Directory

- `fix-https.sh` - Automated fix script (run this first!)
- `diagnose-https.sh` - Diagnostic tool
- `test-connection.sh` - Quick connection test
- `HTTPS_TROUBLESHOOTING.md` - Detailed troubleshooting guide
- `HTTPS_SETUP_GUIDE.md` - Original setup instructions
- `init-letsencrypt.sh` - Initial certificate setup

---

## Common Error Messages

### "Connection refused"
- Ports 80/443 blocked in AWS Security Group
- Docker containers not running

### "SSL certificate problem"
- Certificate not generated yet
- Certificate expired (auto-renews every 12 hours)

### "Could not resolve host"
- DNS not configured correctly
- Domain not pointing to server IP

### "502 Bad Gateway"
- Backend container not running
- Backend crashed (check logs: `docker compose logs backend`)

---

## Need More Help?

1. Run diagnostics: `./diagnose-https.sh > diagnostics.txt`
2. Get logs: `docker compose logs > logs.txt`
3. Check AWS Security Group screenshot
4. Share these files for debugging

---

## Certificate Renewal

Certificates auto-renew every 12 hours via the certbot container.

To manually renew:
```bash
docker compose run --rm certbot renew
docker compose restart nginx
```

To check expiry:
```bash
docker compose run --rm certbot certificates
```

---

## Emergency: Revert to HTTP Only

If you need to quickly disable HTTPS and go back to HTTP:

```bash
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name movieversebackend.jefin.xyz;
    
    location / {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    }
}
EOF

docker compose restart nginx
```

Then update your frontend to use `http://` instead of `https://`.
