# Deployment Guide for IMRAS

This guide covers deploying IMRAS to production environments.

## Table of Contents
- [Pre-deployment Checklist](#pre-deployment-checklist)
- [Environment Setup](#environment-setup)
- [Database Configuration](#database-configuration)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Post-deployment](#post-deployment)

## Pre-deployment Checklist

### Security
- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET (min 32 characters)
- [ ] Set up MongoDB authentication
- [ ] Enable MongoDB SSL/TLS
- [ ] Configure CORS for your domain only
- [ ] Set NODE_ENV=production
- [ ] Remove all console.log statements (check with `grep -r "console.log" src/`)
- [ ] Review and update rate limits
- [ ] Set up HTTPS/SSL certificates

### Configuration
- [ ] Update all environment variables
- [ ] Configure email service (Gmail/SendGrid/etc.)
- [ ] Set proper FRONTEND_URL and CLIENT_URL
- [ ] Configure database connection string
- [ ] Set up backup strategy

### Code Quality
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Update all dependencies
- [ ] Test all features
- [ ] Review error handling
- [ ] Check mobile responsiveness

## Environment Setup

### Backend Environment Variables

Create `.env` file in backend directory:

```env
# Production Configuration
NODE_ENV=production
PORT=5000

# MongoDB (Use MongoDB Atlas or your hosted MongoDB)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/imras?retryWrites=true&w=majority

# JWT Configuration (GENERATE A STRONG RANDOM STRING)
JWT_SECRET=your-super-secret-random-string-min-32-characters-long
JWT_EXPIRE=7d

# CORS & URLs
CLIENT_URL=https://your-frontend-domain.com
FRONTEND_URL=https://your-frontend-domain.com

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

### Frontend Environment Variables

Create `.env.production` file in frontend directory:

```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

## Database Configuration

### MongoDB Atlas (Recommended)

1. **Create Account**: Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Create Cluster**:
   - Choose a provider (AWS/Google/Azure)
   - Select a region close to your users
   - Choose a tier (M0 free tier for testing)

3. **Configure Access**:
   ```bash
   # Add IP whitelist
   - Go to Network Access
   - Add IP Address (0.0.0.0/0 for testing, specific IPs for production)
   ```

4. **Create Database User**:
   - Go to Database Access
   - Add New Database User
   - Set username and strong password
   - Grant read/write permissions

5. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` and `<dbname>`

### Self-hosted MongoDB

For self-hosted MongoDB:

```bash
# Enable authentication
mongo
use admin
db.createUser({
  user: "imrasAdmin",
  pwd: "strong-password-here",
  roles: [{ role: "userAdminAnyDatabase", db: "admin" }]
})

# Enable SSL/TLS
# Edit /etc/mongod.conf
net:
  ssl:
    mode: requireSSL
    PEMKeyFile: /path/to/cert.pem
```

## Backend Deployment

### Option 1: Heroku

1. **Install Heroku CLI**
2. **Login**: `heroku login`
3. **Create App**:
   ```bash
   cd backend
   heroku create your-app-name
   ```

4. **Set Environment Variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret
   heroku config:set MONGODB_URI=your-connection-string
   # Set all other env variables
   ```

5. **Deploy**:
   ```bash
   git push heroku main
   ```

### Option 2: DigitalOcean/AWS/Azure

1. **Set up Ubuntu Server**

2. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PM2**:
   ```bash
   sudo npm install -g pm2
   ```

4. **Clone Repository**:
   ```bash
   git clone your-repo-url
   cd imras/backend
   npm install --production
   ```

5. **Create .env file** with production values

6. **Start with PM2**:
   ```bash
   pm2 start src/server.js --name imras-api
   pm2 startup
   pm2 save
   ```

7. **Set up Nginx as Reverse Proxy**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. **Set up SSL with Let's Encrypt**:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### Option 3: Railway/Render

These platforms offer easy deployment:

1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**: `npm i -g vercel`
2. **Deploy**:
   ```bash
   cd frontend
   vercel
   ```
3. **Set Environment Variables** in Vercel dashboard

### Option 2: Netlify

1. **Connect GitHub** repository
2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `build`
3. **Environment Variables**: Set in Netlify dashboard
4. **Deploy**

### Option 3: Traditional Hosting

1. **Build Production**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload** `build` folder to your web server

3. **Configure Web Server**:
   ```nginx
   # Nginx configuration
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/build;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

## Post-deployment

### Monitoring

1. **Set up logging**:
   ```javascript
   // Use winston or similar
   const winston = require('winston');
   ```

2. **Monitor server health**:
   - Use PM2 monitoring: `pm2 monit`
   - Set up uptime monitoring (UptimeRobot, Pingdom)

3. **Database backups**:
   ```bash
   # MongoDB Atlas has automatic backups
   # For self-hosted:
   mongodump --uri="mongodb://user:pass@host/dbname" --out=/backup/path
   ```

### Performance

1. **Enable compression** (already in code)
2. **Use CDN** for static assets
3. **Optimize images**
4. **Enable caching**

### Security Checklist

- [ ] HTTPS enabled
- [ ] Rate limiting active
- [ ] CORS configured properly
- [ ] Database authentication enabled
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Monitor logs for suspicious activity

### Testing Production

1. **Test all features**
2. **Check API endpoints**: `curl https://your-api.com/api/health`
3. **Test authentication flow**
4. **Verify email sending**
5. **Test on mobile devices**
6. **Check error handling**

### Maintenance

1. **Regular Updates**:
   ```bash
   npm update
   npm audit fix
   ```

2. **Monitor Logs**:
   ```bash
   pm2 logs
   ```

3. **Database Maintenance**:
   - Regular backups
   - Index optimization
   - Clean old data

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Verify CLIENT_URL in backend .env
   - Check REACT_APP_API_URL in frontend

2. **Database Connection**:
   - Verify MongoDB connection string
   - Check IP whitelist
   - Ensure database user has correct permissions

3. **Email Not Sending**:
   - Verify EMAIL_* environment variables
   - Check email service credentials
   - Review error logs

4. **502 Bad Gateway**:
   - Ensure backend is running
   - Check Nginx configuration
   - Verify proxy settings

## Support

For deployment issues:
- Check logs: `pm2 logs` or check platform logs
- Review environment variables
- Verify all services are running
- Check firewall settings

## Security Contacts

Report security issues to: [your-email@example.com]
