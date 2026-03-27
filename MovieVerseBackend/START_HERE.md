# 🚨 START HERE - HTTPS Fix

## The Problem

Your diagnostics show:
- ✓ DNS is correct (pointing to 51.20.60.134)
- ✗ Docker containers are NOT running
- ✗ Ports 80 and 443 are NOT listening
- ✗ No SSL certificate exists

## The Solution

Run this ONE command:

```bash
chmod +x simple-fix.sh && ./simple-fix.sh
```

This will:
1. Start your Docker containers
2. Get an SSL certificate from Let's Encrypt
3. Configure nginx for HTTPS
4. Test everything

## If That Fails

### Check 1: Is docker-compose installed?

```bash
docker-compose --version
```

If not installed:
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Check 2: AWS Security Group

This is the MOST COMMON issue!

1. Go to AWS Console → EC2 → Instances
2. Select your instance
3. Click "Security" tab
4. Click the security group name
5. Click "Edit inbound rules"
6. Make sure these exist:

```
Type: HTTP
Port: 80
Source: 0.0.0.0/0

Type: HTTPS
Port: 443
Source: 0.0.0.0/0
```

### Check 3: Test manually

```bash
# Start containers
docker-compose up -d

# Wait 30 seconds
sleep 30

# Check if running
docker-compose ps

# Test backend
curl http://localhost:8000/api/web/catalog/
```

## Quick Commands

### See what's running:
```bash
docker-compose ps
```

### View logs:
```bash
docker-compose logs backend
docker-compose logs nginx
```

### Restart everything:
```bash
docker-compose restart
```

### Stop everything:
```bash
docker-compose down
```

### Start everything:
```bash
docker-compose up -d
```

## After HTTPS Works

Update your frontend `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=https://movieversebackend.jefin.xyz
```

## Still Stuck?

Run diagnostics again:
```bash
./diagnose-https.sh
```

Share the output with me!
