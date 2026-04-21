import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAr2HRvrSGtSEyWf2t1gMXFxlsWFg_0LJc",
  authDomain: "richdrop-acd2a.firebaseapp.com",
  projectId: "richdrop-acd2a",
  storageBucket: "richdrop-acd2a.firebasestorage.app",
  messagingSenderId: "Y469759034040",
  appId: "1:469759034040:web:dbb7cee0198e3b1a2faa4d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);