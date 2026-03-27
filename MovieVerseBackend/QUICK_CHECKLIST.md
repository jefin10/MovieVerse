# HTTPS Quick Checklist ✅

Run through this checklist to fix your HTTPS issue:

## Pre-Flight Checks

- [ ] You have SSH access to your AWS server
- [ ] You know your server IP: `51.20.60.134`
- [ ] Your domain is: `movieversebackend.jefin.xyz`
- [ ] You have access to AWS Console

## Step 1: AWS Security Group (CRITICAL!)

- [ ] Log into AWS Console
- [ ] Go to EC2 → Instances
- [ ] Select your instance
- [ ] Click "Security" tab
- [ ] Click security group name
- [ ] Verify these inbound rules exist:
  - [ ] HTTP (Port 80) from 0.0.0.0/0
  - [ ] HTTPS (Port 443) from 0.0.0.0/0
  - [ ] SSH (Port 22) from your IP
- [ ] If missing, click "Edit inbound rules" and add them

## Step 2: DNS Check

- [ ] Run: `nslookup movieversebackend.jefin.xyz`
- [ ] Verify it returns: `51.20.60.134`
- [ ] If not, update DNS A record and wait 10 minutes

## Step 3: SSH to Server

```bash
ssh -i your-key.pem ec2-user@51.20.60.134
```

- [ ] Successfully connected to server

## Step 4: Navigate to Backend

```bash
cd /home/ec2-user/MovieVerseBackend
```

- [ ] In correct directory

## Step 5: Run Automated Fix

```bash
chmod +x fix-https.sh
./fix-https.sh
```

- [ ] Script completed without errors
- [ ] Certificate obtained successfully
- [ ] nginx restarted

## Step 6: Test HTTPS

```bash
curl https://movieversebackend.jefin.xyz/api/web/catalog/
```

- [ ] Returns JSON data (not error)
- [ ] Status code is 200

## Step 7: Test from Browser

- [ ] Open: https://movieversebackend.jefin.xyz/api/web/catalog/
- [ ] See JSON data
- [ ] No SSL warnings

## Step 8: Update Frontend

### Next.js Website

Edit `movieverse-website/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=https://movieversebackend.jefin.xyz
```

- [ ] Updated .env.local
- [ ] Restarted dev server

### React Native App

- [ ] Updated API base URL to HTTPS
- [ ] Tested on device/emulator

## Troubleshooting

If any step fails:

### Run Diagnostics
```bash
chmod +x diagnose-https.sh
./diagnose-https.sh
```

### Check Logs
```bash
docker compose logs nginx
docker compose logs certbot
docker compose logs backend
```

### Verify Containers Running
```bash
docker compose ps
```

All containers should show "Up" status.

## Common Failures

### ❌ Port 80/443 blocked
**Solution:** Fix AWS Security Group (Step 1)

### ❌ DNS not resolving
**Solution:** Update DNS A record, wait 10 minutes

### ❌ Certificate request failed
**Solution:** Ensure ports are open, DNS is correct, then run fix script again

### ❌ nginx won't start
**Solution:** Check logs: `docker compose logs nginx`

## Success Criteria

✅ All these should work:

```bash
# From server
curl https://movieversebackend.jefin.xyz/api/web/catalog/

# From your computer
curl https://movieversebackend.jefin.xyz/api/web/catalog/

# In browser
https://movieversebackend.jefin.xyz/api/web/catalog/
```

## After Success

- [ ] Certificate will auto-renew every 12 hours
- [ ] Frontend updated to use HTTPS
- [ ] Mobile app updated to use HTTPS
- [ ] Test all API endpoints work

## Still Stuck?

1. Run: `./diagnose-https.sh > diagnostics.txt`
2. Run: `docker compose logs > logs.txt`
3. Screenshot AWS Security Group rules
4. Share these files for help

## Emergency: Revert to HTTP

If you need to quickly go back to HTTP-only:

```bash
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name movieversebackend.jefin.xyz;
    location / {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        add_header Access-Control-Allow-Origin * always;
    }
}
EOF

docker compose restart nginx
```

Then use `http://` in your frontend instead of `https://`.
