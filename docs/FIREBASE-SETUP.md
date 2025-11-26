# Firebase Configuration Guide for Online Bingo

This document explains how to set up Firebase Realtime Database for the online multiplayer bingo feature.

## Prerequisites

- A Google/Gmail account
- Access to [Firebase Console](https://console.firebase.google.com/)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `bingo-musical` (or your preferred name)
4. Accept terms and click "Continue"
5. Disable Google Analytics (optional for this project)
6. Click "Create project"
7. Wait for project creation, then click "Continue"

## Step 2: Add Web App

1. In your Firebase project overview, click the **Web** icon (`</>`)
2. Register your app:
   - App nickname: `Bingo Musical Online`
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"
3. Copy the Firebase configuration object (you'll need this in Step 4)
4. Click "Continue to console"

## Step 3: Enable Realtime Database

1. In the left sidebar, click "Realtime Database"
2. Click "Create Database"
3. Select location closest to your users (e.g., `us-central1` or `europe-west1`)
4. Start in **test mode** for development (you can secure it later)
5. Click "Enable"

### Security Rules (for production)

For production, update the security rules to:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        "players": {
          "$playerId": {
            ".write": "$playerId === auth.uid || $playerId === newData.child('id').val()"
          }
        },
        "markedSongs": {
          ".write": "data.parent().child('hostId').val() === auth.uid || data.parent().child('hostId').val() === newData.parent().child('hostId').val()"
        },
        "gameStarted": {
          ".write": "data.parent().child('hostId').val() === auth.uid || data.parent().child('hostId').val() === newData.parent().child('hostId').val()"
        },
        "gameEnded": {
          ".write": "data.parent().child('hostId').val() === auth.uid || data.parent().child('hostId').val() === newData.parent().child('hostId').val()"
        }
      }
    }
  }
}
```

For development/testing, you can use open rules (NOT RECOMMENDED for production):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

## Step 4: Update Firebase Configuration

Edit `/assets/js/online.js` and replace the placeholder configuration with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

You can find these values:
1. Go to Firebase Console → Project Settings (gear icon)
2. Scroll down to "Your apps" → Web apps
3. Click the app you created
4. Copy the config values from the "SDK setup and configuration" section

## Step 5: Test Your Setup

1. Open `online.html` in your browser (use a local server)
2. Click "Crear Sala"
3. Select a category
4. You should see a room code displayed
5. Open the same page in another browser/tab
6. Enter the room code to join
7. Verify that both views update in real-time

## Step 6: Verify Data in Firebase Console

1. Go to Firebase Console → Realtime Database
2. You should see a `rooms` node with your test room data
3. Expand to see players, songs, and game state

## Database Structure

The database will have this structure:

```
rooms/
  └── ABC123/  (room code)
      ├── code: "ABC123"
      ├── hostId: "abc123xyz"
      ├── category: "Navidad"
      ├── songs: ["Song 1", "Song 2", ...]
      ├── markedSongs: ["Song 1", ...]
      ├── gameStarted: true
      ├── gameEnded: false
      ├── winner: null
      ├── createdAt: 1234567890
      └── players/
          ├── player1Id/
          │   ├── id: "player1Id"
          │   ├── name: "Player 1"
          │   ├── avatar: "😀"
          │   ├── card: ["Song 1", "Song 3", ...]
          │   ├── markedSongs: ["Song 1", ...]
          │   ├── hasBingo: false
          │   └── joinedAt: 1234567890
          └── player2Id/
              └── ...
```

## Cleanup Old Rooms

Firebase free tier has storage limits. You may want to automatically clean up old rooms:

### Option 1: Manual Cleanup
Go to Firebase Console → Realtime Database and delete old room nodes manually.

### Option 2: Cloud Function (requires Blaze plan)
Create a Cloud Function to delete rooms older than 24 hours:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.cleanupOldRooms = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const db = admin.database();
    const now = Date.now();
    const cutoff = now - 24 * 60 * 60 * 1000; // 24 hours ago

    const roomsRef = db.ref('rooms');
    const snapshot = await roomsRef.once('value');
    const rooms = snapshot.val();

    const deletions = [];
    for (const [roomCode, roomData] of Object.entries(rooms || {})) {
      if (roomData.createdAt < cutoff) {
        deletions.push(roomsRef.child(roomCode).remove());
      }
    }

    await Promise.all(deletions);
    console.log(`Deleted ${deletions.length} old rooms`);
  });
```

## Free Tier Limits

Firebase Realtime Database free tier ("Spark" plan):
- **1 GB stored data**
- **10 GB/month downloaded**
- **100 simultaneous connections**

This should be sufficient for moderate traffic. Monitor usage in Firebase Console → Usage tab.

## Troubleshooting

### "Permission denied" errors
- Check that Realtime Database rules allow reads/writes
- For testing, use open rules (see Step 3)
- For production, implement proper security rules

### "Firebase not initialized" errors
- Verify your firebaseConfig is correct
- Check that Firebase SDK scripts are loaded in `online.html`
- Check browser console for specific error messages

### Room not found
- Verify room code is correct (case-sensitive)
- Check that room wasn't deleted
- Look in Firebase Console to verify room exists

### Players not seeing updates
- Check browser console for errors
- Verify internet connection
- Test with Firebase Console data viewer (watch in real-time)

## Next Steps

1. ✅ Set up Firebase project
2. ✅ Enable Realtime Database
3. ✅ Update configuration in code
4. ✅ Test functionality
5. 🔒 Secure database rules for production
6. 📊 Monitor usage in Firebase Console
7. 🧹 Set up automatic room cleanup (optional)

## Support

For issues specific to Firebase setup:
- [Firebase Documentation](https://firebase.google.com/docs/database)
- [Firebase Community](https://firebase.google.com/community)

For issues with the bingo game:
- Check browser console for errors
- Review `/assets/js/online.js` code
- Test with multiple browsers/devices
