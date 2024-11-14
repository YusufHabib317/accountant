import { HTTPS_CODES } from '@/data';
import { ErrorResponse, ErrorResponseTransformer } from '@/types/api-response';
import { NextResponse } from 'next/server';
import z from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleResponse = (res: NextResponse, schema: z.ZodSchema, data: any, statusCode: number) => {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const errorResponse: ErrorResponse = {
      success: false,
      message: 'Response validation failed',
      details: parsed.error.errors,
    };

    return NextResponse.json(ErrorResponseTransformer.parse(errorResponse), {
      status: HTTPS_CODES.INTERNAL_SERVER_ERROR,
    });
  }

  return NextResponse.json(parsed.data, {
    status: statusCode,
  });
};
