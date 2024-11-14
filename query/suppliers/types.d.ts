import { createSupplierSchema, suppliersApiResponseSchema } from '@/schema/suppliers';
import { Pagination } from '@/types/pagination.type';
import { z } from 'zod';

export type Filter = {
  createdAtGte?: string | null;
  createdAtLte?: string | null;
};

export interface getSuppliersQueryProps {
  pagination?: Pagination;
  filters?: Filter;
  search?: string;
  sort?: {
    sortBy: string | undefined;
    sortOrder: 'asc' | 'desc';
  };
}

export type supplierFormRequest = z.infer<typeof createSupplierSchema>;

export type suppliersApiResponse = z.infer<typeof suppliersApiResponseSchema>;
