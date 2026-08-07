import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { validateString, validatePositiveNumber } from "../utils/validators";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const createProduct = functions.region("asia-south1").https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Sign in required.");
  }

  const userId = context.auth.uid;
  const { name, hsn, unit, price, gstPct } = data;

  if (!validateString(name, 200)) {
    throw new functions.https.HttpsError("invalid-argument", "Product name is required.");
  }
  if (!validatePositiveNumber(price)) {
    throw new functions.https.HttpsError("invalid-argument", "Valid price is required.");
  }

  const now = FieldValue.serverTimestamp();
  const ref = db.collection("products").doc();

  await ref.set({
    userId,
    name,
    hsn: hsn ?? "",
    unit: unit ?? "Nos",
    price,
    gstPct: gstPct ?? 18,
    createdAt: now,
  });

  return { success: true, productId: ref.id };
});
