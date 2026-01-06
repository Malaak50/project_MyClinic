import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuration Firebase directe pour MyClinic
const firebaseConfig = {
  apiKey: "AIzaSyDFUYRrPwtpMWK8u5dMvmcehzKyLzjze9k",
  authDomain: "myclinic1-a2159.firebaseapp.com",
  projectId: "myclinic1-a2159",
  storageBucket: "myclinic1-a2159.firebasestorage.app",
  messagingSenderId: "339632634080",
  appId: "1:339632634080:web:fccfcb81d1f2de39aaf885"
};

// Initialisation
const app = initializeApp(firebaseConfig);

// Services exportés pour l'usage dans l'app
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

