import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  // Replace with your actual Firebase config
  apiKey: "AIzaSyACr-juGDU8IJxo5fiOq2qgb8VDNQSyly8",
  authDomain: "task-flow-dd7d0.firebaseapp.com",
  projectId: "task-flow-dd7d0",
  storageBucket: "task-flow-dd7d0.firebasestorage.app",
  messagingSenderId: "118825442866",
  appId: "1:118825442866:web:a4acaa1b4a8fb33f5be62b",
  measurementId: "G-C2KMB9PW7V"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const analytics = getAnalytics(app);

