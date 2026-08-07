import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';
import '../../core/helpers.dart';
import '../../providers/providers.dart';
import '../../widgets/common_widgets.dart' show StatCard, StatusBadge, ShimmerCard, EmptyState, showSnack, AppCardColor;

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stats     = ref.watch(dashboardStatsProvider);
    final invoicesAV = ref.watch(invoicesProvider);
    final user      = FirebaseAuth.instance.currentUser;

    final firstName = user?.displayName?.split(' ').first ?? 'there';

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Hello, $firstName 👋',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.slate900,
              ),
            ),
            const Text(
              'SimplifySystems',
              style: TextStyle(
                fontSize: 11,
                color: AppColors.green600,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16),
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.green100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(
                initials(user?.displayName ?? user?.email),
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.green700,
                ),
              ),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.green600,
        onRefresh: () async {
          ref.invalidate(invoicesProvider);
          ref.invalidate(customersProvider);
        },
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
          children: [
            // Stats grid
            GridView.count(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              childAspectRatio: 1.5,
              children: [
                StatCard(
                  title: 'Total Revenue',
                  value: formatCurrency(stats.totalRevenue),
                  icon: Icons.currency_rupee_rounded,
                  trend: 12,
                  color: AppCardColor.green,
                ),
                StatCard(
                  title: 'Total Invoices',
                  value: stats.totalInvoices.toString(),
                  icon: Icons.description_rounded,
                  trend: 8,
                  color: AppCardColor.blue,
                ),
                StatCard(
                  title: 'Customers',
                  value: stats.totalCustomers.toString(),
                  icon: Icons.people_rounded,
                  trend: 5,
                  color: AppCardColor.yellow,
                ),
                StatCard(
                  title: 'Pending Amount',
                  value: formatCurrency(stats.pendingAmount),
                  icon: Icons.schedule_rounded,
                  color: AppCardColor.red,
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Recent invoices card
            Container(
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.slate200),
              ),
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 16, 12, 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Recent Invoices',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: AppColors.slate900,
                          ),
                        ),
                        TextButton(
                          onPressed: () => context.go('/invoices'),
                          style: TextButton.styleFrom(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 4),
                            minimumSize: Size.zero,
                          ),
                          child: const Text('View all →'),
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 1),
                  invoicesAV.when(
                    loading: () => const Padding(
                      padding: EdgeInsets.all(16),
                      child: Column(
                        children: [ShimmerCard(), SizedBox(height: 8), ShimmerCard()],
                      ),
                    ),
                    error: (e, _) => Padding(
                      padding: const EdgeInsets.all(20),
                      child: Text('Error: $e',
                          style: const TextStyle(color: Colors.red, fontSize: 12)),
                    ),
                    data: (invoices) {
                      final recent = invoices.take(5).toList();
                      if (recent.isEmpty) {
                        return Padding(
                          padding: const EdgeInsets.all(32),
                          child: Column(
                            children: [
                              const Text(
                                'No invoices yet.',
                                style: TextStyle(
                                    color: AppColors.slate500, fontSize: 13),
                              ),
                              const SizedBox(height: 12),
                              ElevatedButton.icon(
                                onPressed: () => context.push('/invoices/new'),
                                icon: const Icon(Icons.add, size: 18),
                                label: const Text('Create Invoice'),
                              ),
                            ],
                          ),
                        );
                      }
                      return Column(
                        children: recent.map((inv) {
                          return InkWell(
                            onTap: () => context.push('/invoices/${inv.id}'),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 13),
                              child: Row(
                                children: [
                                  // Invoice number
                                  Expanded(
                                    flex: 3,
                                    child: Text(
                                      inv.invoiceNumber,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.green600,
                                      ),
                                    ),
                                  ),
                                  // Customer
                                  Expanded(
                                    flex: 4,
                                    child: Text(
                                      inv.customerName,
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: AppColors.slate700,
                                      ),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  // Amount
                                  Expanded(
                                    flex: 3,
                                    child: Text(
                                      formatCurrency(inv.total),
                                      textAlign: TextAlign.right,
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.slate900,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  StatusBadge(status: inv.status.name, small: true),
                                ],
                              ),
                            ),
                          );
                        }).toList(),
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/invoices/new'),
        icon: const Icon(Icons.add),
        label: const Text('New Invoice'),
      ),
    );
  }
}


