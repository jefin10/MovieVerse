# HTTPS Issue Resolution Guide

## Problem
The HTTPS connection to your AWS-hosted backend at `movieversebackend.jefin.xyz` is not working.

## Most Likely Causes

1. **AWS Security Group blocking ports** (90% of cases)
2. **SSL certificate not generated yet**
3. **DNS not propagated**
4. **nginx failing to start with SSL config**

## Quick Solution

### On Your AWS Server

```bash
# SSH into your server
ssh -i your-key.pem ec2-user@51.20.60.134

# Navigate to backend directory
cd /home/ec2-user/MovieVerseBackend

# Run the automated fix script
chmod +x fix-https.sh
./fix-https.sh
```

This script will:
1. Stop all containers
2. Configure nginx for HTTP-only mode
3. Request SSL certificate from Let's Encrypt
4. Switch to HTTPS configuration
5. Restart everything

## If That Doesn't Work

### Step 1: Check AWS Security Group

This is the most common issue!

1. Go to AWS Console → EC2 → Instances
2. Select your instance
3. Click "Security" tab
4. Click on the security group name
5. Click "Edit inbound rules"
6. Ensure these rules exist:

```
Type: HTTP
Protocol: TCP
Port: 80
Source: 0.0.0.0/0

Type: HTTPS
Protocol: TCP
Port: 443
Source: 0.0.0.0/0

Type: SSH
Protocol: TCP
Port: 22
Source: Your IP or 0.0.0.0/0
```

### Step 2: Verify DNS

```bash
nslookup movieversebackend.jefin.xyz
```

Should return: `51.20.60.134`

If not:
- Update your DNS A record at your domain registrar
- Point `movieversebackend.jefin.xyz` to `51.20.60.134`
- Wait 5-10 minutes for propagation

### Step 3: Run Diagnostics

```bash
cd /home/ec2-user/MovieVerseBackend
chmod +x diagnose-https.sh
./diagnose-https.sh
```

This will show you exactly what's wrong.

## Files Created for You

I've created several helper scripts in `MovieVerseBackend/`:

1. **fix-https.sh** - Automated fix (run this first!)
2. **diagnose-https.sh** - Diagnostic tool
3. **test-connection.sh** - Quick connection test
4. **HTTPS_FIX_README.md** - Quick start guide
5. **HTTPS_TROUBLESHOOTING.md** - Detailed troubleshooting

## Testing HTTPS

### From Your Server
```bash
curl https://movieversebackend.jefin.xyz/api/web/catalog/
```

### From Your Local Machine
```bash
curl https://movieversebackend.jefin.xyz/api/web/catalog/
```

### In Browser
Visit: https://movieversebackend.jefin.xyz/api/web/catalog/

## After HTTPS Works

### Update Frontend (Next.js Website)

Edit `movieverse-website/.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=https://movieversebackend.jefin.xyz
```

### Update Mobile App

Update the API base URL in your React Native app to use HTTPS.

## Common Issues & Solutions

### Issue: "Connection refused"
**Cause:** Ports blocked or containers not running
**Fix:** Check AWS Security Group and run `docker compose ps`

### Issue: "SSL certificate problem"
**Cause:** Certificate not generated
**Fix:** Run `./fix-https.sh`

### Issue: "Could not resolve host"
**Cause:** DNS not configured
**Fix:** Update DNS A record to point to `51.20.60.134`

### Issue: nginx keeps restarting
**Cause:** SSL config references non-existent certificates
**Fix:** Run `./fix-https.sh` which handles this properly

## Manual Process (If Scripts Fail)

See `MovieVerseBackend/HTTPS_TROUBLESHOOTING.md` for detailed manual steps.

## Certificate Renewal

Certificates auto-renew every 12 hours. No action needed!

To manually renew:
```bash
docker compose run --rm certbot renew
docker compose restart nginx
```

## Emergency Rollback to HTTP

If you need to quickly disable HTTPS:

```bash
cd /home/ec2-user/MovieVerseBackend

cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name movieversebackend.jefin.xyz;
    
    location / {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        add_header Access-Control-Allow-Origin * always;
    }
}
EOF

docker compose restart nginx
```

## Next Steps

1. Run `./fix-https.sh` on your server
2. Verify HTTPS works: `curl https://movieversebackend.jefin.xyz/api/web/catalog/`
3. Update frontend to use HTTPS URL
4. Test from your apps

## Need Help?

Run these and share the output:
```bash
./diagnose-https.sh > diagnostics.txt
docker compose logs > logs.txt
```

Also share:
- Screenshot of AWS Security Group rules
- Output of `nslookup movieversebackend.jefin.xyz`
