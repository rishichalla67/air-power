// src/firebase.js

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// Add other Firebase services here if needed

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAthKHvwC201jEQ8nY_SDkB-sMgTMLdDiE",
    authDomain: "hvac-2fdb7.firebaseapp.com",
    projectId: "hvac-2fdb7",
    storageBucket: "hvac-2fdb7.appspot.com",
    messagingSenderId: "760002849553",
    appId: "1:760002849553:web:4f6847bedc8dc0a73cfab0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const firestore = getFirestore(app);

// Export the initialized services
export { firestore };