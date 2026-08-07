import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import PDFDocument from "pdfkit";
import * as stream from "stream";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

export const generateInvoicePDF = functions
  .region("asia-south1")
  .runWith({ timeoutSeconds: 120, memory: "512MB" })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Sign in required.");
    }

    const userId = context.auth.uid;
    const { invoiceId } = data as { invoiceId: string };

    if (!invoiceId) {
      throw new functions.https.HttpsError("invalid-argument", "invoiceId is required.");
    }

    const invoiceDoc = await db.collection("invoices").doc(invoiceId).get();
    if (!invoiceDoc.exists || invoiceDoc.data()?.userId !== userId) {
      throw new functions.https.HttpsError("permission-denied", "Invoice not found or access denied.");
    }

    const invoice = invoiceDoc.data()!;
    const businessDoc = await db.collection("businesses").doc(userId).get();
    const business = businessDoc.data() ?? {};

    // Build PDF in memory
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];
    const passthrough = new stream.PassThrough();

    doc.pipe(passthrough);
    passthrough.on("data", (chunk) => chunks.push(chunk));

    // Header
    doc.fontSize(20).fillColor("#16a34a").text("SimplifySystems", 50, 50);
    doc.fontSize(10).fillColor("#6b7280").text("GST Invoice", 50, 75);
    doc.moveTo(50, 95).lineTo(545, 95).strokeColor("#e5e7eb").stroke();

    // Business info
    doc.fontSize(10).fillColor("#111827");
    doc.text(business.businessName ?? "Your Business", 50, 110);
    doc.text(business.address ?? "", 50, 125);
    if (business.gstin) doc.text(`GSTIN: ${business.gstin}`, 50, 140);

    // Invoice meta
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 350, 110);
    doc.text(`Status: ${invoice.status?.toUpperCase()}`, 350, 125);
    if (invoice.dueDate) doc.text(`Due: ${invoice.dueDate}`, 350, 140);

    doc.moveTo(50, 160).lineTo(545, 160).strokeColor("#e5e7eb").stroke();

    // Bill to
    doc.fontSize(9).fillColor("#6b7280").text("BILL TO", 50, 175);
    doc.fontSize(10).fillColor("#111827").text(invoice.customerName, 50, 190);
    if (invoice.customerGstin) doc.text(`GSTIN: ${invoice.customerGstin}`, 50, 205);

    // Line items table header
    let y = 240;
    doc.fontSize(8).fillColor("#6b7280");
    doc.text("ITEM", 50, y);
    doc.text("HSN", 220, y);
    doc.text("QTY", 280, y);
    doc.text("RATE", 330, y);
    doc.text("GST%", 390, y);
    doc.text("AMOUNT", 460, y, { width: 85, align: "right" });

    doc.moveTo(50, y + 15).lineTo(545, y + 15).strokeColor("#e5e7eb").stroke();
    y += 25;

    // Line items
    doc.fontSize(9).fillColor("#111827");
    for (const item of invoice.items ?? []) {
      doc.text(item.name ?? "", 50, y, { width: 160 });
      doc.text(item.hsn ?? "", 220, y);
      doc.text(String(item.qty ?? 0), 280, y);
      doc.text(`₹${(item.rate ?? 0).toFixed(2)}`, 330, y);
      doc.text(`${item.gstPct ?? 0}%`, 390, y);
      doc.text(`₹${(item.amount ?? 0).toFixed(2)}`, 460, y, { width: 85, align: "right" });
      y += 20;
    }

    doc.moveTo(50, y + 5).lineTo(545, y + 5).strokeColor("#e5e7eb").stroke();
    y += 20;

    // Totals
    const totals = [
      ["Subtotal", invoice.subtotal ?? 0],
      ["CGST", invoice.cgst ?? 0],
      ["SGST", invoice.sgst ?? 0],
      ["IGST", invoice.igst ?? 0],
    ];
    doc.fontSize(9).fillColor("#6b7280");
    for (const [label, val] of totals) {
      doc.text(String(label), 350, y);
      doc.text(`₹${Number(val).toFixed(2)}`, 460, y, { width: 85, align: "right" });
      y += 18;
    }

    doc.fontSize(11).fillColor("#16a34a").font("Helvetica-Bold");
    doc.text("TOTAL", 350, y);
    doc.text(`₹${(invoice.total ?? 0).toFixed(2)}`, 460, y, { width: 85, align: "right" });

    if (invoice.notes) {
      y += 40;
      doc.fontSize(9).fillColor("#6b7280").font("Helvetica").text("Notes:", 50, y);
      doc.fillColor("#374151").text(invoice.notes, 50, y + 14, { width: 495 });
    }

    doc.end();

    await new Promise<void>((resolve) => passthrough.on("end", resolve));
    const pdfBuffer = Buffer.concat(chunks);

    // Upload to Firebase Storage
    const bucket = storage.bucket();
    const fileName = `pdfs/${userId}/${invoiceId}.pdf`;
    const file = bucket.file(fileName);

    await file.save(pdfBuffer, {
      contentType: "application/pdf",
      metadata: { cacheControl: "private, max-age=3600" },
    });

    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { success: true, url };
  });
