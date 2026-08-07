import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';
import '../../core/helpers.dart';
import '../../providers/providers.dart';
import '../../models/models.dart';
import '../../widgets/common_widgets.dart';
import '../../services/functions_service.dart';

class InvoiceFormScreen extends ConsumerStatefulWidget {
  final String? invoiceId; // null = create mode

  const InvoiceFormScreen({super.key, this.invoiceId});

  @override
  ConsumerState<InvoiceFormScreen> createState() => _InvoiceFormScreenState();
}

class _InvoiceFormScreenState extends ConsumerState<InvoiceFormScreen> {
  final _formKey = GlobalKey<FormState>();

  // Form state
  String _customerId   = '';
  String _customerName = '';
  String _customerGstin= '';
  String _dueDate      = '';
  String _notes        = '';
  String _terms        = '';
  int    _templateId   = 1;
  bool   _isInterstate = false;
  List<_LineItem> _items = [_LineItem()];
  bool   _saving = false;
  bool   _loaded = false;

  Invoice? _editInvoice;

  @override
  void initState() {
    super.initState();
    if (widget.invoiceId != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _loadInvoice());
    } else {
      _loaded = true;
    }
  }

  Future<void> _loadInvoice() async {
    final inv = await ref.read(invoiceDetailProvider(widget.invoiceId!).future);
    if (inv != null && mounted) {
      setState(() {
        _editInvoice   = inv;
        _customerId    = inv.customerId ?? '';
        _customerName  = inv.customerName;
        _customerGstin = inv.customerGstin;
        _dueDate       = inv.dueDate ?? '';
        _notes         = inv.notes;
        _terms         = inv.terms;
        _templateId    = inv.templateId;
        _items         = inv.items
            .map((i) => _LineItem.fromModel(i))
            .toList();
        _loaded = true;
      });
    }
  }

  ({double subtotal, double cgst, double sgst, double igst, double total}) get _gst {
    return calculateGst(
      _items.map((i) => (amount: i.amount, gstPct: i.gstPct)).toList(),
      _isInterstate,
    );
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    if (_items.any((i) => i.name.isEmpty)) {
      showSnack(context, 'All line items must have a name', error: true);
      return;
    }

    setState(() => _saving = true);
    try {
      final gst = _gst;
      final payload = {
        'customerName':  _customerName,
        'customerGstin': _customerGstin,
        'customerId':    _customerId.isNotEmpty ? _customerId : null,
        'dueDate':       _dueDate.isNotEmpty ? _dueDate : null,
        'notes':         _notes,
        'terms':         _terms,
        'templateId':    _templateId,
        'isInterstate':  _isInterstate,
        'items':         _items.map((i) => i.toMap()).toList(),
        'subtotal':      gst.subtotal,
        'cgst':          gst.cgst,
        'sgst':          gst.sgst,
        'igst':          gst.igst,
        'total':         gst.total,
        'status':        'draft',
      };

      final svc = FunctionsService();
      if (widget.invoiceId == null) {
        final result = await svc.createInvoice(payload);
        if (mounted) {
          ref.invalidate(invoicesProvider);
          showSnack(context, 'Invoice ${result['invoiceNumber']} created!');
          context.go('/invoices/${result['invoiceId']}');
        }
      } else {
        await svc.updateInvoice(widget.invoiceId!, payload);
        if (mounted) {
          ref.invalidate(invoicesProvider);
          ref.invalidate(invoiceDetailProvider(widget.invoiceId!));
          showSnack(context, 'Invoice updated!');
          context.pop();
        }
      }
    } catch (e) {
      if (mounted) showSnack(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.invoiceId != null;
    final customers = ref.watch(customersProvider).value ?? [];

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: Text(isEdit ? 'Edit Invoice' : 'New Invoice'),
        actions: [
          TextButton(
            onPressed: _saving ? null : _save,
            child: _saving
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                        strokeWidth: 2, color: AppColors.green600))
                : Text(
                    isEdit ? 'Update' : 'Create',
                    style: const TextStyle(
                      color: AppColors.green600,
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                    ),
                  ),
          ),
        ],
      ),
      body: !_loaded
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
                children: [
                  // ── Customer Details ───────────────────────────────────
                  _SectionCard(
                    title: 'Customer Details',
                    child: Column(
                      children: [
                        // Customer picker
                        if (customers.isNotEmpty) ...[
                          DropdownButtonFormField<String>(
                            value: _customerId.isEmpty ? null : _customerId,
                            decoration: const InputDecoration(
                                labelText: 'Select Customer'),
                            items: [
                              const DropdownMenuItem(
                                  value: '', child: Text('— Enter manually —')),
                              ...customers.map((c) => DropdownMenuItem(
                                    value: c.id,
                                    child: Text(c.name),
                                  )),
                            ],
                            onChanged: (val) {
                              setState(() {
                                _customerId = val ?? '';
                                if (val != null && val.isNotEmpty) {
                                  final c = customers
                                      .firstWhere((x) => x.id == val);
                                  _customerName  = c.name;
                                  _customerGstin = c.gstin ?? '';
                                }
                              });
                            },
                          ),
                          const SizedBox(height: 12),
                        ],
                        TextFormField(
                          initialValue: _customerName,
                          decoration: const InputDecoration(
                              labelText: 'Customer Name *'),
                          onChanged: (v) => _customerName = v,
                          validator: (v) =>
                              v == null || v.isEmpty ? 'Required' : null,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          initialValue: _customerGstin,
                          decoration: const InputDecoration(
                              labelText: 'Customer GSTIN'),
                          textCapitalization: TextCapitalization.characters,
                          maxLength: 15,
                          onChanged: (v) => _customerGstin = v.toUpperCase(),
                        ),
                        const SizedBox(height: 4),
                        // Due date
                        TextFormField(
                          initialValue: _dueDate,
                          decoration: const InputDecoration(
                            labelText: 'Due Date (YYYY-MM-DD)',
                            prefixIcon:
                                Icon(Icons.calendar_today_outlined, size: 18),
                          ),
                          keyboardType: TextInputType.datetime,
                          onChanged: (v) => _dueDate = v,
                        ),
                        const SizedBox(height: 12),
                        // Interstate toggle
                        SwitchListTile.adaptive(
                          contentPadding: EdgeInsets.zero,
                          title: const Text(
                            'Interstate Supply (IGST)',
                            style: TextStyle(fontSize: 13, color: AppColors.slate700),
                          ),
                          value: _isInterstate,
                          onChanged: (v) => setState(() => _isInterstate = v),
                          activeColor: AppColors.green600,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),

                  // ── Line Items ─────────────────────────────────────────
                  _SectionCard(
                    title: 'Line Items',
                    trailing: TextButton.icon(
                      onPressed: () =>
                          setState(() => _items.add(_LineItem())),
                      icon: const Icon(Icons.add, size: 16),
                      label: const Text('Add'),
                    ),
                    child: Column(
                      children: [
                        ..._items.asMap().entries.map((entry) {
                          final i = entry.key;
                          final item = entry.value;
                          return _LineItemRow(
                            key: ValueKey(item.id),
                            item: item,
                            index: i,
                            canDelete: _items.length > 1,
                            onDelete: () =>
                                setState(() => _items.removeAt(i)),
                            onChanged: () => setState(() {}),
                          );
                        }),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),

                  // ── Totals summary ─────────────────────────────────────
                  _SectionCard(
                    title: 'Totals',
                    child: Builder(builder: (_) {
                      final g = _gst;
                      return Column(
                        children: [
                          _TotalLine('Subtotal', formatCurrency(g.subtotal)),
                          if (g.cgst > 0) _TotalLine('CGST', formatCurrency(g.cgst)),
                          if (g.sgst > 0) _TotalLine('SGST', formatCurrency(g.sgst)),
                          if (g.igst > 0) _TotalLine('IGST', formatCurrency(g.igst)),
                          const Divider(),
                          _TotalLine(
                            'Total',
                            formatCurrency(g.total),
                            bold: true,
                            valueColor: AppColors.green600,
                          ),
                        ],
                      );
                    }),
                  ),
                  const SizedBox(height: 12),

                  // ── Notes & Terms ──────────────────────────────────────
                  _SectionCard(
                    title: 'Notes & Terms',
                    child: Column(
                      children: [
                        TextFormField(
                          initialValue: _notes,
                          decoration: const InputDecoration(labelText: 'Notes'),
                          maxLines: 3,
                          onChanged: (v) => _notes = v,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          initialValue: _terms,
                          decoration: const InputDecoration(
                              labelText: 'Terms & Conditions'),
                          maxLines: 3,
                          onChanged: (v) => _terms = v,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),

                  // ── Template selector ──────────────────────────────────
                  _SectionCard(
                    title: 'PDF Template',
                    child: Row(
                      children: [
                        _TemplateChip(
                            id: 1,
                            label: 'Classic',
                            selected: _templateId == 1,
                            onTap: () => setState(() => _templateId = 1)),
                        const SizedBox(width: 8),
                        _TemplateChip(
                            id: 2,
                            label: 'Modern',
                            selected: _templateId == 2,
                            onTap: () => setState(() => _templateId = 2)),
                        const SizedBox(width: 8),
                        _TemplateChip(
                            id: 3,
                            label: 'Minimal',
                            selected: _templateId == 3,
                            onTap: () => setState(() => _templateId = 3)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Save button
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
                          : Text(isEdit ? 'Update Invoice' : 'Create Invoice'),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}

// ─── Helper line item class ──────────────────────────────────────────────────
class _LineItem {
  final int id = DateTime.now().microsecondsSinceEpoch;
  String name   = '';
  String hsn    = '';
  double qty    = 1;
  String unit   = 'Nos';
  double rate   = 0;
  double gstPct = 18;

  double get amount => calcItemAmount(qty, rate);

  _LineItem();

  factory _LineItem.fromModel(InvoiceItem m) => _LineItem()
    ..name   = m.name
    ..hsn    = m.hsn
    ..qty    = m.qty
    ..unit   = m.unit
    ..rate   = m.rate
    ..gstPct = m.gstPct;

  Map<String, dynamic> toMap() => {
        'name':   name,
        'hsn':    hsn,
        'qty':    qty,
        'unit':   unit,
        'rate':   rate,
        'gstPct': gstPct,
        'amount': amount,
      };
}

// ─── Line item row widget ─────────────────────────────────────────────────────
class _LineItemRow extends StatefulWidget {
  final _LineItem item;
  final int index;
  final bool canDelete;
  final VoidCallback onDelete;
  final VoidCallback onChanged;

  const _LineItemRow({
    super.key,
    required this.item,
    required this.index,
    required this.canDelete,
    required this.onDelete,
    required this.onChanged,
  });

  @override
  State<_LineItemRow> createState() => _LineItemRowState();
}

class _LineItemRowState extends State<_LineItemRow> {
  late final TextEditingController _nameCtrl;
  late final TextEditingController _hsnCtrl;
  late final TextEditingController _qtyCtrl;
  late final TextEditingController _rateCtrl;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(text: widget.item.name);
    _hsnCtrl  = TextEditingController(text: widget.item.hsn);
    _qtyCtrl  = TextEditingController(text: widget.item.qty.toString());
    _rateCtrl = TextEditingController(text: widget.item.rate.toString());
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _hsnCtrl.dispose();
    _qtyCtrl.dispose();
    _rateCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.slate50,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.slate200),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Text(
                '#${widget.index + 1}',
                style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.slate500),
              ),
              const Spacer(),
              if (widget.canDelete)
                GestureDetector(
                  onTap: widget.onDelete,
                  child: const Icon(Icons.delete_outline,
                      size: 18, color: Color(0xFFDC2626)),
                ),
            ],
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _nameCtrl,
            decoration: const InputDecoration(labelText: 'Item Name *'),
            onChanged: (v) {
              widget.item.name = v;
              widget.onChanged();
            },
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                flex: 2,
                child: TextField(
                  controller: _hsnCtrl,
                  decoration: const InputDecoration(labelText: 'HSN'),
                  onChanged: (v) => widget.item.hsn = v,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  controller: _qtyCtrl,
                  decoration: const InputDecoration(labelText: 'Qty'),
                  keyboardType: TextInputType.number,
                  onChanged: (v) {
                    widget.item.qty = double.tryParse(v) ?? 1;
                    widget.onChanged();
                  },
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: widget.item.unit,
                  decoration: const InputDecoration(labelText: 'Unit'),
                  items: ['Nos', 'Kg', 'L', 'Pcs', 'Box', 'Set', 'Hr']
                      .map((u) =>
                          DropdownMenuItem(value: u, child: Text(u)))
                      .toList(),
                  onChanged: (v) {
                    widget.item.unit = v ?? 'Nos';
                    widget.onChanged();
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                flex: 2,
                child: TextField(
                  controller: _rateCtrl,
                  decoration: const InputDecoration(labelText: 'Rate (₹)'),
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  onChanged: (v) {
                    widget.item.rate = double.tryParse(v) ?? 0;
                    widget.onChanged();
                  },
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: DropdownButtonFormField<double>(
                  value: widget.item.gstPct,
                  decoration: const InputDecoration(labelText: 'GST%'),
                  items: [0, 5, 12, 18, 28]
                      .map((g) => DropdownMenuItem(
                            value: g.toDouble(),
                            child: Text('$g%'),
                          ))
                      .toList(),
                  onChanged: (v) {
                    widget.item.gstPct = v ?? 18;
                    widget.onChanged();
                  },
                ),
              ),
              const SizedBox(width: 8),
              // Amount preview
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.green50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.green200),
                ),
                child: Text(
                  formatCurrency(widget.item.amount),
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.green700,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
class _SectionCard extends StatelessWidget {
  final String title;
  final Widget child;
  final Widget? trailing;

  const _SectionCard({
    required this.title,
    required this.child,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
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
              Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                  color: AppColors.slate900,
                ),
              ),
              if (trailing != null) ...[
                const Spacer(),
                trailing!,
              ],
            ],
          ),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}

class _TotalLine extends StatelessWidget {
  final String label;
  final String value;
  final bool bold;
  final Color? valueColor;

  const _TotalLine(this.label, this.value,
      {this.bold = false, this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: bold ? 14 : 12,
              fontWeight: bold ? FontWeight.w700 : FontWeight.w500,
              color: bold ? AppColors.slate900 : AppColors.slate600,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: bold ? 16 : 12,
              fontWeight: bold ? FontWeight.w800 : FontWeight.w600,
              color: valueColor ?? AppColors.slate700,
            ),
          ),
        ],
      ),
    );
  }
}

class _TemplateChip extends StatelessWidget {
  final int id;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _TemplateChip({
    required this.id,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? AppColors.green600 : AppColors.slate50,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: selected ? AppColors.green600 : AppColors.slate200,
          ),
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
