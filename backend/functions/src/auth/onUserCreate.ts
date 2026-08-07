import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Trigger: fires when a new Firebase Auth user is created.
 * Creates default documents in `users/{uid}` and `businesses/{uid}`.
 */
export const onUserCreate = functions.region("asia-south1").auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL } = user;
  const now = FieldValue.serverTimestamp();

  const batch = db.batch();

  // Create user profile document
  const userRef = db.collection("users").doc(uid);
  batch.set(userRef, {
    email: email ?? null,
    displayName: displayName ?? null,
    photoURL: photoURL ?? null,
    plan: "free",
    createdAt: now,
  });

  // Create default business document
  const businessRef = db.collection("businesses").doc(uid);
  batch.set(businessRef, {
    businessName: "",
    address: "",
    gstin: "",
    pan: "",
    logoUrl: null,
    defaultGstRate: 18,
    invoicePrefix: "INV-",
    quotationPrefix: "QUO-",
    defaultTerms: "Payment due within 30 days.",
    upiId: "",
    updatedAt: now,
  });

  await batch.commit();

  functions.logger.info(`New user setup complete for uid: ${uid}`);
});
