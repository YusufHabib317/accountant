/* eslint-disable no-console */
import { NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { HTTPS_CODES } from '@/data';

export default function createApiResponse(
  schema: ZodSchema,
  data: unknown,
  status: number = HTTPS_CODES.SUCCESS,
) {
  try {
    const transformedResponse = schema.parse({
      ...(data as Object),
    });
    return NextResponse.json(transformedResponse, { status });
  } catch (error) {
    console.error('Validation error in createApiResponse:', error);
    return NextResponse.json(
      { error: 'Validation error', details: error },
      { status: HTTPS_CODES.BAD_REQUEST },
    );
  }
}
