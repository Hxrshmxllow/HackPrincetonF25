import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAZTYHqTVVhu2gwaENy93cQsm8L-91WObg",
  authDomain: "hackprinceton-d2127.firebaseapp.com",
  projectId: "hackprinceton-d2127",
  storageBucket: "hackprinceton-d2127.firebasestorage.app",
  messagingSenderId: "718707146975",
  appId: "1:718707146975:web:6645c28ce1c2a25b45296a",
  measurementId: "G-38MX5LYVFE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics (only in browser, with error handling)
if (typeof window !== 'undefined') {
  try {
    getAnalytics(app);
  } catch (err) {
    console.warn('Analytics initialization failed:', err);
  }
}

