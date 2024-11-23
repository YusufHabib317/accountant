import { suppliersApiResponse } from '@/query/suppliers/types';

export const serializer = (
  data: suppliersApiResponse[number] | undefined,
  mode: 'create' | 'update',
) => {
  if (mode === 'update' && data) {
    return {
      id: data.id || '',
      name: data.name || '',
      phone: data.phone || '',
      address: data.address || '',
      city: data.city || '',
      email: data.email || '',
      companyName: data.companyName || '',
      notes: data.notes || '',
      products: data.products || null,
      invoice: data.invoice || null,
      createAt: data.createAt || null,
      updateAt: data.updateAt || null,
    };
  }

  return {
    id: '',
    name: '',
    phone: '',
    address: '',
    city: '',
    email: '',
    companyName: '',
    notes: '',
    products: null,
    invoice: null,
    createAt: null,
    updateAt: null,
  };
};
