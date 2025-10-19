# How to Host Your Android APK for Download

Once you've built your VibeNest APK, here's how to make it downloadable from your website:

## Option 1: Host APK in Your Replit Project (Easiest)

1. **Build your APK** following the steps in `ANDROID_BUILD.md`

2. **Copy the APK** to your project's public folder:
   ```bash
   # After building, copy the APK:
   cp android/app/build/outputs/apk/debug/app-debug.apk dist/public/vibenest.apk
   
   # Or for release build:
   cp android/app/build/outputs/apk/release/app-release.apk dist/public/vibenest.apk
   ```

3. **Update the download page** (`client/src/pages/DownloadApp.tsx`):
   ```typescript
   // Change this line (around line 70):
   <Button 
     className="w-full gap-2 h-12 hover-elevate active-elevate-2"
     disabled  // REMOVE THIS
     data-testid="button-download-apk"
   >
   
   // To this:
   <a href="/vibenest.apk" download="VibeNest.apk">
     <Button 
       className="w-full gap-2 h-12 hover-elevate active-elevate-2"
       data-testid="button-download-apk"
     >
       <SiAndroid className="h-5 w-5" />
       Download APK (Latest Version)
     </Button>
   </a>
   ```

4. **Rebuild your web app**:
   ```bash
   npm run build
   ```

5. **Test**: Visit your website and click "Get App" → Download APK

## Option 2: Host on GitHub Releases (Professional)

1. **Create a GitHub repository** for your project (if not already)

2. **Build and create a release**:
   - Build your APK
   - Go to GitHub → Releases → Create new release
   - Upload the APK file
   - Copy the direct download URL

3. **Update the download page** with the GitHub release URL:
   ```typescript
   <a href="https://github.com/YOUR_USERNAME/vibenest/releases/download/v1.0.0/vibenest.apk" download>
     <Button className="w-full gap-2 h-12 hover-elevate active-elevate-2">
       <SiAndroid className="h-5 w-5" />
       Download APK v1.0.0
     </Button>
   </a>
   ```

## Option 3: Use Google Play Store (Recommended for Production)

For production apps, publish to the Google Play Store:

1. **Build a signed release APK** (see `ANDROID_BUILD.md`)

2. **Create a Google Play Developer account** ($25 one-time fee)
   - Visit: https://play.google.com/console

3. **Upload your app**:
   - Create new app
   - Fill in app details
   - Upload AAB (Android App Bundle)
   - Submit for review

4. **Update the download page** with Play Store link:
   ```typescript
   <a href="https://play.google.com/store/apps/details?id=com.vibenest.app" target="_blank">
     <Button className="w-full gap-2 h-12 hover-elevate active-elevate-2">
       <SiAndroid className="h-5 w-5" />
       Get it on Google Play
     </Button>
   </a>
   ```

## Quick Setup Script

Here's a script to automate copying the APK to your public folder:

```bash
#!/bin/bash
# save as: copy-apk.sh

# Build Android APK
cd android
./gradlew assembleDebug
cd ..

# Copy to public folder
mkdir -p dist/public
cp android/app/build/outputs/apk/debug/app-debug.apk dist/public/vibenest.apk

echo "✅ APK copied to dist/public/vibenest.apk"
echo "📱 File size: $(du -h dist/public/vibenest.apk | cut -f1)"
echo "🚀 Rebuild your web app with: npm run build"
```

Make it executable:
```bash
chmod +x copy-apk.sh
./copy-apk.sh
```

## Security Considerations

⚠️ **Important Notes:**

1. **APKs from outside Google Play** require users to enable "Install from Unknown Sources"
2. **Use HTTPS** when hosting APKs (Replit provides this automatically)
3. **Sign your APK** for release builds (prevents tampering)
4. **Version your APKs** - Include version numbers in filenames:
   - `vibenest-v1.0.0.apk`
   - `vibenest-v1.1.0.apk`

## Testing the Download

1. Visit your website on mobile
2. Click "Get App"
3. Click "Download APK"
4. Install and test the app

## Updating the App

When you make changes:

1. Update version in `android/app/build.gradle`:
   ```gradle
   versionCode 2
   versionName "1.1.0"
   ```

2. Rebuild: `cd android && ./gradlew assembleRelease`

3. Copy new APK to public folder

4. Users will need to reinstall to get the update

---

**Need help?** Check `ANDROID_BUILD.md` for building instructions!
