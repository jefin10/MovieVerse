# Quick HTTPS Setup - TL;DR

## Prerequisites Check
- [ ] Domain `movieversebackend.jefin.xyz` points to `51.20.60.134`
- [ ] AWS Security Group allows ports 80, 443, 22
- [ ] SSH access to server

## Commands to Run on Server

```bash
# 1. SSH into your server
ssh -i your-key.pem ubuntu@51.20.60.134

# 2. Navigate to backend directory
cd /path/to/MovieVerseBackend

# 3. Stop existing containers
docker compose down

# 4. Edit email in setup script
nano init-letsencrypt.sh
# Change: EMAIL="your-email@example.com" to your real email
# Save: Ctrl+X, Y, Enter

# 5. Make script executable
chmod +x init-letsencrypt.sh

# 6. Run setup
./init-letsencrypt.sh

# 7. Test it works
curl https://movieversebackend.jefin.xyz/api/web/catalog/
```

## If Something Goes Wrong

```bash
# Check DNS
nslookup movieversebackend.jefin.xyz

# Check logs
docker compose logs nginx
docker compose logs certbot

# Restart everything
docker compose restart
```

## After HTTPS Works

Your frontend is already configured to use:
```
https://movieversebackend.jefin.xyz
```

Just restart your Next.js dev server if it's running.

## Certificate Auto-Renewal

The certbot container automatically renews certificates every 12 hours. No action needed!
