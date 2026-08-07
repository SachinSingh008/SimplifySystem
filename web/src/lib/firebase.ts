import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-api-key-for-build-prerendering",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-auth-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock-storage-bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "mock-sender-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "mock-app-id",
};

// Prevent multiple initializations in Next.js dev (hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
const functionsRegion = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_REGION || undefined;
export const functions = getFunctions(app, functionsRegion);

// Connect to Local Firebase Emulators if configured
const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
const useFunctionsEmulatorOnly = process.env.NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR === "true";

if (typeof window !== "undefined") {
  if (useEmulators) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectStorageEmulator(storage, "127.0.0.1", 9199);
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
    console.log("🔥 Connected to all Local Firebase Emulators");
  } else if (useFunctionsEmulatorOnly) {
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
    console.log("🔥 Connected to local Functions emulator only (Firestore/Auth/Storage are using production cloud)");
  }
}

export default app;
