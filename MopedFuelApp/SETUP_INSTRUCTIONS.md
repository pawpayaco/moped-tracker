# iOS App Setup Instructions

## Step 1: Create New Xcode Project

1. Open Xcode
2. Click "Create New Project" (or File → New → Project)
3. Select "iOS" → "App" → Click "Next"
4. Fill in:
   - **Product Name**: `MopedFuel`
   - **Team**: Select your Apple Developer account (or "None" for testing)
   - **Organization Identifier**: `com.yourname.moped` (or anything you want)
   - **Interface**: SwiftUI
   - **Language**: Swift
   - **Storage**: None
5. Choose a location to save (Desktop is fine)
6. Click "Create"

## Step 2: Replace Code Files

1. In Xcode's left sidebar (Navigator), you'll see:
   - `MopedFuelApp.swift`
   - `ContentView.swift`
   - `Assets.xcassets`

2. **Replace MopedFuelApp.swift**:
   - Click on it in Xcode
   - Delete all the code
   - Copy the contents from `MopedFuelApp/MopedFuelApp.swift`
   - Paste into Xcode

3. **Replace ContentView.swift**:
   - Click on it in Xcode
   - Delete all the code
   - Copy the contents from `MopedFuelApp/ContentView.swift`
   - Paste into Xcode
   - **IMPORTANT**: Replace `YOUR_VERCEL_URL_HERE` with your actual Vercel URL

## Step 3: Add Location Permissions

1. In Xcode, click on the project name at the top of the left sidebar (the blue icon)
2. Select the "MopedFuel" target
3. Click the "Info" tab
4. Right-click anywhere in the list and select "Add Row"
5. Add these two entries:
   - **Key**: `Privacy - Location When In Use Usage Description`
   - **Value**: `MopedFuel needs your location to find nearby gas stations`

   - **Key**: `Privacy - Location Always and When In Use Usage Description`
   - **Value**: `MopedFuel needs your location to find nearby gas stations`

## Step 4: Connect Your iPhone

1. Unlock your iPhone
2. Connect it to your Mac with a USB cable
3. If prompted on iPhone, tap "Trust This Computer"
4. In Xcode, at the top near the Play button, you'll see a device selector
5. Click it and select your iPhone from the list

## Step 5: Enable Developer Mode on iPhone

If this is your first time:
1. On your iPhone, go to Settings → Privacy & Security
2. Scroll down to "Developer Mode"
3. Toggle it ON
4. Restart your iPhone when prompted

## Step 6: Sign the App

1. In Xcode, click the project name (blue icon) in the sidebar
2. Select the "MopedFuel" target
3. Click "Signing & Capabilities" tab
4. Check "Automatically manage signing"
5. Under "Team", select your Apple ID
   - If you don't see your Apple ID, go to Xcode → Settings → Accounts and add it

## Step 7: Build and Run

1. Click the Play button (▶️) at the top left of Xcode
2. Xcode will build the app and install it on your iPhone
3. First time: You'll see "Untrusted Developer" on your iPhone
   - Go to Settings → General → VPN & Device Management
   - Tap your Apple ID
   - Tap "Trust"
4. Open the app on your iPhone!

## Troubleshooting

**"Failed to verify bitcode"**:
- Select project → Build Settings → Search "bitcode" → Set to "No"

**"Could not launch"**:
- Make sure your iPhone is unlocked
- Try unplugging and replugging your iPhone

**Web app doesn't load**:
- Check that you replaced `YOUR_VERCEL_URL_HERE` with your actual URL
- Make sure your Vercel deployment is working in a browser first

**Location not working**:
- Make sure you added the location permissions in Info.plist
- When the app first opens, tap "Allow" when it asks for location access

## Optional: Add App Icon

1. In Xcode, click `Assets.xcassets` in the sidebar
2. Click `AppIcon`
3. Drag and drop images of different sizes (you can use https://appicon.co to generate them)

---

**That's it! Your web app is now a native iOS app!** 🎉
