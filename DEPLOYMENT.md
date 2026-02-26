# ResiHub — Deployment Guide

## Prerequisites
- Node.js 18+
- Firebase project with Authentication, Firestore, and Storage enabled

## Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in your Firebase config values in .env

# Start dev server
npm run dev
```

## Firebase Setup

### 1. Enable Services
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** → Email/Password provider
3. Enable **Cloud Firestore** → Start in test mode, then apply rules
4. Enable **Storage** → Start in test mode

### 2. Deploy Firestore Rules
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

### 3. Seed Sample Data
```bash
# Download service account key from Firebase Console
# Save as scripts/serviceAccountKey.json
npm install firebase-admin
node scripts/seed.js
```

### Sample Login Credentials (after seeding)
| Role     | Email                  | Password      |
|----------|------------------------|---------------|
| Admin    | admin@resihub.com      | Admin@123     |
| Resident | resident1@resihub.com  | Resident@123  |
| Resident | resident2@resihub.com  | Resident@123  |
| Security | security@resihub.com   | Security@123  |

---

## Deploy to Firebase Hosting

```bash
# Build production bundle
npm run build

# Initialize Firebase Hosting
firebase init hosting
# Set public directory to: dist
# Configure as single-page app: Yes

# Deploy
firebase deploy --only hosting
```

## Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, etc.
```

### Vercel Configuration
Add `vercel.json` to project root:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `yourproject.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `yourproject.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |
