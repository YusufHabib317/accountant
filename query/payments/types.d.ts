import { paymentsApiResponseSchema } from '@/schema/payments';
import { Pagination } from '@/types/pagination.type';
import { z } from 'zod';

export type Filter = {
  createdAtGte?: string | null;
  createdAtLte?: string | null;
};

export interface getPaymentsQueryProps {
  pagination?: Pagination;
  filters?: Filter;
  search?: string;
  sort?: {
    sortBy: string | undefined;
    sortOrder: 'asc' | 'desc';
  };
}

export type PaymentsApiResponse = z.infer<typeof paymentsApiResponseSchema>;
