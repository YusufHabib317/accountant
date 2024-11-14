import {
  createPurchaseSchema,
  createPurchaseSchemaWithRefinements,
  purchasesInvoicesApiResponseSchema,
  updatePurchaseSchema,
} from '@/schema/purchase-invoices';
import { Pagination } from '@/types/pagination.type';
import { z } from 'zod';

export type Filter = {
  createdAtGte?: string | null;
  createdAtLte?: string | null;
};

export interface getPurchaseInvoicesQueryProps {
  pagination?: Pagination;
  filters?: Filter;
  search?: string;
  sort?: {
    sortBy: string | undefined;
    sortOrder: 'asc' | 'desc';
  };
}

export type PurchaseInvoiceApiResponse = z.infer<typeof purchasesInvoicesApiResponseSchema>;

export type PurchaseInvoiceCreateForm = z.infer<typeof createPurchaseSchema>;

export type PurchaseInvoiceUpdateForm = z.infer<typeof updatePurchaseSchema>;

export type PurchaseInvoiceCreateFormWithRefines = z.infer<typeof createPurchaseSchemaWithRefinements>;
