# 🚀 Quick Start: Build Your Android APK with GitHub

## ⚡ 3 Simple Steps

### 1️⃣ Create GitHub Repository
- Go to https://github.com/new
- Name it: `vibenest`
- Click "Create repository"
- **Don't** add README (we have code already)

### 2️⃣ Push Your Code

**In Replit Shell, run these commands:**

```bash
# Initialize git (if needed)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - VibeNest Android app"

# Connect to GitHub (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/vibenest.git

# Push
git branch -M main
git push -u origin main
```

### 3️⃣ Download Your APK

1. Go to: `https://github.com/YOUR_USERNAME/vibenest`
2. Click **"Actions"** tab
3. Wait for build to finish (~5-10 minutes) ✅
4. Click the completed workflow
5. Scroll to **"Artifacts"**
6. Download **"vibenest-apk"**
7. Unzip and find `app-debug.apk` 📱

## 📱 Install on Android

1. Transfer APK to your phone
2. Open the file
3. Allow "Install from Unknown Sources"
4. Install and enjoy! 🎉

## 🔄 Future Updates

Every time you make changes:
```bash
git add .
git commit -m "Your update message"
git push
```

GitHub builds a new APK automatically!

---

**Need detailed help?** See `GITHUB_BUILD_INSTRUCTIONS.md`

**First time using Git/GitHub?** That's okay! Follow the commands exactly as shown above, just replace `YOUR_USERNAME` with your actual GitHub username.
