# Deployment Guide: Firebase & GitHub

## Prerequisites

1. **Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project or select existing one
   - Enable required services: Hosting, Authentication, Firestore, Storage

2. **GitHub Repository**
   - Push your code to GitHub
   - Ensure `main` or `master` branch is your production branch

## Setup Instructions

### 1. Local Firebase Setup

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
npm run firebase:login

# Initialize Firebase in your project (if not already done)
npm run firebase:init
```

### 2. Set Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
GEMINI_API_KEY=your_gemini_key
```

Get these values from your Firebase Console under Project Settings.

### 3. GitHub Secrets Configuration

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Add the following secrets:

   | Secret Name | Value |
   |------------|-------|
   | `FIREBASE_API_KEY` | From Firebase Console |
   | `FIREBASE_AUTH_DOMAIN` | From Firebase Console |
   | `FIREBASE_PROJECT_ID` | From Firebase Console |
   | `FIREBASE_STORAGE_BUCKET` | From Firebase Console |
   | `FIREBASE_MESSAGING_SENDER_ID` | From Firebase Console |
   | `FIREBASE_APP_ID` | From Firebase Console |
   | `FIREBASE_MEASUREMENT_ID` | From Firebase Console |
   | `GEMINI_API_KEY` | Your Gemini API key |
   | `FIREBASE_SERVICE_ACCOUNT_JSON` | Service account JSON (see below) |

3. **Generate Service Account JSON:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Copy the entire JSON content
   - Paste it as `FIREBASE_SERVICE_ACCOUNT_JSON` secret on GitHub

### 4. Local Deployment

Deploy directly from your machine:

```bash
# Build and deploy everything
npm run deploy:all

# Deploy only hosting
npm run deploy:firebase

# Deploy only Cloud Functions (if using)
npm run deploy:functions
```

### 5. Automated GitHub Deployment

The workflow is configured to:
- Build on every push to `main`, `master`, or `develop` branches
- Deploy to live hosting on `main` branch push
- Deploy to preview channel on pull requests

Just commit and push your code:

```bash
git add .
git commit -m "Your message"
git push origin main
```

## GitHub Actions Workflow

The workflow file (`.github/workflows/deploy.yml`) automatically:

1. **Checkouts** your code
2. **Installs** dependencies using Node 20
3. **Builds** your project with Vite
4. **Deploys** to Firebase Hosting

### Monitoring Deployments

- Go to your GitHub repository → Actions tab
- Click on the workflow run to view build logs
- Check Firebase Console → Hosting to see deployment history

## Firebase Hosting Features

- Custom routing with SPA rewrite in `firebase.json`
- Automatic HTTPS
- Global CDN
- Environment-specific settings

## Troubleshooting

### Build Fails in GitHub Actions
- Check GitHub Actions logs for error messages
- Verify all environment variables are set correctly
- Ensure `npm run build` works locally first

### Deploy Fails
- Verify Firebase credentials (service account JSON)
- Check Firebase project has Hosting enabled
- Ensure you have sufficient quota in Firebase

### Preview Channels Not Working
- Make sure the service account has proper permissions
- Check Firebase Hosting settings

## Local Development

For local development without deployment:

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Build for production
npm run preview  # Preview production build locally
```

## References

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [GitHub Actions Firebase Deploy](https://firebase.google.com/docs/hosting/github-integration)
- [Vite Configuration](https://vitejs.dev/config/)
