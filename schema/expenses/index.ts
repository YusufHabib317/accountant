import { z } from 'zod';

export const expenseApiResponseSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  category: z.string().optional(),
  amount: z.number().positive('Price must be a positive number'),
  date: z.string(),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const expenseApiResponseTransformer = expenseApiResponseSchema.transform((item) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  amount: item.amount,
  date: item.date,
  notes: item.notes,
  createAt: item.created_at,
  updateAt: item.updated_at,
}));

export const expensesApiResponseSchema = z.array(expenseApiResponseTransformer);

export const createExpenseSchema = z.object({
  name: z.string().min(3, { message: 'name is require' }),
  category: z.string().min(3, { message: 'category is require' }),
  amount: z.coerce.number().positive(),
  date: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  notes: z.string(),
});

export const updateExpenseSchema = createExpenseSchema.partial({
  date: true,
});

export const getExpenseSchema = z.object({
  search: z.string().optional(),
  filter: z.string().optional(),
  sortBy: z.string().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).default(10),
});
