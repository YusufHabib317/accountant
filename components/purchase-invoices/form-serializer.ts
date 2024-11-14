import { PurchaseInvoiceApiResponse } from '@/query/purchase-invoice/types';

export const serializer = (
  data: PurchaseInvoiceApiResponse[number] | undefined,
  mode: 'create' | 'update',
) => {
  if (mode === 'update' && data) {
    return {
      id: data.id,
      date: data.date,
      notes: data.notes,
      paid: data.paid,
      remaining: data.remaining,
      subtotal: data.subtotal,
      supplierId: data?.supplierId || '',
      tax: data.tax,
      total: data.total,
      items: data.items,
    };
  }

  return {
    date: '',
    notes: '',
    paid: 0,
    remaining: 0,
    subtotal: 0,
    supplierId: '',
    tax: 0,
    total: 0,
    items: [],
  };
};
