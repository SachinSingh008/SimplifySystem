import 'package:intl/intl.dart';

String formatCurrency(double amount) {
  final f = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 2,
  );
  return f.format(amount);
}

String formatDate(String? isoString) {
  if (isoString == null || isoString.isEmpty) return '—';
  try {
    final dt = DateTime.parse(isoString);
    return DateFormat('dd MMM yyyy').format(dt);
  } catch (_) {
    return isoString;
  }
}

String formatDateShort(String? isoString) {
  if (isoString == null || isoString.isEmpty) return '—';
  try {
    final dt = DateTime.parse(isoString);
    return DateFormat('dd/MM/yy').format(dt);
  } catch (_) {
    return isoString;
  }
}

/// Calculate GST from line items
({double subtotal, double cgst, double sgst, double igst, double total})
    calculateGst(List<({double amount, double gstPct})> items, bool isInterstate) {
  double subtotal = 0;
  double taxTotal = 0;

  for (final item in items) {
    subtotal += item.amount;
    taxTotal += item.amount * item.gstPct / 100;
  }

  final cgst = isInterstate ? 0.0 : taxTotal / 2;
  final sgst = isInterstate ? 0.0 : taxTotal / 2;
  final igst = isInterstate ? taxTotal : 0.0;
  final total = subtotal + taxTotal;

  return (
    subtotal: subtotal,
    cgst: cgst,
    sgst: sgst,
    igst: igst,
    total: total,
  );
}

double calcItemAmount(double qty, double rate) => qty * rate;

String initials(String? name) {
  if (name == null || name.isEmpty) return 'U';
  final parts = name.trim().split(' ');
  if (parts.length == 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
