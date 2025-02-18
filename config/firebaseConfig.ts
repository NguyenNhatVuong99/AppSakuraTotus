import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase, ref, set, onValue } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyBzXaoY6ThSZw1w7zE18JHALc5gDjTRAcU",
    authDomain: "gpbl-2025.firebaseapp.com",
    databaseURL: "https://gpbl-2025-default-rtdb.firebaseio.com",
    projectId: "gpbl-2025",
    storageBucket: "gpbl-2025.firebasestorage.app",
    messagingSenderId: "228661684282",
    appId: "1:228661684282:web:25832ebd12daf02d882d03",
    measurementId: "G-66XT1D3YGD"
  };

// Ensure Firebase is initialized only once
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
// const db = getFirestore(app);
const db = getDatabase(app);

export { db };
