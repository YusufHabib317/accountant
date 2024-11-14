import { createProductSchema, productsApiResponseSchema, updateProductSchema } from '@/schema/products';
import { Pagination } from '@/types/pagination.type';
import { z } from 'zod';

export type Filter = {
  createdAtGte?: string | null;
  createdAtLte?: string | null;
};

export interface getProductsQueryProps {
  pagination?: Pagination;
  filters?: Filter;
  search?: string;
  sort?: {
    sortBy: string | undefined;
    sortOrder: 'asc' | 'desc';
  };
}

export type ProductsApiResponse = z.infer<typeof productsApiResponseSchema>;

export type CreateProductRequest = z.infer<typeof createProductSchema>;

export type UpdateProductRequest = z.infer<typeof updateProductSchema>;
