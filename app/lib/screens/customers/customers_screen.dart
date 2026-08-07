import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';
import '../../core/helpers.dart';
import '../../providers/providers.dart';
import '../../models/models.dart';
import '../../widgets/common_widgets.dart';
import '../../services/functions_service.dart';

class CustomersScreen extends ConsumerStatefulWidget {
  const CustomersScreen({super.key});

  @override
  ConsumerState<CustomersScreen> createState() => _CustomersScreenState();
}

class _CustomersScreenState extends ConsumerState<CustomersScreen> {
  final _searchCtrl = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final customersAV = ref.watch(customersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Customers'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add_rounded),
            onPressed: () => _showAddDialog(context),
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            color: AppColors.white,
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: TextField(
              controller: _searchCtrl,
              onChanged: (_) => setState(() {}),
              decoration: const InputDecoration(
                hintText: 'Search customers…',
                prefixIcon: Icon(Icons.search, size: 20),
              ),
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: customersAV.when(
              loading: () => const Padding(
                padding: EdgeInsets.all(16),
                child: Column(children: [ShimmerCard(), SizedBox(height: 8), ShimmerCard()]),
              ),
              error: (e, _) => Center(child: Text('Error: $e')),
              data: (customers) {
                final q = _searchCtrl.text.toLowerCase();
                final filtered = customers
                    .where((c) =>
                        q.isEmpty ||
                        c.name.toLowerCase().contains(q) ||
                        (c.email ?? '').toLowerCase().contains(q) ||
                        (c.phone ?? '').contains(q))
                    .toList();

                if (filtered.isEmpty) {
                  return EmptyState(
                    icon: Icons.people_rounded,
                    title: 'No customers yet',
                    subtitle: 'Add your first customer',
                    actionLabel: 'Add Customer',
                    onAction: () => _showAddDialog(context),
                  );
                }

                return RefreshIndicator(
                  color: AppColors.green600,
                  onRefresh: () async => ref.invalidate(customersProvider),
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
                    itemCount: filtered.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (_, i) => _CustomerCard(cust: filtered[i]),
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddDialog(context),
        child: const Icon(Icons.person_add_rounded),
      ),
    );
  }

  void _showAddDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => CustomerFormSheet(ref: ref),
    );
  }
}

class _CustomerCard extends StatelessWidget {
  final Customer cust;
  const _CustomerCard({required this.cust});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/customers/${cust.id}'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.slate200),
        ),
        child: Row(
          children: [
            // Avatar
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppColors.green100,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(
                child: Text(
                  initials(cust.name),
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                    color: AppColors.green700,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    cust.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                      color: AppColors.slate900,
                    ),
                  ),
                  if (cust.email != null && cust.email!.isNotEmpty)
                    Text(cust.email!,
                        style: const TextStyle(
                            fontSize: 12, color: AppColors.slate500)),
                  if (cust.phone != null && cust.phone!.isNotEmpty)
                    Text(cust.phone!,
                        style: const TextStyle(
                            fontSize: 12, color: AppColors.slate500)),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  formatCurrency(cust.totalBilled),
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                    color: AppColors.green600,
                  ),
                ),
                const Text(
                  'total billed',
                  style: TextStyle(fontSize: 10, color: AppColors.slate400),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class CustomerFormSheet extends StatefulWidget {
  final WidgetRef ref;
  final Customer? customer;
  const CustomerFormSheet({required this.ref, this.customer});

  @override
  State<CustomerFormSheet> createState() => _CustomerFormSheetState();
}

class _CustomerFormSheetState extends State<CustomerFormSheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name, _email, _phone, _address, _gstin, _pan;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final c = widget.customer;
    _name    = TextEditingController(text: c?.name ?? '');
    _email   = TextEditingController(text: c?.email ?? '');
    _phone   = TextEditingController(text: c?.phone ?? '');
    _address = TextEditingController(text: c?.address ?? '');
    _gstin   = TextEditingController(text: c?.gstin ?? '');
    _pan     = TextEditingController(text: c?.pan ?? '');
  }

  @override
  void dispose() {
    _name.dispose(); _email.dispose(); _phone.dispose();
    _address.dispose(); _gstin.dispose(); _pan.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final svc = FunctionsService();
      final payload = {
        'name':    _name.text.trim(),
        'email':   _email.text.trim(),
        'phone':   _phone.text.trim(),
        'address': _address.text.trim(),
        'gstin':   _gstin.text.trim().toUpperCase(),
        'pan':     _pan.text.trim().toUpperCase(),
      };
      if (widget.customer == null) {
        await svc.createCustomer(payload);
      } else {
        await svc.updateCustomer(widget.customer!.id, payload);
      }
      if (mounted) {
        widget.ref.invalidate(customersProvider);
        Navigator.pop(context);
        showSnack(context,
            widget.customer == null ? 'Customer added!' : 'Customer updated!');
      }
    } catch (e) {
      if (mounted) showSnack(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 20,
          bottom: MediaQuery.of(context).viewInsets.bottom + 20),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  Text(
                    widget.customer == null ? 'Add Customer' : 'Edit Customer',
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 18,
                      color: AppColors.slate900,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _name,
                decoration: const InputDecoration(labelText: 'Name *'),
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(labelText: 'Email'),
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: _phone,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'Phone'),
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: _address,
                maxLines: 2,
                decoration: const InputDecoration(labelText: 'Address'),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _gstin,
                      textCapitalization: TextCapitalization.characters,
                      maxLength: 15,
                      decoration: const InputDecoration(labelText: 'GSTIN'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextFormField(
                      controller: _pan,
                      textCapitalization: TextCapitalization.characters,
                      maxLength: 10,
                      decoration: const InputDecoration(labelText: 'PAN'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _saving ? null : _save,
                  child: _saving
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                              color: Colors.white, strokeWidth: 2))
                      : Text(widget.customer == null
                          ? 'Add Customer'
                          : 'Update Customer'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
