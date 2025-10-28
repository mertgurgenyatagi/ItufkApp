import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Replace with your Firebase project configuration
// To get this:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project (or select existing)
// 3. Go to Project Settings > General
// 4. Scroll down to "Your apps" and click the web icon (</>)
// 5. Copy the firebaseConfig object here
const firebaseConfig = {
  apiKey: "AIzaSyD86c1ituSkkOGzJtEmdroy1IijSre1FMI",
  authDomain: "itufk-app.firebaseapp.com",
  projectId: "itufk-app",
  storageBucket: "itufk-app.firebasestorage.app",
  messagingSenderId: "1061601948439",
  appId: "1:1061601948439:web:ac16b2d556b8444338bd52",
  measurementId: "G-7PVZ2KEGTY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

