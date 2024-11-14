/* eslint-disable no-console */
/* eslint-disable sonarjs/no-duplicate-string */
import { NextRequest, NextResponse } from 'next/server';
import { HTTPS_CODES } from '@/data';
import createApiError from '@/utils/api-handlers/create-api-error';
import { handleResponse } from '@/utils/handle-response';
import { SuccessResponseTransformer } from '@/types/api-response';

import { getStatics } from '@/db/statics';

export async function GET(req: NextRequest, res:NextResponse) {
  try {
    const statics = await getStatics();
    const successResponse = {
      success: true,
      message: statics.message,
      details: {
        data: statics.details,
      },
    };
    return handleResponse(res, SuccessResponseTransformer, successResponse, HTTPS_CODES.SUCCESS);
  } catch (e) {
    const error = createApiError({ error: e });
    return NextResponse.json(error, { status: error.code });
  }
}
