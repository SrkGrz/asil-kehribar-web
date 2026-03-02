import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBh6b6ebwdIacRbnYi_XrU8lLPOYCz_L6I",
    authDomain: "asil-kehribar.firebaseapp.com",
    projectId: "asil-kehribar",
    storageBucket: "asil-kehribar.firebasestorage.app",
    messagingSenderId: "562469986210",
    appId: "1:562469986210:web:1ff65286ff2b46587b9cfb",
    measurementId: "G-MC5B4WEN6W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Create a secondary app for admin to create users without getting logged out
const secondaryApp = initializeApp(firebaseConfig, "Secondary");
export const secondaryAuth = getAuth(secondaryApp);
