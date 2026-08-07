import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/providers.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/invoices/invoices_screen.dart';
import '../screens/invoices/invoice_form_screen.dart';
import '../screens/invoices/invoice_detail_screen.dart';
import '../screens/quotations/quotations_screen.dart';
import '../screens/quotations/quotation_form_screen.dart';
import '../screens/customers/customers_screen.dart';
import '../screens/customers/customer_detail_screen.dart';
import '../screens/products/products_screen.dart';
import '../screens/payments/payments_screen.dart';
import '../screens/settings/settings_screen.dart';
import '../widgets/shell_scaffold.dart';

final _rootKey = GlobalKey<NavigatorState>();
final _shellKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    navigatorKey: _rootKey,
    initialLocation: '/dashboard',
    redirect: (context, state) {
      final isLoggedIn = authState.value != null;
      final isAuthRoute = state.matchedLocation == '/login' ||
          state.matchedLocation == '/register';
      if (!isLoggedIn && !isAuthRoute) return '/login';
      if (isLoggedIn && isAuthRoute) return '/dashboard';
      return null;
    },
    routes: [
      // Auth routes (no shell)
      GoRoute(
        path: '/login',
        builder: (_, __) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (_, __) => const RegisterScreen(),
      ),

      // App shell with bottom nav
      ShellRoute(
        navigatorKey: _shellKey,
        builder: (context, state, child) =>
            ShellScaffold(child: child),
        routes: [
          GoRoute(
            path: '/dashboard',
            pageBuilder: (_, state) => NoTransitionPage(
              key: state.pageKey,
              child: const DashboardScreen(),
            ),
          ),
          GoRoute(
            path: '/invoices',
            pageBuilder: (_, state) => NoTransitionPage(
              key: state.pageKey,
              child: const InvoicesScreen(),
            ),
          ),
          GoRoute(
            path: '/quotations',
            pageBuilder: (_, state) => NoTransitionPage(
              key: state.pageKey,
              child: const QuotationsScreen(),
            ),
          ),
          GoRoute(
            path: '/customers',
            pageBuilder: (_, state) => NoTransitionPage(
              key: state.pageKey,
              child: const CustomersScreen(),
            ),
          ),
          GoRoute(
            path: '/products',
            pageBuilder: (_, state) => NoTransitionPage(
              key: state.pageKey,
              child: const ProductsScreen(),
            ),
          ),
          GoRoute(
            path: '/payments',
            pageBuilder: (_, state) => NoTransitionPage(
              key: state.pageKey,
              child: const PaymentsScreen(),
            ),
          ),
          GoRoute(
            path: '/settings',
            pageBuilder: (_, state) => NoTransitionPage(
              key: state.pageKey,
              child: const SettingsScreen(),
            ),
          ),
        ],
      ),

      // Full-screen detail routes (outside shell)
      GoRoute(
        path: '/invoices/new',
        builder: (_, __) => const InvoiceFormScreen(),
      ),
      GoRoute(
        path: '/invoices/:id',
        builder: (_, state) =>
            InvoiceDetailScreen(invoiceId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/invoices/:id/edit',
        builder: (_, state) =>
            InvoiceFormScreen(invoiceId: state.pathParameters['id']),
      ),
      GoRoute(
        path: '/quotations/new',
        builder: (_, __) => const QuotationFormScreen(),
      ),
      GoRoute(
        path: '/customers/:id',
        builder: (_, state) =>
            CustomerDetailScreen(customerId: state.pathParameters['id']!),
      ),
    ],
  );
});
