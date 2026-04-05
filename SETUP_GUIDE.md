# Firebase & GitHub Setup Checklist

## ✅ Phase 1: Local Setup (Before First Deployment)

### Step 1: Firebase Console Setup
- [ ] Go to [Firebase Console](https://console.firebase.google.com)
- [ ] Create a new Firebase project or use existing one
- [ ] Note your Project ID

### Step 2: Firebase Project Configuration
- [ ] Enable Hosting in Firebase Console
- [ ] Enable Authentication (if needed)
- [ ] Enable Firestore Database (if needed)
- [ ] Enable Storage (if needed)

### Step 3: Get Firebase Credentials
1. Go to Firebase Console → **Project Settings** (gear icon)
2. Click on **Service Accounts** tab
3. Scroll down and click **Generate New Private Key**
4. Save this JSON file securely

### Step 4: Local Firebase Configuration
```bash
# Terminal commands
npm run firebase:login

# Then authenticate with your Google account when prompted
```

### Step 5: Update Configuration Files
1. Edit **`.firebaserc`** and replace `your_firebase_project_id` with your actual Project ID
2. Update **`.env.local`** with your Firebase credentials from Project Settings:
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

### Step 6: Test Local Build
```bash
npm run build
```

---

## ✅ Phase 2: GitHub Repository Setup

### Step 1: Create GitHub Repository
- [ ] Go to [GitHub.com](https://github.com)
- [ ] Create a new repository: `insurance-management-monik-group`
- [ ] Initialize with README
- [ ] Set default branch to `main`

### Step 2: Push Code to GitHub
```bash
# Navigate to your project
cd c:\Users\Yasob\Desktop\insurance-management-monik-group

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: Set up Firebase and GitHub deployment"

# Add your GitHub repository origin
git remote add origin https://github.com/YOUR_USERNAME/insurance-management-monik-group.git

# Push to main branch
git branch -M main
git push -u origin main
```

---

## ✅ Phase 3: GitHub Secrets Configuration

### Step 1: Access GitHub Secrets
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each of the following:

### Step 2: Add Environment Secrets

| Secret Name | Value |
|------------|-------|
| `FIREBASE_API_KEY` | From `.env.local` |
| `FIREBASE_AUTH_DOMAIN` | From `.env.local` |
| `FIREBASE_PROJECT_ID` | From `.env.local` |
| `FIREBASE_STORAGE_BUCKET` | From `.env.local` |
| `FIREBASE_MESSAGING_SENDER_ID` | From `.env.local` |
| `FIREBASE_APP_ID` | From `.env.local` |
| `FIREBASE_MEASUREMENT_ID` | From `.env.local` (optional) |
| `GEMINI_API_KEY` | Your Gemini API key |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | **Entire JSON** from Step 4 above |

### Important: Service Account JSON
- Copy the entire service account JSON file contents
- Paste as `FIREBASE_SERVICE_ACCOUNT_JSON` (keep the entire structure)

---

## ✅ Phase 4: First Deployment

### Option A: Local Deployment (Manual)
```bash
npm run deploy:all
```

### Option B: GitHub Automatic Deployment
```bash
# Just push to main branch
git add .
git commit -m "Deploy to Firebase"
git push origin main

# Check GitHub Actions tab for deployment progress
```

---

## 📋 Verification Checklist

### After First Deployment:
- [ ] GitHub Actions workflow completed successfully
- [ ] Check **GitHub → Actions** tab for green checkmark
- [ ] Check **Firebase Console → Hosting** for deployment status
- [ ] Visit your Firebase URL to verify deployment
  - Format: `https://your-project-id.web.app`

### Ongoing Checks:
- [ ] Each `git push` to `main` triggers automatic deployment
- [ ] Pull requests show preview deployment URLs
- [ ] Firebase Console shows deployment history

---

## 🔧 Troubleshooting

### GitHub Actions Build Fails
```
Error: Cannot find environment variables
```
**Solution:** Verify all secrets are added on GitHub (Settings → Secrets)

### Firebase Deploy Fails
```
Error: Authentication denied
```
**Solution:** Check that `FIREBASE_SERVICE_ACCOUNT_JSON` secret contains the complete JSON

### Local Build Works, But GitHub Build Fails
1. Check GitHub Actions logs for detailed error
2. Verify `.env.local` matches GitHub secrets
3. Run `npm run build` locally and commit `dist` folder

---

## 📚 Useful Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy everything to Firebase
npm run deploy:all

# Deploy only hosting
npm run deploy:firebase

# Deploy Cloud Functions (if using)
npm run deploy:functions

# Check Firebase CLI status
firebase status
```

---

## 🌐 After Deployment

Your app will be live at:
```
https://your-project-id.web.app
https://your-project-id.firebaseapp.com
```

You can:
- View logs: Firebase Console → Hosting → Deployments
- Monitor traffic: Firebase Console → Hosting → Metrics
- Setup custom domain: Firebase Console → Hosting → Connect domain
- Manage DNS: Your domain registrar

---

## 📞 Need Help?

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Firebase CLI Docs](https://firebase.google.com/docs/cli)
