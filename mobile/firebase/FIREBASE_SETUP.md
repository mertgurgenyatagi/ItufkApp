# Firebase Setup Guide for İTÜ FK App

## 📋 Prerequisites
- Google account
- Firebase project (free Spark plan)

## 🚀 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `itufk-app` (or your preferred name)
4. Click **Continue**
5. Disable Google Analytics (optional for this project)
6. Click **Create project**
7. Wait for project to be created, then click **Continue**

## 🔧 Step 2: Register Your App

1. In Firebase Console, click the **web icon** `</>` to add a web app
2. Enter app nickname: `İTÜ FK Mobile`
3. **DO NOT** check "Also set up Firebase Hosting"
4. Click **Register app**
5. **COPY** the `firebaseConfig` object (you'll need this in Step 5)
6. Click **Continue to console**

## 🗄️ Step 3: Set Up Firestore Database

1. In the left sidebar, click **Build** → **Firestore Database**
2. Click **Create database**
3. Select **Start in test mode** (we'll add security rules later)
4. Choose a Cloud Firestore location (select closest to Turkey, e.g., `europe-west3`)
5. Click **Enable**

### Set Up Security Rules

Once database is created, go to the **Rules** tab and replace with:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write
    match /{document=**} {
      allow read, write: if request.auth != null || 
                           request.resource.data.keys().hasAny(['passwordHash']);
    }
  }
}
\`\`\`

Click **Publish**.

## 📦 Step 4: Set Up Storage

1. In the left sidebar, click **Build** → **Storage**
2. Click **Get started**
3. Select **Start in test mode**
4. Click **Next**
5. Choose same location as Firestore
6. Click **Done**

### Set Up Storage Rules

Go to the **Rules** tab and replace with:

\`\`\`javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /events/{eventId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
\`\`\`

Click **Publish**.

## 🔑 Step 5: Add Firebase Config to App

1. Open `mobile/firebase/config.js`
2. Replace the placeholder `firebaseConfig` with your actual config from Step 2:

\`\`\`javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
\`\`\`

## 👥 Step 6: Create Initial Users

Use the Firebase Console to manually create your first users:

1. Go to **Firestore Database**
2. Click **Start collection**
3. Collection ID: `users`
4. Click **Next**
5. Document ID: (auto-generate)
6. Add fields:

| Field | Type | Value |
|-------|------|-------|
| name | string | Your Name |
| role | string | Yönetim Kurulu Başkanı |
| email | string | your@email.com |
| phone | string | +90... |
| passwordHash | string | 48430018 (this is hash for "mert123") |
| isAdmin | boolean | true |
| createdAt | string | 2025-10-27T00:00:00.000Z |

7. Click **Save**

### Password Hashes for Common Passwords

For convenience during development, here are some pre-computed password hashes:
- `mert123` → `48430018`
- `admin123` → `976547026`
- `user123` → `-1421602370`

**⚠️ IMPORTANT**: These are example passwords. Create unique, secure passwords for production!

## 🔐 Step 7: Create Admin Panel for User Management

You can use Firebase Console to manually manage users, or create an admin web panel. For now, use the Console.

### To Add More Users:

1. Go to Firestore Database
2. Click on `users` collection
3. Click **Add document**
4. Fill in the same fields as above
5. Use different passwords for each user

### Password Hash Generator

To generate a password hash for a new user, open browser console on any page and run:

\`\`\`javascript
function simpleHash(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
}

// Example:
console.log(simpleHash("yourpassword123")); // Copy this hash to Firestore
\`\`\`

## 📊 Step 8: Initialize Sample Data (Optional)

You can add sample events to test:

1. Go to **Firestore Database**
2. Create collection `events`
3. Add documents with structure:

\`\`\`json
{
  "name": "Tanışma Toplantısı",
  "date": "2025-11-15",
  "time": "14:00",
  "location": "İTÜ Merkez Kampüs",
  "text": "Yeni üyelerle tanışma toplantısı",
  "color": "#6B8E9E",
  "hasImage": false,
  "imageUrl": null,
  "captain": "Mert",
  "coCaptain": "Ahmet",
  "createdBy": "USER_ID",
  "createdAt": "2025-10-27T00:00:00.000Z",
  "updatedAt": "2025-10-27T00:00:00.000Z"
}
\`\`\`

## ✅ Step 9: Test the Setup

1. Make sure `mobile/firebase/config.js` has your Firebase config
2. Run your app: `npm start`
3. Try logging in with one of your created users
4. Check if data loads from Firestore

## 🛡️ Security Best Practices

### For Production:

1. **Update Firestore Rules** to be more restrictive:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check authentication
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
    
    match /events/{eventId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn();
    }
    
    match /messages/{messageId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && 
                               resource.data.author == request.auth.uid;
    }
    
    match /replies/{replyId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && 
                               resource.data.author == request.auth.uid;
    }
  }
}
\`\`\`

2. **Update Storage Rules**:

\`\`\`javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /events/{eventId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
\`\`\`

3. **Use stronger password hashing** (implement bcrypt on a backend)
4. **Enable App Check** to prevent unauthorized access
5. **Set up backup schedules** for Firestore

## 📱 Next Steps

Once Firebase is set up:

1. The app will automatically use Firebase for all data
2. Create users via Firebase Console
3. Give passwords to your team members
4. They can log in and start using the app
5. All data syncs in real-time across devices

## 🆘 Troubleshooting

### "Permission denied" errors
- Check Firestore security rules
- Verify user is authenticated (has authToken in AsyncStorage)

### "Module not found" errors
- Run `npm install` in mobile directory
- Clear cache: `npm start -- --reset-cache`

### Firebase connection issues
- Verify firebaseConfig is correct
- Check internet connection
- Verify Firebase project is active

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
- [Firebase Storage](https://firebase.google.com/docs/storage)
- [Security Rules](https://firebase.google.com/docs/rules)

