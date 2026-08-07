import * as admin from "firebase-admin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";

const db = admin.firestore();
const OTP_COLLECTION = "otpTokens";

export interface OtpRecord {
  hashedOtp: string;
  expiresAt: Date;
  attempts: number;
}

/**
 * Stores a hashed OTP in Firestore under `otpTokens/{email}`.
 */
export async function storeOtp(
  email: string,
  hashedOtp: string,
  expiresAt: Date
): Promise<void> {
  await db.collection(OTP_COLLECTION).doc(email).set({
    hashedOtp,
    expiresAt: Timestamp.fromDate(expiresAt),
    attempts: 0,
    createdAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Retrieves an OTP record from Firestore.
 * Returns null if not found.
 */
export async function getOtpRecord(email: string): Promise<OtpRecord | null> {
  const doc = await db.collection(OTP_COLLECTION).doc(email).get();

  if (!doc.exists) return null;

  const data = doc.data()!;
  return {
    hashedOtp: data.hashedOtp as string,
    expiresAt: (data.expiresAt as Timestamp).toDate(),
    attempts: data.attempts as number,
  };
}

/**
 * Deletes an OTP record after successful verification or expiry.
 */
export async function deleteOtpRecord(email: string): Promise<void> {
  await db.collection(OTP_COLLECTION).doc(email).delete();
}

/**
 * Increments the attempt counter for an OTP record.
 */
export async function incrementOtpAttempts(email: string): Promise<void> {
  await db.collection(OTP_COLLECTION).doc(email).update({
    attempts: FieldValue.increment(1),
  });
}
