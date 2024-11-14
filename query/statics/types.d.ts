import {
  createExpenseSchema,
  expensesApiResponseSchema,
  updateExpenseSchema,
} from '@/schema/expenses';
import { Pagination } from '@/types/pagination.type';
import { z } from 'zod';

export type Filter = {
  createdAtGte?: string | null;
  createdAtLte?: string | null;
};

export interface getExpenseQueryProps {
  pagination?: Pagination;
  filters?: Filter;
  search?: string;
  sort?: {
    sortBy: string | undefined;
    sortOrder: 'asc' | 'desc';
  };
}

export type ExpensesApiResponse = z.infer<typeof expensesApiResponseSchema>;

export type ExpenseCreateForm = z.infer<typeof createExpenseSchema>;

export type ExpenseUpdateForm = z.infer<typeof updateExpenseSchema>;
