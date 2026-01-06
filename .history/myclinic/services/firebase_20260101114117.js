import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Configuration Firebase directe pour MyClinic
export const firebaseConfig = {
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
// Configuration explicite de la persistance avec AsyncStorage pour React Native
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);
export default app;
