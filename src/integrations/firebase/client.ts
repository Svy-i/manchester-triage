import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {

  apiKey: "AIzaSyAyKGjJoAdDuNxxuwVFVHIIusPAKFw_MN4",
  authDomain: "manchester-triagem.firebaseapp.com",
  projectId: "manchester-triagem",
  storageBucket: "manchester-triagem.firebasestorage.app",
  messagingSenderId: "749174716953",
  appId: "1:749174716953:web:01753bdf1d8f0211ae0888",
  measurementId: "G-W899BHE36P"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

