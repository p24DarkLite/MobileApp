import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  initializeAuth, 
  getReactNativePersistence 
} from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyB59tU-h8XySOd7mONxJSY66q5UwvKQEGc",
  authDomain: "smartspend-80218.firebaseapp.com",
  projectId: "smartspend-80218",
  storageBucket: "smartspend-80218.firebasestorage.app",
  messagingSenderId: "970274804880",
  appId: "1:970274804880:web:f44eab7b718aabd5b2f415",
  measurementId: "G-K4MHXKVKXM"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;
if (getApps().length > 0) {
  try {
    auth = getAuth(app);
  } catch (_error) {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

const db = getFirestore(app);

export { auth, db };