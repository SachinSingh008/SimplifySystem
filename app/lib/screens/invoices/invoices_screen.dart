import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';
import '../../core/helpers.dart';
import '../../providers/providers.dart';
import '../../models/models.dart';
import '../../widgets/common_widgets.dart';

class InvoicesScreen extends ConsumerStatefulWidget {
  const InvoicesScreen({super.key});

  @override
  ConsumerState<InvoicesScreen> createState() => _InvoicesScreenState();
}

class _InvoicesScreenState extends ConsumerState<InvoicesScreen> {
  final _searchCtrl = TextEditingController();
  InvoiceStatus? _filterStatus;

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final invoicesAV = ref.watch(invoicesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Invoices'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => context.push('/invoices/new'),
            tooltip: 'New Invoice',
          ),
        ],
      ),
      body: Column(
        children: [
          // Search & filter bar
          Container(
            color: AppColors.white,
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Column(
              children: [
                // Search
                TextField(
                  controller: _searchCtrl,
                  onChanged: (_) => setState(() {}),
                  decoration: InputDecoration(
                    hintText: 'Search invoices…',
                    prefixIcon: const Icon(Icons.search, size: 20),
                    suffixIcon: _searchCtrl.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, size: 18),
                            onPressed: () {
                              _searchCtrl.clear();
                              setState(() {});
                            },
                          )
                        : null,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 10),
                  ),
                ),
                const SizedBox(height: 10),
                // Status chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _StatusChip(
                        label: 'All',
                        selected: _filterStatus == null,
                        onTap: () => setState(() => _filterStatus = null),
                      ),
                      ...InvoiceStatus.values.map((s) => _StatusChip(
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
          // List
          Expanded(
            child: invoicesAV.when(
              loading: () => const Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  children: [
                    ShimmerCard(), SizedBox(height: 8),
                    ShimmerCard(), SizedBox(height: 8),
                    ShimmerCard(),
                  ],
                ),
              ),
              error: (e, _) => Center(
                child: Text('Error: $e',
                    style: const TextStyle(color: Colors.red)),
              ),
              data: (invoices) {
                final q = _searchCtrl.text.toLowerCase();
                final filtered = invoices.where((i) {
                  final matchSearch = q.isEmpty ||
                      i.invoiceNumber.toLowerCase().contains(q) ||
                      i.customerName.toLowerCase().contains(q);
                  final matchStatus =
                      _filterStatus == null || i.status == _filterStatus;
                  return matchSearch && matchStatus;
                }).toList();

                if (filtered.isEmpty) {
                  return EmptyState(
                    icon: Icons.description_rounded,
                    title: 'No invoices found',
                    subtitle: 'Create your first invoice to get started',
                    actionLabel: 'New Invoice',
                    onAction: () => context.push('/invoices/new'),
                  );
                }

                return RefreshIndicator(
                  color: AppColors.green600,
                  onRefresh: () async => ref.invalidate(invoicesProvider),
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
                    itemCount: filtered.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (_, i) => _InvoiceCard(inv: filtered[i]),
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/invoices/new'),
        child: const Icon(Icons.add),
      ),
    );
  }
}

class _InvoiceCard extends StatelessWidget {
  final Invoice inv;
  const _InvoiceCard({required this.inv});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/invoices/${inv.id}'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.slate200),
        ),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        inv.invoiceNumber,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                          color: AppColors.green600,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        inv.customerName,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.slate700,
                        ),
                      ),
                    ],
                  ),
                ),
                StatusBadge(status: inv.status.name),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                const Icon(Icons.calendar_today_outlined,
                    size: 13, color: AppColors.slate400),
                const SizedBox(width: 4),
                Text(
                  formatDate(inv.createdAt),
                  style: const TextStyle(fontSize: 11, color: AppColors.slate500),
                ),
                if (inv.dueDate != null) ...[
                  const SizedBox(width: 12),
                  const Icon(Icons.schedule, size: 13, color: AppColors.slate400),
                  const SizedBox(width: 4),
                  Text(
                    'Due: ${formatDate(inv.dueDate)}',
                    style: const TextStyle(fontSize: 11, color: AppColors.slate500),
                  ),
                ],
                const Spacer(),
                Text(
                  formatCurrency(inv.total),
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 15,
                    color: AppColors.slate900,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _StatusChip({required this.label, required this.selected, required this.onTap});

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
