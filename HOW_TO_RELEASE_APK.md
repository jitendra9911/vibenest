# How to Release Your APK on GitHub

Your VibeNest download page is now configured to download the APK from GitHub Releases!

## 🚀 Create Your First Release (One-Time Setup)

Once your GitHub Actions build completes successfully, create a release tag:

### Step 1: Create a Version Tag

In the **Replit Shell**, run these commands:

```bash
git tag v1.0.0
```

```bash
git push origin v1.0.0
```

### Step 2: GitHub Automatically Creates the Release

Once you push the tag:
- ✅ GitHub Actions automatically triggers
- ✅ Builds a fresh APK
- ✅ Creates a GitHub Release at: https://github.com/jitendra9911/vibenest/releases
- ✅ Attaches the APK to the release
- ✅ Your download page link starts working! 🎉

**Wait ~5-10 minutes** for the build to complete.

### Step 3: Verify the Download Works

1. Go to your website: `https://your-replit-url.repl.co/download`
2. Click **"Download APK v1.0.0"**
3. The APK should download from GitHub!

---

## 🔄 Future Updates (Releasing New Versions)

When you make changes and want to release a new version:

```bash
# Update version number in the tag
git tag v1.0.1
git push origin v1.0.1
```

Then update the version in `client/src/pages/DownloadApp.tsx`:
- Change `v1.0.0` to `v1.0.1` in the download link
- Update the button text

---

## 📊 Version Numbering Guide

Use [Semantic Versioning](https://semver.org/):
- **v1.0.0** - First public release
- **v1.0.1** - Bug fixes
- **v1.1.0** - New features (backward compatible)
- **v2.0.0** - Major changes (breaking changes)

---

## ✅ Current Status

- ✅ GitHub workflow configured for releases
- ✅ Download page enabled and ready
- ⏳ Waiting for you to create v1.0.0 tag

**Next step:** Run the commands above to create your first release!

---

## 🎯 Quick Reference

```bash
# Check existing tags
git tag

# Create new release
git tag v1.0.1
git push origin v1.0.1

# Delete a tag (if needed)
git tag -d v1.0.0
git push origin --delete v1.0.0
```

---

## 🌐 Your Download Page

Once the release is created, users can download the APK from:
- Your website: https://your-website.com/download
- Direct GitHub link: https://github.com/jitendra9911/vibenest/releases/download/v1.0.0/app-debug.apk

Perfect for sharing on social media! 📱✨
