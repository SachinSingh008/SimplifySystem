import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme.dart';
import '../../core/helpers.dart';
import '../../providers/providers.dart';
import '../../models/models.dart';
import '../../widgets/common_widgets.dart';
import '../../services/functions_service.dart';

class ProductsScreen extends ConsumerStatefulWidget {
  const ProductsScreen({super.key});

  @override
  ConsumerState<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends ConsumerState<ProductsScreen> {
  final _searchCtrl = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final productsAV = ref.watch(productsProvider);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Products / Catalog'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showForm(context),
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
                hintText: 'Search products…',
                prefixIcon: Icon(Icons.search, size: 20),
              ),
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: productsAV.when(
              loading: () => const Padding(
                padding: EdgeInsets.all(16),
                child: Column(children: [ShimmerCard(), SizedBox(height: 8), ShimmerCard()]),
              ),
              error: (e, _) => Center(child: Text('Error: $e')),
              data: (products) {
                final q = _searchCtrl.text.toLowerCase();
                final filtered = products
                    .where((p) =>
                        q.isEmpty ||
                        p.name.toLowerCase().contains(q) ||
                        p.hsn.contains(q))
                    .toList();

                if (filtered.isEmpty) {
                  return EmptyState(
                    icon: Icons.inventory_2_rounded,
                    title: 'No products yet',
                    subtitle: 'Add products to quickly fill invoice line items',
                    actionLabel: 'Add Product',
                    onAction: () => _showForm(context),
                  );
                }

                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (_, i) => _ProductCard(
                    product: filtered[i],
                    onEdit: () => _showForm(context, product: filtered[i]),
                    onDelete: () => _delete(context, filtered[i]),
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showForm(context),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showForm(BuildContext context, {Product? product}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _ProductFormSheet(ref: ref, product: product),
    );
  }

  Future<void> _delete(BuildContext context, Product product) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Delete Product?'),
        content: Text('Remove "${product.name}" from catalog?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirm != true) return;
    try {
      await FunctionsService().deleteProduct(product.id);
      ref.invalidate(productsProvider);
      if (context.mounted) showSnack(context, 'Product deleted');
    } catch (e) {
      if (context.mounted) showSnack(context, e.toString(), error: true);
    }
  }
}

class _ProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _ProductCard({required this.product, required this.onEdit, required this.onDelete});

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
              color: AppColors.slate100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.inventory_2_rounded, color: AppColors.slate500, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(product.name,
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.slate900)),
                Text(
                  '${product.unit}  •  HSN: ${product.hsn.isNotEmpty ? product.hsn : "—"}  •  ${product.gstPct.toInt()}% GST',
                  style: const TextStyle(fontSize: 11, color: AppColors.slate500),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                formatCurrency(product.price),
                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.green600),
              ),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.edit_rounded, size: 18, color: AppColors.slate400),
                    onPressed: onEdit,
                    constraints: const BoxConstraints(),
                    padding: const EdgeInsets.all(4),
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline, size: 18, color: Color(0xFFDC2626)),
                    onPressed: onDelete,
                    constraints: const BoxConstraints(),
                    padding: const EdgeInsets.all(4),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ProductFormSheet extends StatefulWidget {
  final WidgetRef ref;
  final Product? product;
  const _ProductFormSheet({required this.ref, this.product});

  @override
  State<_ProductFormSheet> createState() => _ProductFormSheetState();
}

class _ProductFormSheetState extends State<_ProductFormSheet> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name, _hsn, _price;
  String _unit   = 'Nos';
  double _gstPct = 18;
  bool   _saving = false;

  @override
  void initState() {
    super.initState();
    final p = widget.product;
    _name  = TextEditingController(text: p?.name ?? '');
    _hsn   = TextEditingController(text: p?.hsn ?? '');
    _price = TextEditingController(text: p?.price.toString() ?? '');
    _unit   = p?.unit ?? 'Nos';
    _gstPct = p?.gstPct ?? 18;
  }

  @override
  void dispose() { _name.dispose(); _hsn.dispose(); _price.dispose(); super.dispose(); }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final svc = FunctionsService();
      final payload = {
        'name':   _name.text.trim(),
        'hsn':    _hsn.text.trim(),
        'unit':   _unit,
        'price':  double.tryParse(_price.text) ?? 0,
        'gstPct': _gstPct,
      };
      if (widget.product == null) {
        await svc.createProduct(payload);
      } else {
        await svc.updateProduct(widget.product!.id, payload);
      }
      if (mounted) {
        widget.ref.invalidate(productsProvider);
        Navigator.pop(context);
        showSnack(context, widget.product == null ? 'Product added!' : 'Product updated!');
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
      padding: EdgeInsets.only(left: 20, right: 20, top: 20, bottom: MediaQuery.of(context).viewInsets.bottom + 20),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(widget.product == null ? 'Add Product' : 'Edit Product',
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 18, color: AppColors.slate900)),
                const Spacer(),
                IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
              ],
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _name,
              decoration: const InputDecoration(labelText: 'Product Name *'),
              validator: (v) => v == null || v.isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 10),
            Row(children: [
              Expanded(child: TextFormField(controller: _hsn, decoration: const InputDecoration(labelText: 'HSN Code'))),
              const SizedBox(width: 10),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _unit,
                  decoration: const InputDecoration(labelText: 'Unit'),
                  items: ['Nos','Kg','L','Pcs','Box','Set','Hr','Mtr'].map((u) => DropdownMenuItem(value: u, child: Text(u))).toList(),
                  onChanged: (v) => setState(() => _unit = v ?? 'Nos'),
                ),
              ),
            ]),
            const SizedBox(height: 10),
            Row(children: [
              Expanded(
                child: TextFormField(
                  controller: _price,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  decoration: const InputDecoration(labelText: 'Price (₹) *'),
                  validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: DropdownButtonFormField<double>(
                  value: _gstPct,
                  decoration: const InputDecoration(labelText: 'GST %'),
                  items: [0,5,12,18,28].map((g) => DropdownMenuItem(value: g.toDouble(), child: Text('$g%'))).toList(),
                  onChanged: (v) => setState(() => _gstPct = v ?? 18),
                ),
              ),
            ]),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _saving ? null : _save,
                child: _saving
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : Text(widget.product == null ? 'Add Product' : 'Update Product'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
