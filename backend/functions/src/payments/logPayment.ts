import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { validatePositiveNumber, validateString } from "../utils/validators";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const logPayment = functions.region("asia-south1").https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Sign in required.");
  }

  const userId = context.auth.uid;
  const { invoiceId, customerId, amount, mode, upiRef, date, notes } = data;

  if (!validateString(invoiceId, 100)) {
    throw new functions.https.HttpsError("invalid-argument", "invoiceId is required.");
  }
  if (!validatePositiveNumber(amount)) {
    throw new functions.https.HttpsError("invalid-argument", "Valid amount is required.");
  }

  const invoiceDoc = await db.collection("invoices").doc(invoiceId).get();
  if (!invoiceDoc.exists || invoiceDoc.data()?.userId !== userId) {
    throw new functions.https.HttpsError("permission-denied", "Invoice not found or access denied.");
  }

  const now = FieldValue.serverTimestamp();
  const paymentRef = db.collection("payments").doc();
  const batch = db.batch();

  batch.set(paymentRef, {
    userId,
    invoiceId,
    customerId: customerId ?? null,
    amount,
    mode: mode ?? "cash",
    upiRef: upiRef ?? null,
    date: date ?? new Date().toISOString(),
    notes: notes ?? "",
    createdAt: now,
  });

  batch.update(db.collection("invoices").doc(invoiceId), {
    status: "paid",
    paymentMode: mode ?? "cash",
    upiRef: upiRef ?? null,
    updatedAt: now,
  });

  if (customerId) {
    batch.update(db.collection("customers").doc(customerId), {
      totalBilled: FieldValue.increment(amount),
    });
  }

  await batch.commit();
  return { success: true, paymentId: paymentRef.id };
});
