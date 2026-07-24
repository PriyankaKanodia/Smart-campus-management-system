# Smart Campus Enterprise ERP - Production Deployment Guide

This document outlines deployment configurations for Google Cloud Run, AWS Elastic Beanstalk / ECS, Docker containers, MongoDB Atlas, Cloudinary, AWS S3, and Nginx.

---

## 1. Environment Variables Configuration

Ensure the following variables are configured in your deployment environment or `.env` file:

```env
NODE_ENV="production"
PORT=3000
APP_URL="https://your-campus-domain.com"
MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/smart_campus?retryWrites=true&w=majority"
JWT_SECRET="e9a8f21c9a4b3d8e7f6a5b4c3d2e1f0a"
GEMINI_API_KEY="AIzaSyYourGeminiApiKey"

# Media & Document Storage
CLOUDINARY_CLOUD_NAME="smart-campus-cloud"
CLOUDINARY_API_KEY="1234567890"
CLOUDINARY_API_SECRET="your_cloudinary_secret"

AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
AWS_S3_BUCKET="smart-campus-transcripts"
```

---

## 2. Docker Container Deployment

### Build and Test Container Locally
```bash
docker build -t smart-campus-erp:1.2.0 .
docker run -p 3000:3000 --env-file .env smart-campus-erp:1.2.0
```

---

## 3. Deployment to Google Cloud Run

```bash
# Set GCP Project
gcloud config set project your-gcp-project-id

# Build container using Cloud Build
gcloud builds submit --tag gcr.io/your-gcp-project-id/smart-campus-erp

# Deploy to Cloud Run
gcloud run deploy smart-campus-erp \
  --image gcr.io/your-gcp-project-id/smart-campus-erp \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars MONGODB_URI="mongodb+srv://...",JWT_SECRET="..."
```

---

## 4. Nginx Reverse Proxy Setup

Deploy the included `nginx.conf` behind a domain with SSL certificates issued by Let's Encrypt:

```bash
sudo apt-get update
sudo apt-get install nginx certbot python3-certbot-nginx -y
sudo cp nginx.conf /etc/nginx/nginx.conf
sudo certbot --nginx -d campus.youruniversity.edu
sudo systemctl restart nginx
```

---

## 5. MongoDB Atlas Performance Tuning

1. **Indexes**: Ensure compound indexes are created on frequently queried fields:
   - `students`: `{ email: 1, studentId: 1, department: 1 }`
   - `courses`: `{ code: 1, department: 1 }`
   - `notices`: `{ createdAt: -1 }`
2. **Connection Pool Size**: Set `maxPoolSize=50` in `MONGODB_URI`.
