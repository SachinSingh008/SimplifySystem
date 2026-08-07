import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCustomToken,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { auth, functions } from "./firebase";

// ── Google OAuth ───────────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.addScope("email");
  provider.addScope("profile");
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// ── Email OTP ─────────────────────────────────────────────────────────────────

export async function sendOtp(email: string): Promise<void> {
  const fn = httpsCallable(functions, "sendOtp");
  await fn({ email });
}

export async function verifyOtp(
  email: string,
  otp: string
): Promise<User> {
  const fn = httpsCallable<
    { email: string; otp: string },
    { customToken: string }
  >(functions, "verifyOtp");

  const result = await fn({ email, otp });
  const { customToken } = result.data;

  const userCredential = await signInWithCustomToken(auth, customToken);
  return userCredential.user;
}

// ── Sign Out ───────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// ── Auth State ────────────────────────────────────────────────────────────────

export function onAuthChange(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}
