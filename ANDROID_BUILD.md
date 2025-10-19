# VibeNest - Android App Build Guide

Your VibeNest web app is now configured to build as an Android app using Capacitor! 🎉

## What's Been Set Up

✅ Capacitor installed and configured
✅ Android platform added
✅ Build configuration ready
✅ App ID: `com.vibenest.app`
✅ App Name: `VibeNest`

## How to Build the Android APK

### Option 1: Build on Replit (Recommended)

Since you're on Replit, you can build the APK using these steps:

1. **Build the web app:**
   ```bash
   npm run build
   ```

2. **Sync with Android:**
   ```bash
   npx cap sync android
   ```

3. **Open Android project:**
   ```bash
   npx cap open android
   ```
   
   Note: This will attempt to open Android Studio. On Replit, you may need to use a local machine with Android Studio installed.

### Option 2: Build Locally (If you have Android Studio)

1. Clone this project to your local machine
2. Install [Android Studio](https://developer.android.com/studio)
3. Run these commands:
   ```bash
   npm install
   npm run build
   npx cap sync android
   npx cap open android
   ```
4. In Android Studio:
   - Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - The APK will be in `android/app/build/outputs/apk/debug/`

### Option 3: Build APK via Command Line

If you have Android SDK installed:

```bash
cd android
./gradlew assembleDebug
```

The APK will be in `android/app/build/outputs/apk/debug/app-debug.apk`

## Making Updates to the Android App

Whenever you make changes to your web app:

1. **Build the web app:**
   ```bash
   npm run build
   ```

2. **Sync changes to Android:**
   ```bash
   npx cap sync android
   ```

3. **Rebuild the APK** using one of the methods above

## Publishing to Google Play Store

To publish your app to the Google Play Store:

1. **Create a release build:**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

2. **Sign the app:**
   - You'll need to create a keystore file
   - Follow [Google's signing guide](https://developer.android.com/studio/publish/app-signing)

3. **Upload to Play Console:**
   - Create a developer account at [Google Play Console](https://play.google.com/console)
   - Upload your AAB (Android App Bundle)
   - Fill in app details and submit for review

## App Configuration

The app configuration is in `capacitor.config.ts`:

```typescript
{
  appId: 'com.vibenest.app',      // Your unique app ID
  appName: 'VibeNest',            // App display name
  webDir: 'dist/public'           // Built web assets location
}
```

## Adding Native Features

You can add native Android features using Capacitor plugins:

```bash
# Example: Add camera support
npm install @capacitor/camera
npx cap sync android

# Example: Add push notifications
npm install @capacitor/push-notifications
npx cap sync android
```

Browse available plugins: https://capacitorjs.com/docs/plugins

## Testing the App

### On Android Emulator:
1. Open Android Studio
2. Create/start an Android Virtual Device (AVD)
3. Run the app from Android Studio

### On Physical Device:
1. Enable Developer Options on your Android phone
2. Enable USB Debugging
3. Connect via USB
4. Run from Android Studio or install the APK directly

## Troubleshooting

**Build fails?**
- Make sure you've run `npm run build` first
- Try `npx cap sync android` again

**App crashes on launch?**
- Check that your web app works in the browser first
- Review Android logs: `npx cap run android --livereload`

**Need to update dependencies?**
```bash
npm install
npx cap sync android
```

## Development Workflow

1. Make changes to your React app
2. Test in browser: `npm run dev`
3. Build for Android: `npm run build && npx cap sync android`
4. Test on device/emulator

## Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/studio)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)
- [Publishing Guide](https://capacitorjs.com/docs/deployment/publishing)

---

**Next Steps:**
1. Install Android Studio (if building locally)
2. Build your first APK
3. Test on an Android device
4. Customize app icon and splash screen
5. Publish to Google Play Store

Enjoy your VibeNest Android app! 🚀
