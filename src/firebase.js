// src/firebase.js

// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Your web app's Firebase configuration
const app = firebase.initializeApp({
    apiKey: "AIzaSyAthKHvwC201jEQ8nY_SDkB-sMgTMLdDiE",
    authDomain: "hvac-2fdb7.firebaseapp.com",
    projectId: "hvac-2fdb7",
    storageBucket: "hvac-2fdb7.appspot.com",
    messagingSenderId: "760002849553",
    appId: "1:760002849553:web:4f6847bedc8dc0a73cfab0"
});

// Initialize Firestore
export const auth = app.auth();
export const db = app.firestore();
export default app;