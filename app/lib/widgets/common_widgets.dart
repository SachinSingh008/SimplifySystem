import 'package:flutter/material.dart';
import '../core/theme.dart';

class StatusBadge extends StatelessWidget {
  final String status;
  final bool small;
  const StatusBadge({super.key, required this.status, this.small = false});

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = _colors(status);
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: small ? 8 : 10,
        vertical: small ? 3 : 4,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          fontSize: small ? 9 : 10,
          fontWeight: FontWeight.w700,
          color: fg,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  (Color, Color) _colors(String s) {
    switch (s) {
      case 'paid':
      case 'closed':
        return (AppColors.green100, AppColors.green700);
      case 'pending':
      case 'open':
        return (const Color(0xFFFEF3C7), const Color(0xFFB45309));
      case 'cancelled':
        return (const Color(0xFFFEE2E2), const Color(0xFFDC2626));
      default: // draft
        return (AppColors.slate100, AppColors.slate600);
    }
  }
}

/// Stat card — mirrors web StatCard component
class StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final int? trend;
  final AppCardColor color;

  const StatCard({
    super.key,
    required this.title,
    required this.value,
    required this.icon,
    this.trend,
    this.color = AppCardColor.green,
  });

  @override
  Widget build(BuildContext context) {
    final (bg, iconBg, iconFg, trendFg) = _palette(color);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.slate200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: iconBg,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 20, color: iconFg),
              ),
              if (trend != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.green100,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '+$trend%',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: trendFg,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: AppColors.slate900,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            title,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.slate500,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  (Color, Color, Color, Color) _palette(AppCardColor c) {
    switch (c) {
      case AppCardColor.blue:
        return (
          const Color(0xFFEFF6FF),
          const Color(0xFFDEEBFF),
          const Color(0xFF2563EB),
          const Color(0xFF1D4ED8),
        );
      case AppCardColor.yellow:
        return (
          const Color(0xFFFFFBEB),
          const Color(0xFFFEF3C7),
          const Color(0xFFD97706),
          const Color(0xFFB45309),
        );
      case AppCardColor.red:
        return (
          const Color(0xFFFFF1F2),
          const Color(0xFFFFE4E6),
          const Color(0xFFE11D48),
          const Color(0xFFBE123C),
        );
      default:
        return (
          AppColors.green50,
          AppColors.green100,
          AppColors.green700,
          AppColors.green800,
        );
    }
  }
}

enum AppCardColor { green, blue, yellow, red }

/// Empty state widget
class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;

  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: AppColors.green50,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Icon(icon, size: 36, color: AppColors.green600),
            ),
            const SizedBox(height: 20),
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.slate900,
              ),
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 6),
              Text(
                subtitle!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.slate500,
                ),
              ),
            ],
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: onAction,
                icon: const Icon(Icons.add, size: 18),
                label: Text(actionLabel!),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Loading shimmer card
class ShimmerCard extends StatelessWidget {
  const ShimmerCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 56,
      decoration: BoxDecoration(
        color: AppColors.slate100,
        borderRadius: BorderRadius.circular(10),
      ),
    );
  }
}

/// App-wide snackbar helper
void showSnack(BuildContext context, String msg, {bool error = false}) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(msg),
      backgroundColor: error ? const Color(0xFFDC2626) : const Color(0xFF1E293B),
    ),
  );
}
