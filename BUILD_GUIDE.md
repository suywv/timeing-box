# Build and Deployment Guide for Time Jewel

## Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **Expo CLI**:
   ```bash
   npm install -g @expo/cli
   ```

## Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm start
   # or
   expo start
   ```

3. **Run on Specific Platforms**:
   ```bash
   npm run android    # Android
   npm run ios        # iOS  
   npm run web        # Web
   ```

## Asset Generation

Before building for production, generate proper assets:

1. **Convert SVG Assets to PNG**:
   - Follow instructions in `assets/ASSET_GENERATION.md`
   - Use ImageMagick or online converters
   - Required files:
     - `icon.png` (1024x1024)
     - `adaptive-icon.png` (432x432)
     - `splash.png` (1080x1920)
     - `favicon.png` (32x32)

## Production Builds

### 1. Expo Build Service (EAS)

Install EAS CLI:
```bash
npm install -g eas-cli
```

Configure EAS:
```bash
eas build:configure
```

Build for both platforms:
```bash
eas build --platform all
```

Or build individually:
```bash
eas build --platform ios
eas build --platform android
```

### 2. Local Builds

**Android APK**:
```bash
expo build:android -t apk
```

**Android App Bundle** (recommended for Google Play):
```bash
expo build:android -t app-bundle
```

**iOS**:
```bash
expo build:ios
```

## App Store Submission

### Google Play Store

1. **Generate Upload Key** (first time only):
   ```bash
   keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
   ```

2. **Build AAB**:
   ```bash
   eas build --platform android --profile production
   ```

3. **Upload to Play Console**:
   - Go to [Google Play Console](https://play.google.com/console)
   - Create new app or select existing
   - Upload AAB file
   - Fill app details using `APP_STORE_DESCRIPTION.md`
   - Add screenshots
   - Submit for review

### Apple App Store

1. **Apple Developer Account** required

2. **Configure iOS Bundle ID**:
   - Must match `ios.bundleIdentifier` in `app.json`
   - Register in Apple Developer Portal

3. **Build IPA**:
   ```bash
   eas build --platform ios --profile production
   ```

4. **Upload to App Store Connect**:
   - Use Transporter app or Xcode
   - Fill app metadata using `APP_STORE_DESCRIPTION.md`
   - Add screenshots
   - Submit for review

## Testing

Run tests before deployment:
```bash
npm test
npm run test:coverage
```

## Environment Configuration

### Required Environment Variables (if any):
```bash
# Add to .env if needed
# Currently all configuration is in app.json
```

### Build Profiles (eas.json example):
```json
{
  "cli": {
    "version": ">= 2.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

## Troubleshooting

### Common Issues:

1. **Asset Problems**:
   - Ensure all required PNG assets exist
   - Check file sizes and dimensions
   - Verify paths in `app.json`

2. **Build Failures**:
   - Clear Expo cache: `expo r -c`
   - Check dependencies for compatibility
   - Verify bundle identifiers are unique

3. **Permission Issues**:
   - Android: Check `android.permissions` in `app.json`
   - iOS: Verify `NSMicrophoneUsageDescription` is set

## Post-Deployment

1. **Monitor Crash Reports** in respective console
2. **Track User Feedback** and reviews
3. **Plan Updates** based on user feedback
4. **Monitor Performance** metrics

## Versioning

Update version numbers in:
- `package.json` - `version`
- `app.json` - `expo.version`
- `app.json` - `expo.ios.buildNumber`
- `app.json` - `expo.android.versionCode`

## Legal Requirements

Ensure the following are accessible:
- Privacy Policy: `PRIVACY_POLICY.md`
- Terms of Service: `TERMS_OF_SERVICE.md`
- Link both in app store descriptions