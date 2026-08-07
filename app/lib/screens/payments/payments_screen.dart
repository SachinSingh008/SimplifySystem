import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../core/helpers.dart';
import '../../providers/providers.dart';
import '../../models/models.dart';
import '../../widgets/common_widgets.dart';
import '../../services/functions_service.dart';

class PaymentsScreen extends ConsumerWidget {
  const PaymentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final paymentsAV = ref.watch(paymentsProvider);
    final invoicesAV = ref.watch(invoicesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Payments'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showRecordDialog(context, ref, invoicesAV.value ?? []),
          ),
        ],
      ),
      body: paymentsAV.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (payments) {
          if (payments.isEmpty) {
            return EmptyState(
              icon: Icons.payments_rounded,
              title: 'No payments recorded',
              subtitle: 'Record a payment against an invoice',
              actionLabel: 'Record Payment',
              onAction: () =>
                  _showRecordDialog(context, ref, invoicesAV.value ?? []),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
            itemCount: payments.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (_, i) => _PaymentCard(payment: payments[i]),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () =>
            _showRecordDialog(context, ref, invoicesAV.value ?? []),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showRecordDialog(
      BuildContext context, WidgetRef ref, List<Invoice> invoices) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _RecordPaymentSheet(ref: ref, invoices: invoices),
    );
  }
}

class _PaymentCard extends StatelessWidget {
  final Payment payment;
  const _PaymentCard({required this.payment});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.slate200),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.green100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.payments_rounded, color: AppColors.green600, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  payment.mode.name.toUpperCase(),
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                    color: AppColors.slate900,
                  ),
                ),
                Text(
                  formatDate(payment.date),
                  style: const TextStyle(fontSize: 11, color: AppColors.slate500),
                ),
                if (payment.notes.isNotEmpty)
                  Text(payment.notes,
                      style: const TextStyle(fontSize: 11, color: AppColors.slate400)),
              ],
            ),
          ),
          Text(
            formatCurrency(payment.amount),
            style: const TextStyle(
              fontWeight: FontWeight.w800,
              fontSize: 16,
              color: AppColors.green600,
            ),
          ),
        ],
      ),
    );
  }
}

class _RecordPaymentSheet extends StatefulWidget {
  final WidgetRef ref;
  final List<Invoice> invoices;
  const _RecordPaymentSheet({required this.ref, required this.invoices});

  @override
  State<_RecordPaymentSheet> createState() => _RecordPaymentSheetState();
}

class _RecordPaymentSheetState extends State<_RecordPaymentSheet> {
  final _formKey = GlobalKey<FormState>();
  final _amtCtrl  = TextEditingController();
  final _refCtrl  = TextEditingController();
  final _noteCtrl = TextEditingController();
  String _invoiceId = '';
  PaymentMode _mode = PaymentMode.cash;
  bool _saving = false;

  @override
  void dispose() {
    _amtCtrl.dispose(); _refCtrl.dispose(); _noteCtrl.dispose();
    super.dispose();
  }

  final pendingInvoices = [];

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    if (_invoiceId.isEmpty) {
      showSnack(context, 'Please select an invoice', error: true);
      return;
    }
    setState(() => _saving = true);
    try {
      final inv = widget.invoices.firstWhere((i) => i.id == _invoiceId);
      await FunctionsService().recordPayment({
        'invoiceId':  _invoiceId,
        'customerId': inv.customerId,
        'amount':     double.tryParse(_amtCtrl.text) ?? 0,
        'mode':       _mode.name,
        'upiRef':     _refCtrl.text.trim(),
        'notes':      _noteCtrl.text.trim(),
        'date':       DateTime.now().toIso8601String().split('T').first,
      });
      if (mounted) {
        widget.ref.invalidate(paymentsProvider);
        widget.ref.invalidate(invoicesProvider);
        Navigator.pop(context);
        showSnack(context, 'Payment recorded!');
      }
    } catch (e) {
      if (mounted) showSnack(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final pending = widget.invoices
        .where((i) => i.status == InvoiceStatus.pending || i.status == InvoiceStatus.draft)
        .toList();

    return Padding(
      padding: EdgeInsets.only(
          left: 20, right: 20, top: 20,
          bottom: MediaQuery.of(context).viewInsets.bottom + 20),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              const Text('Record Payment', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18, color: AppColors.slate900)),
              const Spacer(),
              IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
            ]),
            const SizedBox(height: 14),
            // Invoice picker
            DropdownButtonFormField<String>(
              value: _invoiceId.isEmpty ? null : _invoiceId,
              decoration: const InputDecoration(labelText: 'Select Invoice *'),
              hint: const Text('Choose an invoice'),
              items: pending.map((i) => DropdownMenuItem(
                    value: i.id,
                    child: Text('${i.invoiceNumber} — ${i.customerName}', overflow: TextOverflow.ellipsis),
                  )).toList(),
              onChanged: (v) {
                setState(() => _invoiceId = v ?? '');
                if (v != null) {
                  final inv = widget.invoices.firstWhere((i) => i.id == v);
                  _amtCtrl.text = inv.total.toStringAsFixed(2);
                }
              },
            ),
            const SizedBox(height: 10),
            TextFormField(
              controller: _amtCtrl,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(labelText: 'Amount (₹) *'),
              validator: (v) => v == null || v.isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 10),
            DropdownButtonFormField<PaymentMode>(
              value: _mode,
              decoration: const InputDecoration(labelText: 'Payment Mode'),
              items: PaymentMode.values.map((m) => DropdownMenuItem(
                value: m,
                child: Text(m.name[0].toUpperCase() + m.name.substring(1)),
              )).toList(),
              onChanged: (v) => setState(() => _mode = v ?? PaymentMode.cash),
            ),
            if (_mode == PaymentMode.upi) ...[
              const SizedBox(height: 10),
              TextFormField(
                controller: _refCtrl,
                decoration: const InputDecoration(labelText: 'UPI Reference / Transaction ID'),
              ),
            ],
            const SizedBox(height: 10),
            TextFormField(
              controller: _noteCtrl,
              decoration: const InputDecoration(labelText: 'Notes (optional)'),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _saving ? null : _save,
                child: _saving
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Record Payment'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
