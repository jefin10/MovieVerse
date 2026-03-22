# How to Remove Shorts Tab - Reload Instructions

The shorts tab has been commented out in the code, but you need to reload the app for changes to take effect.

## Option 1: Shake Device/Emulator and Reload
1. **Android Emulator**: Press `Ctrl + M` (Windows) or `Cmd + M` (Mac)
2. **iOS Simulator**: Press `Ctrl + Cmd + Z` (Mac)
3. **Physical Device**: Shake the device
4. Select "Reload" from the menu

## Option 2: Stop and Restart Metro
1. In your terminal where Metro is running, press `Ctrl + C` to stop
2. Clear cache and restart:
   ```bash
   cd MovieVerseApp
   npx expo start -c
   ```
3. Press `a` for Android or `i` for iOS

## Option 3: Clear Cache and Rebuild
```bash
cd MovieVerseApp
rm -rf node_modules/.cache
npx expo start -c
```

## Option 4: Full Clean (if above don't work)
```bash
cd MovieVerseApp
rm -rf node_modules
npm install
npx expo start -c
```

## Verify the Change
After reload, you should see only 4 tabs:
1. Home
2. Watchlist
3. Tinder
4. Mood

The "Shorts" tab should be gone.

## To Re-enable Shorts Later
Edit `MovieVerseApp/app/(tabs)/_layout.tsx` and uncomment lines 55-62:
```tsx
<Tabs.Screen
  name="shorts"
  options={{
    title: 'Shorts',
    tabBarIcon: ({ color, size }) => <Feather name="play-circle" color={color} size={size} />,
  }}
/>
```
