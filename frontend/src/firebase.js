// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD95B0KOSiHUpptyJLajQfuG7knNGIx5HU",
  authDomain: "plms-e2f70.firebaseapp.com",
  databaseURL: "https://plms-e2f70-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "plms-e2f70",
  storageBucket: "plms-e2f70.firebasestorage.app",
  messagingSenderId: "193745647848",
  appId: "1:193745647848:web:3f259e589a6f3a6e2df15d",
  measurementId: "G-EPZ1ND16KK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); 
const db = getFirestore(app);

export { auth, db };