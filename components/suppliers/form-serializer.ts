/* eslint-disable complexity */
/* eslint-disable sonarjs/cognitive-complexity */

import { suppliersApiResponse } from '@/query/suppliers/types';

export const serializer = (
  data: suppliersApiResponse[number] | undefined,
  mode: 'create' | 'update',
) => {
  if (mode === 'update' && data) {
    return {
      id: data.id || '',
      name: data.name || '',
      contactInfo: data.contactInfo || '',
      phone: data.phone || '',
      address: data.address || '',
      city: data.city || '',
      email: data.email || '',
      companyName: data.companyName || '',
      contactPerson: data.contactPerson || '',
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
    contactInfo: '',
    phone: '',
    address: '',
    city: '',
    email: '',
    companyName: '',
    contactPerson: '',
    notes: '',
    products: null,
    invoice: null,
    createAt: null,
    updateAt: null,
  };
};
