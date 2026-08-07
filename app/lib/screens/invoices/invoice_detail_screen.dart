import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';
import '../../core/helpers.dart';
import '../../providers/providers.dart';
import '../../models/models.dart';
import '../../widgets/common_widgets.dart';
import '../../services/functions_service.dart';
import 'invoice_pdf.dart';

class InvoiceDetailScreen extends ConsumerWidget {
  final String invoiceId;
  const InvoiceDetailScreen({super.key, required this.invoiceId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final invoiceAV = ref.watch(invoiceDetailProvider(invoiceId));

    return invoiceAV.when(
      loading: () => Scaffold(
        appBar: AppBar(title: const Text('Invoice')),
        body: const Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: Center(child: Text('Error: $e')),
      ),
      data: (inv) {
        if (inv == null) {
          return Scaffold(
            appBar: AppBar(),
            body: const Center(child: Text('Invoice not found')),
          );
        }
        return _InvoiceDetailView(inv: inv, ref: ref);
      },
    );
  }
}

class _InvoiceDetailView extends StatefulWidget {
  final Invoice inv;
  final WidgetRef ref;
  const _InvoiceDetailView({required this.inv, required this.ref});

  @override
  State<_InvoiceDetailView> createState() => _InvoiceDetailViewState();
}

class _InvoiceDetailViewState extends State<_InvoiceDetailView> {
  bool _updatingStatus = false;
  bool _exporting = false;

  Future<void> _updateStatus(String status) async {
    setState(() => _updatingStatus = true);
    try {
      final svc = FunctionsService();
      await svc.updateInvoiceStatus(widget.inv.id, status);
      if (mounted) {
        widget.ref.invalidate(invoiceDetailProvider(widget.inv.id));
        widget.ref.invalidate(invoicesProvider);
        showSnack(context, 'Status updated to $status');
      }
    } catch (e) {
      if (mounted) showSnack(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _updatingStatus = false);
    }
  }

  Future<void> _exportPdf() async {
    setState(() => _exporting = true);
    try {
      final business = widget.ref.read(businessProvider).value;
      await InvoicePdfExporter.export(widget.inv, business);
    } catch (e) {
      if (mounted) showSnack(context, 'PDF export failed: $e', error: true);
    } finally {
      if (mounted) setState(() => _exporting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final inv = widget.inv;
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: Text(inv.invoiceNumber),
        actions: [
          IconButton(
            icon: _exporting
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: AppColors.green600))
                : const Icon(Icons.picture_as_pdf_rounded),
            tooltip: 'Export PDF',
            onPressed: _exporting ? null : _exportPdf,
          ),
          IconButton(
            icon: const Icon(Icons.edit_rounded),
            tooltip: 'Edit',
            onPressed: () => context.push('/invoices/${inv.id}/edit'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
        children: [
          // Header card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.slate200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        inv.invoiceNumber,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: AppColors.slate900,
                        ),
                      ),
                    ),
                    StatusBadge(status: inv.status.name),
                  ],
                ),
                const SizedBox(height: 16),
                _DetailRow('Customer', inv.customerName),
                if (inv.customerGstin.isNotEmpty)
                  _DetailRow('GSTIN', inv.customerGstin, mono: true),
                _DetailRow('Date', formatDate(inv.createdAt)),
                if (inv.dueDate != null)
                  _DetailRow('Due Date', formatDate(inv.dueDate)),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Line items
          Container(
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.slate200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
                  child: Text(
                    'Line Items',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                      color: AppColors.slate900,
                    ),
                  ),
                ),
                const Divider(height: 1),
                ...inv.items.map((item) => Padding(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.name,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w600,
                                    fontSize: 13,
                                    color: AppColors.slate900,
                                  ),
                                ),
                                Text(
                                  '${item.qty} ${item.unit} × ₹${item.rate} @ ${item.gstPct}% GST',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: AppColors.slate500,
                                  ),
                                ),
                                if (item.hsn.isNotEmpty)
                                  Text(
                                    'HSN: ${item.hsn}',
                                    style: const TextStyle(
                                      fontSize: 10,
                                      color: AppColors.slate400,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          Text(
                            formatCurrency(item.amount),
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                              color: AppColors.slate900,
                            ),
                          ),
                        ],
                      ),
                    )),
                const SizedBox(height: 12),
                const Divider(height: 1),
                // Totals
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      _TotalRow('Subtotal', formatCurrency(inv.subtotal)),
                      if (inv.cgst > 0) _TotalRow('CGST', formatCurrency(inv.cgst)),
                      if (inv.sgst > 0) _TotalRow('SGST', formatCurrency(inv.sgst)),
                      if (inv.igst > 0) _TotalRow('IGST', formatCurrency(inv.igst)),
                      const Divider(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Total',
                            style: TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 16,
                              color: AppColors.slate900,
                            ),
                          ),
                          Text(
                            formatCurrency(inv.total),
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 18,
                              color: AppColors.green600,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Notes & Terms
          if (inv.notes.isNotEmpty || inv.terms.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.slate200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (inv.notes.isNotEmpty) ...[
                    const Text(
                      'Notes',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                        color: AppColors.slate900,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(inv.notes,
                        style: const TextStyle(
                            fontSize: 12, color: AppColors.slate600)),
                    const SizedBox(height: 12),
                  ],
                  if (inv.terms.isNotEmpty) ...[
                    const Text(
                      'Terms & Conditions',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                        color: AppColors.slate900,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(inv.terms,
                        style: const TextStyle(
                            fontSize: 12, color: AppColors.slate600)),
                  ],
                ],
              ),
            ),
          const SizedBox(height: 16),

          // Action buttons
          if (inv.status != InvoiceStatus.paid &&
              inv.status != InvoiceStatus.cancelled) ...[
            if (inv.status == InvoiceStatus.draft ||
                inv.status == InvoiceStatus.pending)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _updatingStatus ? null : () => _updateStatus('paid'),
                  icon: const Icon(Icons.check_circle_rounded),
                  label: const Text('Mark as Paid'),
                  style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.green600),
                ),
              ),
            const SizedBox(height: 10),
            if (inv.status == InvoiceStatus.draft)
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: _updatingStatus ? null : () => _updateStatus('pending'),
                  icon: const Icon(Icons.send_rounded, size: 18),
                  label: const Text('Mark as Pending'),
                ),
              ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: _updatingStatus ? null : () => _updateStatus('cancelled'),
                icon: const Icon(Icons.cancel_outlined, size: 18,
                    color: Color(0xFFDC2626)),
                label: const Text('Cancel Invoice',
                    style: TextStyle(color: Color(0xFFDC2626))),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFFDC2626)),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final bool mono;
  const _DetailRow(this.label, this.value, {this.mono = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 90,
            child: Text(
              label,
              style: const TextStyle(fontSize: 12, color: AppColors.slate500),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.slate900,
                fontFamily: mono ? 'monospace' : null,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TotalRow extends StatelessWidget {
  final String label;
  final String value;
  const _TotalRow(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
          Text(value,
              style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.slate700)),
        ],
      ),
    );
  }
}
