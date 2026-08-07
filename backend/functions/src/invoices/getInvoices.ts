import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const getInvoices = functions.region("asia-south1").https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Sign in required.");
  }

  const userId = context.auth.uid;
  const { status, limit = 50, startAfter } = data as {
    status?: string;
    limit?: number;
    startAfter?: string;
  };

  let query: admin.firestore.Query = db
    .collection("invoices")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(Math.min(limit, 100));

  if (status) {
    query = db
      .collection("invoices")
      .where("userId", "==", userId)
      .where("status", "==", status)
      .orderBy("createdAt", "desc")
      .limit(Math.min(limit, 100));
  }

  if (startAfter) {
    const cursorDoc = await db.collection("invoices").doc(startAfter).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }

  const snapshot = await query.get();
  const invoices = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? null,
    updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() ?? null,
  }));

  return { success: true, invoices };
});
