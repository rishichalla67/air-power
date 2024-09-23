// src/firebase.js

// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Your web app's Firebase configuration
const app = firebase.initializeApp({
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
});

// Initialize Firestore
export const auth = app.auth();
export const db = app.firestore();
export default app;

export const getUserData = async (uid) => {
    try {
      const doc = await db.collection('users').doc(uid).get();
      if (doc.exists) {
        return doc.data();
      } else {
        console.log('No such document!');
        return null;
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
};