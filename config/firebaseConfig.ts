// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getStorage} from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "firegram-36827.firebaseapp.com",
  projectId: "firegram-36827",
  storageBucket: "firegram-36827.appspot.com",
  messagingSenderId: "268891081081",
  appId: "1:268891081081:web:a54399f7483b6e1f4d07a8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app)