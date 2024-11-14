import { SaleInvoiceApiResponse } from '@/query/sale-invoice/types';

export const serializer = (
  data: SaleInvoiceApiResponse[number] | undefined,
  mode: 'create' | 'update',
) => {
  if (mode === 'update' && data) {
    return {
      id: data.id,
      customerName: data.customerName,
      date: data.date,
      notes: data.notes,
      paid: data.paid,
      remaining: data.remaining,
      subtotal: data.subtotal,
      tax: data.tax,
      total: data.total,
      items: data.items,
    };
  }

  return {
    date: '',
    notes: '',
    customerName: '',
    paid: 0,
    remaining: 0,
    subtotal: 0,
    tax: 0,
    total: 0,
    items: [],
  };
};
