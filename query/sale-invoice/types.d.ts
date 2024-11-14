import {
  createSaleSchema,
  createSaleSchemaWithRefinements,
  saleInvoicesApiResponseSchema,
  updateSaleSchema,
} from '@/schema/sale-invoices';
import { Pagination } from '@/types/pagination.type';
import { z } from 'zod';

export type Filter = {
  createdAtGte?: string | null;
  createdAtLte?: string | null;
};

export interface getSaleInvoicesQueryProps {
  pagination?: Pagination;
  filters?: Filter;
  search?: string;
  sort?: {
    sortBy: string | undefined;
    sortOrder: 'asc' | 'desc';
  };
}

export type SaleInvoiceApiResponse = z.infer<typeof saleInvoicesApiResponseSchema>;

export type SaleInvoiceCreateForm = z.infer<typeof createSaleSchema>;

export type SaleInvoiceUpdateForm = z.infer<typeof updateSaleSchema>;

export type SaleInvoiceCreateFormWithRefines = z.infer<typeof createSaleSchemaWithRefinements>;
