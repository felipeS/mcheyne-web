# PWA Setup Guide for M'Cheyne Reading Plan

## Overview

This guide explains how to complete the PWA (Progressive Web App) setup for the M'Cheyne Reading Plan application.

## What's Already Implemented

✅ Web App Manifest (`public/manifest.json`)
✅ Service Worker (`public/sw.js`)
✅ Offline Page (`public/offline.html`)
✅ PWA Meta Tags (in `app/[locale]/layout.tsx`)
✅ Service Worker Registration Component
✅ PWA Install Prompt Component
✅ Icon Generation Scripts

## What You Need to Do

### 1. Generate App Icons

The PWA requires various icon sizes for different devices and platforms. We've created generators for you:

#### Option A: Use the HTML Generators (Recommended)

1. **Open `public/icons/generate-png-icons.html`** in your browser
2. Click the download button below each icon
3. Save each icon with the correct filename in the `public/icons/` directory:
   - `icon-16x16.png`
   - `icon-32x32.png`
   - `icon-72x72.png`
   - `icon-96x96.png`
   - `icon-128x128.png`
   - `icon-144x144.png`
   - `icon-152x152.png`
   - `icon-192x192.png`
   - `icon-384x384.png`
   - `icon-512x512.png`

#### Option B: Use the Favicon Generator

1. **Open `public/favicon-generator.html`** in your browser
2. Right-click on the icon and save as `favicon.ico`
3. Place it in the `public/` directory

### 2. Create Safari Pinned Tab Icon

The `safari-pinned-tab.svg` file has already been created in `public/icons/`.

### 3. Test the PWA

1. Build and run your application:

   ```bash
   npm run build
   npm start
   ```

2. Open the app in Chrome/Edge and look for the install prompt
3. Test offline functionality by:
   - Loading the app once (to cache it)
   - Going offline (DevTools → Network → Offline)
   - Refreshing the page

### 4. Test on Mobile Devices

1. Deploy to a hosting service (Vercel, Netlify, etc.)
2. Open the app on your mobile device
3. Look for the "Add to Home Screen" option:
   - **iOS Safari**: Share button → "Add to Home Screen"
   - **Android Chrome**: Menu → "Add to Home Screen"

## PWA Features

### Offline Support

- The service worker caches essential resources
- Users can access the app even without internet
- Offline page is shown for navigation requests

### Install Prompt

- Automatic install prompt appears when criteria are met
- Users can manually install via browser menu
- App appears as a native app on home screen

### App-like Experience

- Full-screen mode when launched from home screen
- Custom app icon and splash screen
- Native app behavior and appearance

## Troubleshooting

### Icons Not Showing

- Ensure all icon files are in the `public/icons/` directory
- Check that filenames match exactly with the manifest
- Verify file permissions

### Service Worker Not Working

- Check browser console for errors
- Ensure HTTPS (required for service workers)
- Clear browser cache and reload

### Install Prompt Not Appearing

- App must meet PWA criteria (HTTPS, valid manifest, service worker)
- User must not have already dismissed the prompt
- Check browser compatibility

## Browser Support

- **Chrome/Edge**: Full PWA support
- **Firefox**: Full PWA support
- **Safari**: Limited PWA support (iOS 11.3+)
- **Mobile Browsers**: Varies by platform

## Next Steps

1. Generate and save all required icons
2. Test the PWA functionality
3. Deploy to production
4. Test on actual mobile devices
5. Consider adding more offline features

## Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
