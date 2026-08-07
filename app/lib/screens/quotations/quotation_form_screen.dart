import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';
import '../../core/helpers.dart';
import '../../providers/providers.dart';
import '../../widgets/common_widgets.dart';
import '../../services/functions_service.dart';

class QuotationFormScreen extends ConsumerStatefulWidget {
  const QuotationFormScreen({super.key});

  @override
  ConsumerState<QuotationFormScreen> createState() => _QuotationFormScreenState();
}

class _QuotationFormScreenState extends ConsumerState<QuotationFormScreen> {
  final _formKey = GlobalKey<FormState>();
  String _customerId    = '';
  String _customerName  = '';
  String _customerGstin = '';
  String _dueDate       = '';
  String _notes         = '';
  String _terms         = '';
  int    _templateId    = 1;
  bool   _isInterstate  = false;
  bool   _saving        = false;
  List<_LI> _items      = [_LI()];

  ({double subtotal, double cgst, double sgst, double igst, double total}) get _gst =>
      calculateGst(_items.map((i) => (amount: i.amount, gstPct: i.gstPct)).toList(), _isInterstate);

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final g = _gst;
      final result = await FunctionsService().createQuotation({
        'customerName':  _customerName,
        'customerGstin': _customerGstin,
        'customerId':    _customerId.isNotEmpty ? _customerId : null,
        'dueDate':       _dueDate.isNotEmpty ? _dueDate : null,
        'notes':         _notes,
        'terms':         _terms,
        'templateId':    _templateId,
        'items':         _items.map((i) => i.toMap()).toList(),
        'subtotal':      g.subtotal,
        'cgst':          g.cgst,
        'sgst':          g.sgst,
        'igst':          g.igst,
        'total':         g.total,
      });
      if (mounted) {
        ref.invalidate(quotationsProvider);
        showSnack(context, 'Quotation ${result['quotationNumber']} created!');
        context.go('/quotations');
      }
    } catch (e) {
      if (mounted) showSnack(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final customers = ref.watch(customersProvider).value ?? [];
    final g = _gst;

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: const Text('New Quotation'),
        actions: [
          TextButton(
            onPressed: _saving ? null : _save,
            child: const Text('Create', style: TextStyle(color: AppColors.green600, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
          children: [
            _Card(
              title: 'Customer',
              child: Column(
                children: [
                  if (customers.isNotEmpty) ...[
                    DropdownButtonFormField<String>(
                      value: _customerId.isEmpty ? null : _customerId,
                      decoration: const InputDecoration(labelText: 'Select Customer'),
                      items: [
                        const DropdownMenuItem(value: '', child: Text('— Enter manually —')),
                        ...customers.map((c) => DropdownMenuItem(value: c.id, child: Text(c.name))),
                      ],
                      onChanged: (val) {
                        setState(() {
                          _customerId = val ?? '';
                          if (val != null && val.isNotEmpty) {
                            final c = customers.firstWhere((x) => x.id == val);
                            _customerName  = c.name;
                            _customerGstin = c.gstin ?? '';
                          }
                        });
                      },
                    ),
                    const SizedBox(height: 10),
                  ],
                  TextFormField(
                    initialValue: _customerName,
                    decoration: const InputDecoration(labelText: 'Customer Name *'),
                    onChanged: (v) => _customerName = v,
                    validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 10),
                  TextFormField(
                    initialValue: _customerGstin,
                    decoration: const InputDecoration(labelText: 'GSTIN'),
                    textCapitalization: TextCapitalization.characters,
                    maxLength: 15,
                    onChanged: (v) => _customerGstin = v.toUpperCase(),
                  ),
                  TextFormField(
                    initialValue: _dueDate,
                    decoration: const InputDecoration(labelText: 'Valid Until (YYYY-MM-DD)'),
                    onChanged: (v) => _dueDate = v,
                  ),
                  SwitchListTile.adaptive(
                    contentPadding: EdgeInsets.zero,
                    title: const Text('Interstate (IGST)', style: TextStyle(fontSize: 13)),
                    value: _isInterstate,
                    onChanged: (v) => setState(() => _isInterstate = v),
                    activeColor: AppColors.green600,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            _Card(
              title: 'Line Items',
              trailing: TextButton.icon(
                onPressed: () => setState(() => _items.add(_LI())),
                icon: const Icon(Icons.add, size: 16),
                label: const Text('Add'),
              ),
              child: Column(
                children: _items.asMap().entries.map((e) {
                  final i = e.key;
                  final item = e.value;
                  return _SimpleItemRow(
                    key: ValueKey(item.id),
                    item: item,
                    index: i,
                    canDelete: _items.length > 1,
                    onDelete: () => setState(() => _items.removeAt(i)),
                    onChanged: () => setState(() {}),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 12),
            _Card(
              title: 'Totals',
              child: Column(
                children: [
                  _Row('Subtotal', formatCurrency(g.subtotal)),
                  if (g.cgst > 0) _Row('CGST', formatCurrency(g.cgst)),
                  if (g.sgst > 0) _Row('SGST', formatCurrency(g.sgst)),
                  if (g.igst > 0) _Row('IGST', formatCurrency(g.igst)),
                  const Divider(),
                  _Row('Total', formatCurrency(g.total), bold: true, color: AppColors.green600),
                ],
              ),
            ),
            const SizedBox(height: 12),
            _Card(
              title: 'Notes & Terms',
              child: Column(
                children: [
                  TextFormField(
                    decoration: const InputDecoration(labelText: 'Notes'),
                    maxLines: 3,
                    onChanged: (v) => _notes = v,
                  ),
                  const SizedBox(height: 10),
                  TextFormField(
                    decoration: const InputDecoration(labelText: 'Terms & Conditions'),
                    maxLines: 3,
                    onChanged: (v) => _terms = v,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _saving ? null : _save,
                child: _saving
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Create Quotation'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LI {
  final int id = DateTime.now().microsecondsSinceEpoch;
  String name = ''; String hsn = '';
  double qty = 1; String unit = 'Nos'; double rate = 0; double gstPct = 18;
  double get amount => qty * rate;
  Map<String, dynamic> toMap() => {'name': name,'hsn': hsn,'qty': qty,'unit': unit,'rate': rate,'gstPct': gstPct,'amount': amount};
}

class _SimpleItemRow extends StatefulWidget {
  final _LI item; final int index; final bool canDelete;
  final VoidCallback onDelete; final VoidCallback onChanged;
  const _SimpleItemRow({super.key, required this.item, required this.index, required this.canDelete, required this.onDelete, required this.onChanged});
  @override State<_SimpleItemRow> createState() => _SimpleItemRowState();
}
class _SimpleItemRowState extends State<_SimpleItemRow> {
  late final TextEditingController _n, _h, _q, _r;
  @override void initState() { super.initState(); _n = TextEditingController(text: widget.item.name); _h = TextEditingController(text: widget.item.hsn); _q = TextEditingController(text: widget.item.qty.toString()); _r = TextEditingController(text: widget.item.rate.toString()); }
  @override void dispose() { _n.dispose(); _h.dispose(); _q.dispose(); _r.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) {
    return Container(margin: const EdgeInsets.only(bottom: 10), padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: AppColors.slate50, borderRadius: BorderRadius.circular(8), border: Border.all(color: AppColors.slate200)),
      child: Column(children: [
        Row(children: [Text('#${widget.index + 1}', style: const TextStyle(fontSize: 11, color: AppColors.slate400, fontWeight: FontWeight.w600)), const Spacer(), if (widget.canDelete) GestureDetector(onTap: widget.onDelete, child: const Icon(Icons.delete_outline, size: 16, color: Color(0xFFDC2626)))]),
        const SizedBox(height: 6),
        TextField(controller: _n, decoration: const InputDecoration(labelText: 'Name *'), onChanged: (v) { widget.item.name = v; widget.onChanged(); }),
        const SizedBox(height: 6),
        Row(children: [
          Expanded(flex: 2, child: TextField(controller: _q, decoration: const InputDecoration(labelText: 'Qty'), keyboardType: TextInputType.number, onChanged: (v) { widget.item.qty = double.tryParse(v) ?? 1; widget.onChanged(); })),
          const SizedBox(width: 6),
          Expanded(flex: 3, child: TextField(controller: _r, decoration: const InputDecoration(labelText: 'Rate ₹'), keyboardType: const TextInputType.numberWithOptions(decimal: true), onChanged: (v) { widget.item.rate = double.tryParse(v) ?? 0; widget.onChanged(); })),
          const SizedBox(width: 6),
          DropdownButton<double>(value: widget.item.gstPct, underline: const SizedBox(), items: [0,5,12,18,28].map((g) => DropdownMenuItem(value: g.toDouble(), child: Text('$g%', style: const TextStyle(fontSize: 12)))).toList(), onChanged: (v) { widget.item.gstPct = v ?? 18; widget.onChanged(); }),
        ]),
        const SizedBox(height: 4),
        Align(alignment: Alignment.centerRight, child: Text(formatCurrency(widget.item.amount), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.green700))),
      ]),
    );
  }
}

class _Card extends StatelessWidget {
  final String title; final Widget child; final Widget? trailing;
  const _Card({required this.title, required this.child, this.trailing});
  @override Widget build(BuildContext context) => Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: AppColors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.slate200)),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Row(children: [Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.slate900)), if (trailing != null) ...[const Spacer(), trailing!]]), const SizedBox(height: 12), child]));
}

class _Row extends StatelessWidget {
  final String label; final String value; final bool bold; final Color? color;
  const _Row(this.label, this.value, {this.bold = false, this.color});
  @override Widget build(BuildContext context) => Padding(padding: const EdgeInsets.only(bottom: 5), child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text(label, style: TextStyle(fontSize: bold ? 14 : 12, fontWeight: bold ? FontWeight.w700 : FontWeight.w500, color: bold ? AppColors.slate900 : AppColors.slate600)), Text(value, style: TextStyle(fontSize: bold ? 16 : 12, fontWeight: bold ? FontWeight.w800 : FontWeight.w600, color: color ?? AppColors.slate700))]));
}
