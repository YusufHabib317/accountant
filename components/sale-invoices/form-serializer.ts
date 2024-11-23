import { ProductsApiResponse } from '@/query/products/types';
import { SaleInvoiceApiResponse } from '@/query/sale-invoice/types';

export function serializer(
  data: SaleInvoiceApiResponse[number] | undefined,
  mode: 'create' | 'update',
  products:ProductsApiResponse | undefined,
) {
  if (!data) {
    return {
      date: '',
      customerName: '',
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      paid: 0,
      remaining: 0,
      notes: '',
    };
  }

  return {
    date: data.date,
    customerName: data.customerName,
    items: data.items.map((item) => {
      const product = products?.find((p) => p.id === item.productId);
      return {
        id: item.id,
        productId: item.productId,
        price: item.price,
        quantity: item.quantity,
        total: item.total,
        stock: product?.stock || 0,
      };
    }),
    subtotal: data.subtotal,
    tax: data.tax,
    total: data.total,
    paid: data.paid,
    remaining: data.remaining,
    notes: data.notes,
  };
}
