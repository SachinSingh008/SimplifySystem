import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { validateString } from "../utils/validators";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const createCustomer = functions.region("asia-south1").https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Sign in required.");
  }

  const userId = context.auth.uid;
  const { name, email, phone, address, gstin, pan } = data;

  if (!validateString(name, 200)) {
    throw new functions.https.HttpsError("invalid-argument", "Customer name is required.");
  }

  const now = FieldValue.serverTimestamp();
  const ref = db.collection("customers").doc();

  await ref.set({
    userId,
    name,
    email: email ?? null,
    phone: phone ?? null,
    address: address ?? null,
    gstin: gstin ?? null,
    pan: pan ?? null,
    totalBilled: 0,
    createdAt: now,
  });

  return { success: true, customerId: ref.id };
});
