import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';
import '../../core/helpers.dart';
import '../../providers/providers.dart';
import '../../models/models.dart';
import '../../widgets/common_widgets.dart';
import '../customers/customers_screen.dart' show CustomerFormSheet;

class CustomerDetailScreen extends ConsumerWidget {
  final String customerId;
  const CustomerDetailScreen({super.key, required this.customerId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final custAV     = ref.watch(customerDetailProvider(customerId));
    final invoicesAV = ref.watch(customerInvoicesProvider(customerId));

    return custAV.when(
      loading: () => Scaffold(appBar: AppBar(), body: const Center(child: CircularProgressIndicator())),
      error: (e, _) => Scaffold(appBar: AppBar(), body: Center(child: Text('Error: $e'))),
      data: (cust) {
        if (cust == null) return Scaffold(appBar: AppBar(), body: const Center(child: Text('Not found')));
        return Scaffold(
          backgroundColor: AppColors.surface,
          appBar: AppBar(
            title: Text(cust.name),
            actions: [
              IconButton(
                icon: const Icon(Icons.edit_rounded),
                onPressed: () => showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
                  builder: (_) => CustomerFormSheet(ref: ref, customer: cust),
                ),
              ),
            ],
          ),
          body: ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 40),
            children: [
              // Profile card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.slate200),
                ),
                child: Column(
                  children: [
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: AppColors.green100,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Center(
                        child: Text(
                          initials(cust.name),
                          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 24, color: AppColors.green700),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(cust.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.slate900)),
                    const SizedBox(height: 16),
                    _InfoRow(Icons.currency_rupee_rounded, 'Total Billed', formatCurrency(cust.totalBilled), highlight: true),
                    if (cust.email != null && cust.email!.isNotEmpty)
                      _InfoRow(Icons.email_outlined, 'Email', cust.email!),
                    if (cust.phone != null && cust.phone!.isNotEmpty)
                      _InfoRow(Icons.phone_outlined, 'Phone', cust.phone!),
                    if (cust.address != null && cust.address!.isNotEmpty)
                      _InfoRow(Icons.location_on_outlined, 'Address', cust.address!),
                    if (cust.gstin != null && cust.gstin!.isNotEmpty)
                      _InfoRow(Icons.badge_outlined, 'GSTIN', cust.gstin!, mono: true),
                    if (cust.pan != null && cust.pan!.isNotEmpty)
                      _InfoRow(Icons.credit_card_outlined, 'PAN', cust.pan!, mono: true),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Invoice history
              const Text(
                'Invoice History',
                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: AppColors.slate900),
              ),
              const SizedBox(height: 10),
              invoicesAV.when(
                loading: () => const ShimmerCard(),
                error: (e, _) => Text('Error: $e'),
                data: (invoices) {
                  if (invoices.isEmpty) {
                    return Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.slate200),
                      ),
                      child: const Center(
                        child: Text('No invoices for this customer.',
                            style: TextStyle(color: AppColors.slate500, fontSize: 13)),
                      ),
                    );
                  }
                  return Column(
                    children: invoices.map((inv) => GestureDetector(
                      onTap: () => context.push('/invoices/${inv.id}'),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.slate200),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(inv.invoiceNumber,
                                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: AppColors.green600)),
                                  Text(formatDate(inv.createdAt),
                                      style: const TextStyle(fontSize: 11, color: AppColors.slate500)),
                                ],
                              ),
                            ),
                            Text(formatCurrency(inv.total),
                                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.slate900)),
                            const SizedBox(width: 10),
                            StatusBadge(status: inv.status.name, small: true),
                          ],
                        ),
                      ),
                    )).toList(),
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final bool mono;
  final bool highlight;

  const _InfoRow(this.icon, this.label, this.value, {this.mono = false, this.highlight = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.slate400),
          const SizedBox(width: 10),
          SizedBox(
            width: 80,
            child: Text(label, style: const TextStyle(fontSize: 12, color: AppColors.slate500)),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 13,
                fontWeight: highlight ? FontWeight.w700 : FontWeight.w600,
                color: highlight ? AppColors.green600 : AppColors.slate900,
                fontFamily: mono ? 'monospace' : null,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
