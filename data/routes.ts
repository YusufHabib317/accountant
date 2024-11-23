import {
  BarChart2,
  UserPlus,
  Box,
  Wallet,
  BadgeDollarSign,
  ShoppingBasket,
} from 'lucide-react';

export const authConfigRoutes = {
  DEFAULT_LOGIN_REDIRECT: '/',
  LOGIN_PATH: '/auth/login',
  REGISTER_PATH: '/auth/register',
  RESET_PASSWORD_PATH: '/auth/reset-password',
  VERIFY_PATH: '/auth/verify',
  OTP_EMAIL_VERIFY_PATH: '/auth/otp-email-verification',
} as const;

export const publicRoutes: readonly string[] = [
  authConfigRoutes.LOGIN_PATH,
  authConfigRoutes.REGISTER_PATH,
  authConfigRoutes.RESET_PASSWORD_PATH,
  authConfigRoutes.VERIFY_PATH,
  '/api/auth',
] as const;

export const ROUTES = {

  logout: { key: 'Log out', path: '/auth/logout', icon: 'logout' },
  root: {
    key: 'Home',
    path: '/',
  },
  dashboard: {
    key: 'Statics',
    path: '/dashboard/statics',
  },
  supplier: {
    key: 'Suppliers',
    path: '/dashboard/suppliers',
  },
  product: {
    key: 'Products',
    path: '/dashboard/products',
  },
  purchaseInvoice: {
    key: 'Purchase Invoices',
    path: '/dashboard/purchase-invoices',
  },
  saleInvoice: {
    key: 'Sale Invoice',
    path: '/dashboard/sale-invoices',
  },
  expense: {
    key: 'Expenses',
    path: '/dashboard/expenses',
  },
};
export const links = [
  {
    label: ROUTES.dashboard.key,
    icon: BarChart2,
    href: ROUTES.dashboard.path,
  },
  {
    label: ROUTES.supplier.key,
    icon: UserPlus,
    href: ROUTES.supplier.path,
  },
  {
    label: ROUTES.product.key,
    icon: Box,
    href: ROUTES.product.path,
  },
  {
    label: ROUTES.purchaseInvoice.key,
    icon: ShoppingBasket,
    href: ROUTES.purchaseInvoice.path,
  },
  {
    label: ROUTES.saleInvoice.key,
    icon: BadgeDollarSign,
    href: ROUTES.saleInvoice.path,
  },
  {
    label: ROUTES.expense.key,
    icon: Wallet,
    href: ROUTES.expense.path,
  },
];
