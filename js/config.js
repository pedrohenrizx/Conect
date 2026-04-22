// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyC8TFitMZgSTmxTTIaeCznwN2CpzWoQ6Bc",
    authDomain: "booksdev-3de79.firebaseapp.com",
    databaseURL: "https://booksdev-3de79-default-rtdb.firebaseio.com",
    projectId: "booksdev-3de79",
    storageBucket: "booksdev-3de79.firebasestorage.app",
    messagingSenderId: "39273829148",
    appId: "1:39273829148:web:cbb6d02d4597025e09a0d9",
    measurementId: "G-5Q3BCRZEBZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app);

// Initialize Parse (Back4App)
Parse.initialize("3VHbajRu1XmG9nyEyuovKyhWwSn42W15cg5HAB5x", "A1LS4r3G87EGrtMw8z0qB5rD9dllBJl6YBWAMDg0"); // PASTE YOUR APP ID AND JAVASCRIPT KEY HERE
Parse.serverURL = 'https://parseapi.back4app.com/';

export { app, auth, provider, storage, Parse };
