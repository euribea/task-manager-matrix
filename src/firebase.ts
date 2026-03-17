// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC1DeuPpHRWpuzargWXVRwSkRr6HJCQXYQ",
  authDomain: "fluxtask-app.firebaseapp.com",
  projectId: "fluxtask-app",
  storageBucket: "fluxtask-app.firebasestorage.app",
  messagingSenderId: "469105339982",
  appId: "1:469105339982:web:bd2f1cbedd56cf3c44dd1f",
  measurementId: "G-PB0PNG7CSC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
