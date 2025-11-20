# 🚀 Deploy InvestLeague to Fly.io - Complete Guide

## ✅ **You're Ready to Deploy!**

This app is **fully configured** for Fly.io deployment. Follow this guide to launch in ~15 minutes.

---

## 📋 **Prerequisites**

### 1. **Fly.io Account**
- Sign up at: https://fly.io/app/sign-up
- Free tier includes: 3 VMs, 3GB storage, 160GB bandwidth/month
- **Cost: $0/month for this app** (within free tier)

### 2. **Install Fly CLI**

**Mac:**
```bash
brew install flyctl
```

**Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Windows:**
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### 3. **Get API Keys**
- Alpha Vantage: https://www.alphavantage.co/support/#api-key (free)
- Generate a strong JWT secret: `openssl rand -base64 32`

---

## 🚀 **Deployment Steps**

### **Step 1: Login to Fly.io**

```bash
fly auth login
```

This opens your browser to authenticate.

---

### **Step 2: Navigate to Your Project**

```bash
cd fantasy-investment-app
```

---

### **Step 3: Launch the App**

```bash
fly launch
```

**Fly will ask you questions:**

```
? Choose an app name: investleague-yourname
? Choose a region: (select closest to you)
  • iad - Washington, D.C.
  • lax - Los Angeles
  • lhr - London
  • etc.

? Would you like to set up a Postgresql database? No
? Would you like to set up an Upstash Redis database? No
? Would you like to deploy now? No (we'll set secrets first)
```

**Important:**
- Choose a **unique app name** (e.g., `investleague-ryan`)
- Select region **closest to your users**
- Say **No** to databases (we're using SQLite initially)
- Say **No** to deploy (set secrets first)

---

### **Step 4: Set Environment Variables**

```bash
# Set your JWT secret (generate a strong one)
fly secrets set JWT_SECRET="your-super-secret-key-at-least-32-chars"

# Set your Alpha Vantage API key
fly secrets set ALPHA_VANTAGE_API_KEY="your-api-key-here"

# Verify secrets were set
fly secrets list
```

**Generate a strong JWT secret:**
```bash
openssl rand -base64 32
```

---

### **Step 5: Create Persistent Storage**

```bash
# Create a volume for the SQLite database
fly volumes create investleague_data --size 1
```

This ensures your database persists across deployments.

---

### **Step 6: Deploy!**

```bash
fly deploy
```

**This will:**
- Build your Docker image
- Push to Fly.io
- Start your application
- Run health checks

**Takes ~3-5 minutes** ⏱️

---

### **Step 7: Open Your App**

```bash
fly open
```

This opens your app in the browser! 🎉

**Your URL will be:**
```
https://investleague-yourname.fly.dev
```

---

## ✅ **Verify Deployment**

### **Check App Status**
```bash
fly status
```

You should see:
```
Instances
ID       VERSION  REGION  STATE   CHECKS  
abc123   v0       iad     started 1 total, 1 passing
```

### **Check Logs**
```bash
fly logs
```

Look for:
```
✅ Server running on port 8080
📊 Market data service initialized
🗄️  Database connected
```

### **Test the API**
```bash
curl https://investleague-yourname.fly.dev/api/health
```

Should return:
```json
{"status":"ok","timestamp":"2024-11-20T..."}
```

---

## 🎯 **Post-Deployment Setup**

### **1. Create Your Account**
1. Open your app URL
2. Click "Sign Up"
3. Register with your email

### **2. Create Your First League**
1. Click "Create League"
2. Fill in details
3. Get invite code

### **3. Share with Friends**
Send them:
- Your app URL: `https://investleague-yourname.fly.dev`
- Invite code: `ABC123XY`

---

## 🔧 **Useful Fly.io Commands**

### **View Logs**
```bash
fly logs                  # Recent logs
fly logs -f              # Follow logs (live)
```

### **Check Status**
```bash
fly status               # App status
fly dashboard           # Open web dashboard
```

### **Scale App**
```bash
fly scale count 2        # Run 2 instances
fly scale memory 512     # Use 512MB RAM
```

### **Update Environment Variables**
```bash
fly secrets set KEY=VALUE
fly secrets unset KEY
fly secrets list
```

### **Redeploy**
```bash
fly deploy               # Deploy after code changes
```

### **SSH into App**
```bash
fly ssh console          # Open terminal in app
```

### **View Database**
```bash
fly ssh console
cd /app/data
ls -la                   # See database file
```

---

## 💰 **Cost Breakdown**

### **Free Tier (What You Get)**
- ✅ 3 shared-cpu-1x VMs (256MB each)
- ✅ 3GB persistent volumes
- ✅ 160GB outbound bandwidth
- ✅ Free SSL certificates
- ✅ **Total: $0/month for this app**

### **Your App Uses**
- 1 VM (256MB) - **Free**
- 1GB volume - **Free**
- ~5GB bandwidth/month (50 users) - **Free**

### **If You Outgrow Free Tier**
- Extra VM: ~$2/month
- Extra storage: ~$0.15/GB/month
- Bandwidth: $0.02/GB over 160GB

**Estimated for 500 users: ~$10/month**

---

## 🔒 **Security Checklist**

After deployment, verify:

- [ ] HTTPS is working (automatic with Fly.io)
- [ ] JWT_SECRET is set to a strong value
- [ ] API key is set correctly
- [ ] Health check is passing
- [ ] Can create account
- [ ] Can login
- [ ] Can create league
- [ ] Can execute trades

---

## 🐛 **Troubleshooting**

### **Problem: App won't start**

**Check logs:**
```bash
fly logs
```

**Common issues:**
- Missing secrets → Set JWT_SECRET and ALPHA_VANTAGE_API_KEY
- Port mismatch → Ensure PORT=8080 in fly.toml
- Database error → Check volume is mounted

### **Problem: Health check failing**

**Test health endpoint:**
```bash
curl https://your-app.fly.dev/api/health
```

**Fix:**
- Ensure server is listening on PORT from env
- Check health check path in fly.toml

### **Problem: Database resets on deploy**

**Solution:**
- Volume should be created and mounted
- Check `fly volumes list`
- Verify mount point in fly.toml

### **Problem: API rate limits**

**Solutions:**
- Implement Redis caching
- Upgrade Alpha Vantage tier
- Use multiple API keys

---

## 📊 **Monitoring & Maintenance**

### **View Metrics**
```bash
fly dashboard
```

Shows:
- Request rate
- Response times
- Error rates
- Bandwidth usage

### **Set Up Alerts**
In Fly.io dashboard:
1. Go to Monitoring
2. Set up alerts for:
   - App crashes
   - High CPU usage
   - Low disk space

### **Backup Database**

**Manual backup:**
```bash
fly ssh console
cat /app/data/investleague.db > /tmp/backup.db
exit

fly ssh sftp get /tmp/backup.db ./local-backup.db
```

**Automated backups:**
- Upgrade to Fly Postgres (paid)
- Or use scheduled tasks to backup to S3

---

## 🚀 **Scaling Strategies**

### **For 10-100 Users**
- Current setup works perfectly
- Consider Redis for caching
- Monitor API usage

### **For 100-500 Users**
```bash
# Scale to 2 instances
fly scale count 2

# Increase memory
fly scale memory 512

# Add Redis
fly redis create
```

### **For 500+ Users**
- Upgrade to Fly Postgres
- Multiple regions
- Premium API tier
- CDN for static assets

---

## 🔄 **Updating Your App**

When you make code changes:

```bash
# 1. Test locally
npm run dev

# 2. Commit changes
git add .
git commit -m "Updated features"

# 3. Deploy to Fly.io
fly deploy

# 4. Verify
fly open
```

---

## 📱 **Custom Domain (Optional)**

### **Add Your Own Domain**

**1. Buy domain** (Namecheap, Google Domains, etc.)

**2. Add to Fly.io:**
```bash
fly certs add yourdomain.com
fly certs add www.yourdomain.com
```

**3. Update DNS** at your domain registrar:
```
A     @     fly-global-services-ipv4
AAAA  @     fly-global-services-ipv6
CNAME www   yourdomain.com
```

**4. Wait for DNS propagation** (~10 minutes to 48 hours)

**Your app will be at:** `https://yourdomain.com`

---

## ✅ **Deployment Checklist**

- [ ] Fly CLI installed
- [ ] Logged into Fly.io
- [ ] App name chosen
- [ ] Region selected
- [ ] JWT_SECRET set
- [ ] ALPHA_VANTAGE_API_KEY set
- [ ] Volume created
- [ ] App deployed
- [ ] Health check passing
- [ ] Can access via URL
- [ ] Can create account
- [ ] Can create league
- [ ] Friends can join
- [ ] Trading works

---

## 🎉 **You're Live!**

Once deployed, your app is:
- ✅ **Running 24/7** on Fly.io
- ✅ **Accessible worldwide** via HTTPS
- ✅ **Auto-scaling** as needed
- ✅ **Automatically healing** if crashes
- ✅ **Free** (within tier limits)

**Share your URL with friends and start competing!** 📈💰

---

## 📞 **Need Help?**

### **Fly.io Resources**
- Docs: https://fly.io/docs/
- Community: https://community.fly.io/
- Status: https://status.fly.io/

### **App Issues**
- Check logs: `fly logs`
- View dashboard: `fly dashboard`
- SSH into app: `fly ssh console`

### **Can't Figure It Out?**
Just ask - I can help troubleshoot! 🚀
