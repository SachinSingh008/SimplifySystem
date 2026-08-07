import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';
import '../../core/helpers.dart';
import '../../providers/providers.dart';
import '../../models/models.dart';
import '../../widgets/common_widgets.dart';
import '../../services/functions_service.dart';

class QuotationsScreen extends ConsumerStatefulWidget {
  const QuotationsScreen({super.key});

  @override
  ConsumerState<QuotationsScreen> createState() => _QuotationsScreenState();
}

class _QuotationsScreenState extends ConsumerState<QuotationsScreen> {
  final _searchCtrl = TextEditingController();
  QuotationStatus? _filterStatus;

  @override
  Widget build(BuildContext context) {
    final quotationsAV = ref.watch(quotationsProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Quotations'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => context.push('/quotations/new'),
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            color: AppColors.white,
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Column(
              children: [
                TextField(
                  controller: _searchCtrl,
                  onChanged: (_) => setState(() {}),
                  decoration: const InputDecoration(
                    hintText: 'Search quotations…',
                    prefixIcon: Icon(Icons.search, size: 20),
                  ),
                ),
                const SizedBox(height: 10),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _Chip(
                          label: 'All',
                          selected: _filterStatus == null,
                          onTap: () => setState(() => _filterStatus = null)),
                      ...QuotationStatus.values.map((s) => _Chip(
                            label: s.name[0].toUpperCase() + s.name.substring(1),
                            selected: _filterStatus == s,
                            onTap: () => setState(() => _filterStatus = s),
                          )),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: quotationsAV.when(
              loading: () => const Padding(
                padding: EdgeInsets.all(16),
                child: Column(children: [ShimmerCard(), SizedBox(height: 8), ShimmerCard()]),
              ),
              error: (e, _) => Center(child: Text('Error: $e')),
              data: (quotations) {
                final q = _searchCtrl.text.toLowerCase();
                final filtered = quotations.where((qt) {
                  final match = q.isEmpty ||
                      qt.quotationNumber.toLowerCase().contains(q) ||
                      qt.customerName.toLowerCase().contains(q);
                  final status = _filterStatus == null || qt.status == _filterStatus;
                  return match && status;
                }).toList();

                if (filtered.isEmpty) {
                  return EmptyState(
                    icon: Icons.request_quote_rounded,
                    title: 'No quotations found',
                    actionLabel: 'New Quotation',
                    onAction: () => context.push('/quotations/new'),
                  );
                }

                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (_, i) => _QuotationCard(quot: filtered[i]),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/quotations/new'),
        child: const Icon(Icons.add),
      ),
    );
  }
}

class _QuotationCard extends ConsumerWidget {
  final Quotation quot;
  const _QuotationCard({required this.quot});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.slate200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      quot.quotationNumber,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                        color: AppColors.green600,
                      ),
                    ),
                    Text(quot.customerName,
                        style: const TextStyle(
                            fontSize: 13, color: AppColors.slate700)),
                  ],
                ),
              ),
              StatusBadge(status: quot.status.name),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              const Icon(Icons.calendar_today_outlined,
                  size: 12, color: AppColors.slate400),
              const SizedBox(width: 4),
              Text(formatDate(quot.createdAt),
                  style: const TextStyle(
                      fontSize: 11, color: AppColors.slate500)),
              const Spacer(),
              Text(
                formatCurrency(quot.total),
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 15,
                  color: AppColors.slate900,
                ),
              ),
            ],
          ),
          if (quot.status == QuotationStatus.open &&
              quot.convertedToInvoiceId == null) ...[
            const SizedBox(height: 12),
            const Divider(height: 1),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                icon: const Icon(Icons.transform_rounded, size: 16),
                label: const Text('Convert to Invoice'),
                onPressed: () => _convertToInvoice(context, ref),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Future<void> _convertToInvoice(BuildContext context, WidgetRef ref) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Convert to Invoice?'),
        content: const Text(
            'This will create a new invoice from this quotation.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel')),
          ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Convert')),
        ],
      ),
    );
    if (confirm != true) return;

    try {
      final svc = FunctionsService();
      final result = await svc.convertQuotationToInvoice(quot.id);
      if (context.mounted) {
        ref.invalidate(quotationsProvider);
        ref.invalidate(invoicesProvider);
        showSnack(context, 'Invoice created!');
        context.push('/invoices/${result['invoiceId']}');
      }
    } catch (e) {
      if (context.mounted) showSnack(context, e.toString(), error: true);
    }
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _Chip({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? AppColors.green600 : AppColors.slate100,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: selected ? Colors.white : AppColors.slate600,
          ),
        ),
      ),
    );
  }
}
