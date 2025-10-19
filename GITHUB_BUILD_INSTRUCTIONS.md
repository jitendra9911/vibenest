# Build VibeNest Android APK with GitHub Actions 🚀

Your project is now set up to automatically build Android APKs using GitHub Actions (free cloud build service)!

## 📋 Prerequisites

1. A **GitHub account** (free) - Sign up at https://github.com
2. **Git installed** on your computer (or use Replit's Git features)

## 🚀 Step-by-Step Instructions

### Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Enter repository name: `vibenest` (or any name you like)
3. Set to **Public** or **Private** (your choice)
4. **DO NOT** initialize with README (we have existing code)
5. Click "Create repository"

### Step 2: Connect Your Replit Project to GitHub

**Option A: Using Replit's Git Panel (Easiest)**

1. In Replit, click the **Git** icon in the left sidebar
2. Click **"Connect to GitHub"**
3. Authorize Replit to access GitHub
4. Select your repository: `vibenest`
5. Click **"Push to GitHub"**

**Option B: Using Terminal Commands**

Run these commands in the Replit Shell:

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - VibeNest app with Android support"

# Add your GitHub repository (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/vibenest.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: GitHub Actions Builds Your APK Automatically!

Once you push to GitHub:

1. **GitHub Actions starts automatically**
2. It installs Android SDK
3. Builds your web app
4. Compiles the Android APK
5. **Takes about 5-10 minutes** ⏱️

### Step 4: Download Your APK

**Watch the Build:**
1. Go to your GitHub repository
2. Click the **"Actions"** tab at the top
3. You'll see "Build Android APK" workflow running
4. Wait for the green checkmark ✅

**Download the APK:**
1. Click on the completed workflow run
2. Scroll down to **"Artifacts"** section
3. Click **"vibenest-apk"** to download
4. Unzip the downloaded file
5. Inside you'll find: `app-debug.apk` 📱

### Step 5: Test Your APK

1. Transfer the APK to your Android phone
2. Open the APK file
3. Allow "Install from Unknown Sources" if prompted
4. Install and enjoy VibeNest! 🎉

## 🔄 Making Updates

Every time you want to build a new version:

**From Replit:**
1. Make your changes
2. Git panel → Commit changes
3. Push to GitHub
4. GitHub Actions builds automatically!

**From Command Line:**
```bash
git add .
git commit -m "Update: describe your changes"
git push
```

## 🏷️ Creating Releases (Optional)

To create a **proper release** with a download link:

1. **Tag a version** in Replit Shell:
```bash
git tag v1.0.0
git push origin v1.0.0
```

2. **GitHub automatically creates a release** with your APK attached!

3. **Share the download link:**
```
https://github.com/YOUR_USERNAME/vibenest/releases/download/v1.0.0/app-debug.apk
```

## 📥 Make APK Available on Your Website

Once you have the APK:

1. **Download the APK** from GitHub Actions
2. **Upload to your website:**

**Option A: Host in Replit**
```bash
# Copy APK to your public folder
cp /path/to/downloaded/app-debug.apk dist/public/vibenest.apk

# Rebuild
npm run build
```

**Option B: Use GitHub Releases**
   - Create a release (see above)
   - Use the GitHub release URL in your download page

3. **Update the download page** (`client/src/pages/DownloadApp.tsx`):

```typescript
// Find this section (around line 70) and change from:
<Button 
  className="w-full gap-2 h-12 hover-elevate active-elevate-2"
  disabled  // REMOVE THIS LINE
  data-testid="button-download-apk"
>

// To this:
<a href="/vibenest.apk" download="VibeNest.apk">
  <Button 
    className="w-full gap-2 h-12 hover-elevate active-elevate-2"
    data-testid="button-download-apk"
  >
    <SiAndroid className="h-5 w-5" />
    Download APK ({/* ADD VERSION HERE */})
  </Button>
</a>
```

## 🔧 Manual Build Trigger

You can trigger builds manually without pushing code:

1. Go to GitHub → **Actions** tab
2. Click **"Build Android APK"** workflow
3. Click **"Run workflow"** dropdown
4. Click green **"Run workflow"** button

## 📊 Build Status Badge (Optional)

Add a build status badge to show if builds are working:

Add to your `README.md`:
```markdown
![Build Status](https://github.com/YOUR_USERNAME/vibenest/actions/workflows/build-android.yml/badge.svg)
```

## ⚙️ Advanced: Build Signed Release APK

For Google Play Store, you need a **signed release APK**:

1. **Generate a keystore** (one time):
```bash
keytool -genkey -v -keystore vibenest-release.keystore \
  -alias vibenest -keyalg RSA -keysize 2048 -validity 10000
```

2. **Add secrets to GitHub:**
   - Go to GitHub repo → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `KEYSTORE_FILE` (base64 encoded keystore)
     - `KEYSTORE_PASSWORD`
     - `KEY_ALIAS`
     - `KEY_PASSWORD`

3. **Update workflow** to build release APK (I can help with this!)

## 🆘 Troubleshooting

**Build fails?**
- Check the Actions tab for error messages
- Make sure all files were pushed to GitHub
- Verify `android` folder exists in repository

**APK won't install?**
- Enable "Install from Unknown Sources" on Android
- Make sure it's the correct APK file

**Need help?**
- Check build logs in Actions tab
- Look for red ❌ markers
- Read the error messages

## 📝 Quick Reference

```bash
# Update and rebuild
git add .
git commit -m "Update app"
git push

# Create release
git tag v1.0.0
git push origin v1.0.0

# Download APK from:
# GitHub → Actions → Latest run → Artifacts
```

---

**That's it!** Your VibeNest Android app builds automatically in the cloud every time you push to GitHub! 🎉

**Next Steps:**
1. Push your code to GitHub
2. Wait 5-10 minutes
3. Download your APK
4. Install on Android phone
5. Share with the world! 🌍
