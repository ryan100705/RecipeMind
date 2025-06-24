// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAVGyqVp4yPb3Ic9T5uhWG2tNefGZOSoww",
  authDomain: "login-for-recipe-mind.firebaseapp.com",
  projectId: "login-for-recipe-mind",
  storageBucket: "login-for-recipe-mind.firebasestorage.app",
  messagingSenderId: "131431087686",
  appId: "1:131431087686:web:3436fb33ec4caaf64e9447",
  measurementId: "G-36BLZ2ZWHZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);