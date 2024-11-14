import { z } from 'zod';

const SuccessResponseSchema = z.object({
  success: z.boolean().default(true),
  message: z.string().default(''),
  details: z.optional(z.any()),
  meta: z.optional(z.object({
    totalCount: z.number(),
    page: z.number(),
    pageSize: z.number(),
  })),
});

export const SuccessResponseTransformer = SuccessResponseSchema.transform((data) => ({
  success: data.success,
  message: data.message,
  details: data.details,
  meta: data.meta,
}));

const ErrorResponseSchema = z.object({
  success: z.boolean().default(false),
  message: z.string().default(''),
  details: z.optional(z.any()),
});

export const ErrorResponseTransformer = ErrorResponseSchema.transform((data) => ({
  success: data.success,
  message: data.message,
  details: data.details,
}));

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
