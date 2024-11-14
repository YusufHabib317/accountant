import { ProductsApiResponse } from '@/query/products/types';

export const serializer = (
  data: ProductsApiResponse[number] | undefined,
  mode: 'create' | 'update',
) => {
  if (mode === 'update' && data) {
    return {
      name: data.name || '',
      code: data.code || '',
      price: data.price ?? 0,
      salePrice: data.salePrice ?? 0,
      cost: data.cost,
    };
  }

  return {
    name: '',
    code: '',
    price: 0,
    salePrice: 0,
    cost: 0,
  };
};
