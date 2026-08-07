import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../../models/models.dart';
import '../../core/helpers.dart';

class InvoicePdfExporter {
  static Future<void> export(Invoice inv, Business? business) async {
    final doc = pw.Document();

    final primaryColor = PdfColor.fromHex('#16A34A');
    final lightGreen   = PdfColor.fromHex('#F0FDF4');
    final slate900     = PdfColor.fromHex('#0F172A');
    final slate600     = PdfColor.fromHex('#475569');
    final slate200     = PdfColor.fromHex('#E2E8F0');
    final slate50      = PdfColor.fromHex('#F8FAFC');

    doc.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(40),
        build: (ctx) => [
          // ── Header ─────────────────────────────────────────────────────
          pw.Container(
            padding: const pw.EdgeInsets.all(20),
            decoration: pw.BoxDecoration(
              color: lightGreen,
              borderRadius: pw.BorderRadius.circular(8),
            ),
            child: pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.start,
                  children: [
                    pw.Text(
                      business?.businessName ?? 'Your Business',
                      style: pw.TextStyle(
                        fontSize: 18,
                        fontWeight: pw.FontWeight.bold,
                        color: slate900,
                      ),
                    ),
                    pw.SizedBox(height: 4),
                    if ((business?.address ?? '').isNotEmpty)
                      pw.Text(
                        business!.address,
                        style: pw.TextStyle(fontSize: 9, color: slate600),
                      ),
                    if ((business?.gstin ?? '').isNotEmpty)
                      pw.Text(
                        'GSTIN: ${business!.gstin}',
                        style: pw.TextStyle(fontSize: 9, color: slate600),
                      ),
                  ],
                ),
                pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.end,
                  children: [
                    pw.Text(
                      'INVOICE',
                      style: pw.TextStyle(
                        fontSize: 22,
                        fontWeight: pw.FontWeight.bold,
                        color: primaryColor,
                      ),
                    ),
                    pw.SizedBox(height: 4),
                    pw.Text(
                      inv.invoiceNumber,
                      style: pw.TextStyle(
                        fontSize: 13,
                        fontWeight: pw.FontWeight.bold,
                        color: slate900,
                      ),
                    ),
                    pw.Text(
                      'Date: ${formatDate(inv.createdAt)}',
                      style: pw.TextStyle(fontSize: 9, color: slate600),
                    ),
                    if (inv.dueDate != null)
                      pw.Text(
                        'Due: ${formatDate(inv.dueDate)}',
                        style: pw.TextStyle(fontSize: 9, color: slate600),
                      ),
                  ],
                ),
              ],
            ),
          ),
          pw.SizedBox(height: 20),

          // ── Bill To ─────────────────────────────────────────────────────
          pw.Container(
            padding: const pw.EdgeInsets.all(14),
            decoration: pw.BoxDecoration(
              border: pw.Border.all(color: slate200),
              borderRadius: pw.BorderRadius.circular(6),
            ),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Text(
                  'BILL TO',
                  style: pw.TextStyle(
                    fontSize: 9,
                    fontWeight: pw.FontWeight.bold,
                    color: slate600,
                    letterSpacing: 1,
                  ),
                ),
                pw.SizedBox(height: 6),
                pw.Text(
                  inv.customerName,
                  style: pw.TextStyle(
                    fontSize: 13,
                    fontWeight: pw.FontWeight.bold,
                    color: slate900,
                  ),
                ),
                if (inv.customerGstin.isNotEmpty)
                  pw.Text(
                    'GSTIN: ${inv.customerGstin}',
                    style: pw.TextStyle(fontSize: 9, color: slate600),
                  ),
              ],
            ),
          ),
          pw.SizedBox(height: 20),

          // ── Items table ─────────────────────────────────────────────────
          pw.Table(
            border: pw.TableBorder.all(color: slate200, width: 0.5),
            columnWidths: {
              0: const pw.FlexColumnWidth(4),
              1: const pw.FlexColumnWidth(1.2),
              2: const pw.FlexColumnWidth(1),
              3: const pw.FlexColumnWidth(1.2),
              4: const pw.FlexColumnWidth(1.5),
            },
            children: [
              // Header row
              pw.TableRow(
                decoration: pw.BoxDecoration(color: primaryColor),
                children: [
                  _thCell('Item / Description', color: PdfColors.white),
                  _thCell('HSN', color: PdfColors.white),
                  _thCell('Qty', color: PdfColors.white),
                  _thCell('Rate', color: PdfColors.white),
                  _thCell('Amount', color: PdfColors.white),
                ],
              ),
              // Data rows
              ...inv.items.asMap().entries.map((entry) {
                final i = entry.key;
                final item = entry.value;
                final bg = i.isEven ? PdfColors.white : slate50;
                return pw.TableRow(
                  decoration: pw.BoxDecoration(color: bg),
                  children: [
                    _tdCell('${item.name}\n${item.gstPct}% GST'),
                    _tdCell(item.hsn),
                    _tdCell('${item.qty} ${item.unit}'),
                    _tdCell('₹${item.rate.toStringAsFixed(2)}'),
                    _tdCell(formatCurrency(item.amount),
                        align: pw.TextAlign.right),
                  ],
                );
              }),
            ],
          ),
          pw.SizedBox(height: 16),

          // ── Totals ──────────────────────────────────────────────────────
          pw.Align(
            alignment: pw.Alignment.centerRight,
            child: pw.Container(
              width: 200,
              child: pw.Column(
                children: [
                  if (inv.cgst > 0 || inv.sgst > 0)
                    _totalRow('Subtotal', formatCurrency(inv.subtotal), slate600),
                  if (inv.cgst > 0)
                    _totalRow('CGST', formatCurrency(inv.cgst), slate600),
                  if (inv.sgst > 0)
                    _totalRow('SGST', formatCurrency(inv.sgst), slate600),
                  if (inv.igst > 0)
                    _totalRow('IGST', formatCurrency(inv.igst), slate600),
                  pw.Divider(color: slate200),
                  pw.Row(
                    mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                    children: [
                      pw.Text(
                        'TOTAL',
                        style: pw.TextStyle(
                          fontSize: 13,
                          fontWeight: pw.FontWeight.bold,
                          color: slate900,
                        ),
                      ),
                      pw.Text(
                        formatCurrency(inv.total),
                        style: pw.TextStyle(
                          fontSize: 15,
                          fontWeight: pw.FontWeight.bold,
                          color: primaryColor,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          pw.SizedBox(height: 20),

          // ── Notes ───────────────────────────────────────────────────────
          if (inv.notes.isNotEmpty) ...[
            pw.Text(
              'Notes',
              style: pw.TextStyle(
                fontSize: 10,
                fontWeight: pw.FontWeight.bold,
                color: slate900,
              ),
            ),
            pw.SizedBox(height: 4),
            pw.Text(inv.notes, style: pw.TextStyle(fontSize: 9, color: slate600)),
            pw.SizedBox(height: 12),
          ],

          // ── Terms ───────────────────────────────────────────────────────
          if (inv.terms.isNotEmpty) ...[
            pw.Text(
              'Terms & Conditions',
              style: pw.TextStyle(
                fontSize: 10,
                fontWeight: pw.FontWeight.bold,
                color: slate900,
              ),
            ),
            pw.SizedBox(height: 4),
            pw.Text(inv.terms,
                style: pw.TextStyle(fontSize: 9, color: slate600)),
          ],
        ],
        footer: (ctx) => pw.Container(
          alignment: pw.Alignment.centerRight,
          margin: const pw.EdgeInsets.only(top: 10),
          child: pw.Text(
            'Generated by SimplifySystems',
            style: pw.TextStyle(fontSize: 8, color: slate600),
          ),
        ),
      ),
    );

    await Printing.layoutPdf(
      onLayout: (format) => doc.save(),
      name: '${inv.invoiceNumber}.pdf',
    );
  }

  static pw.Widget _thCell(String text, {PdfColor? color}) => pw.Container(
        padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        child: pw.Text(
          text,
          style: pw.TextStyle(
            fontSize: 9,
            fontWeight: pw.FontWeight.bold,
            color: color ?? PdfColors.black,
          ),
        ),
      );

  static pw.Widget _tdCell(String text,
      {pw.TextAlign align = pw.TextAlign.left}) =>
      pw.Container(
        padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 7),
        child: pw.Text(
          text,
          textAlign: align,
          style: const pw.TextStyle(fontSize: 9),
        ),
      );

  static pw.Widget _totalRow(String label, String value, PdfColor color) =>
      pw.Row(
        mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
        children: [
          pw.Text(label,
              style: pw.TextStyle(fontSize: 10, color: color)),
          pw.Text(value,
              style: pw.TextStyle(fontSize: 10, color: color)),
        ],
      );
}
