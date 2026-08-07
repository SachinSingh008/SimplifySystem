import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const updateInvoice = functions.region("asia-south1").https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Sign in required.");
  }

  const userId = context.auth.uid;
  const { invoiceId, updates } = data as { invoiceId: string; updates: Record<string, unknown> };

  if (!invoiceId) {
    throw new functions.https.HttpsError("invalid-argument", "invoiceId is required.");
  }

  const ref = db.collection("invoices").doc(invoiceId);
  const doc = await ref.get();

  if (!doc.exists) {
    throw new functions.https.HttpsError("not-found", "Invoice not found.");
  }
  if (doc.data()?.userId !== userId) {
    throw new functions.https.HttpsError("permission-denied", "Access denied.");
  }

  // Strip protected fields from updates
  const { userId: _u, invoiceNumber: _n, createdAt: _c, ...safeUpdates } = updates as any;

  await ref.update({
    ...safeUpdates,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { success: true };
});
