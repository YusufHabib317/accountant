export const apiEndpoints = {
  // Suppliers
  suppliers: (id?: string) => (id ? `/suppliers/${id}` : '/suppliers'),
  suppliersByIdAsParams: (id?: string) => `/suppliers?id=${id}`,

  // Products
  products: (id?: string) => (id ? `/products/${id}` : '/products'),
  productsByIdAsParams: (id?: string) => `/products?id=${id}`,

  // Purchase Invoices
  purchaseInvoices: (id?: string) => (id ? `/purchase-invoices/${id}` : '/purchase-invoices'),
  purchaseInvoicesByIdAsParams: (id?: string) => `/purchase-invoices?id=${id}`,

  // Purchase Items
  purchaseItemsByPurchaseInvoice: (purchaseInvoiceId:string) => `/purchase-items?purchaseInvoiceId=${purchaseInvoiceId}`,

  // Sale Invoices
  saleInvoices: (id?: string) => (id ? `/sale-invoices/${id}` : '/sale-invoices'),
  saleInvoicesByIdAsParams: (id?: string) => `/sale-invoices?id=${id}`,

  // Expenses
  expenses: (id?: string) => (id ? `/expenses/${id}` : '/expenses'),
  expensesByIdAsParams: (id?: string) => `/expenses?id=${id}`,

  // Payments
  payments: (id?: string) => (id ? `/payments/${id}` : '/payments'),
  paymentsByIdAsParams: (id?: string) => `/payments?id=${id}`,

  // Statics
  statics: () => '/statics',
};
