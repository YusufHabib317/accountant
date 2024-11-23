// import { AxiosError } from 'axios';
// import { HTTPS_CODES } from '../../data';
// import { FALLBACK_ERROR_MESSAGE, FALLBACK_ERROR_MESSAGE_KEY } from '@/data/constants';

// type BackendErrorBody = {
//   data: null;
//   error: {
//     status: number;
//     name: string;
//     message: string;
//     details: {
//       key?: string;
//       params?: Record<string, string | string[]>;
//     };
//   };
// };

// type ApiError = {
//   code: number;
//   message: {
//     fallback: string;
//     key: string;
//     params?: Record<string, string | string[]>;
//   };
//   errors?: Error[];
// };

// type CreateApiError = (args: { error: unknown }) => ApiError;

// const createApiError: CreateApiError = ({ error }) => {
//   let errorBody: ApiError;
//   if (error instanceof AxiosError) {
//     const { response } = error as AxiosError<BackendErrorBody>;

//     errorBody = {
//       code: response?.data?.error?.status || HTTPS_CODES.BAD_REQUEST,
//       message: {
//         fallback: response?.data?.error?.message || FALLBACK_ERROR_MESSAGE,
//         key:
//           (response?.data.error?.details?.key as string)
//           || response?.data.error?.name
//           || FALLBACK_ERROR_MESSAGE_KEY,
//         params: response?.data?.error?.details?.params ?? {},
//       },
//       errors: process.env.DEBUG ? [error as Error] : [],
//     };
//   } else {
//     errorBody = {
//       code: HTTPS_CODES.INTERNAL_SERVER_ERROR,
//       message: {
//         fallback: FALLBACK_ERROR_MESSAGE,
//         key: FALLBACK_ERROR_MESSAGE_KEY,
//       },
//       errors: process.env.DEBUG ? [error as Error] : [],
//     };
//   }

//   // eslint-disable-next-line no-console
//   if (process.env.DEBUG) console.log(error);

//   return errorBody;
// };

// export default createApiError;
import { HTTPS_CODES } from '@/data';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

interface ApiError {
  code: number;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: any;
}

export const createApiError = ({ error }: { error: unknown }): ApiError => {
  // Handle Prisma Errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return {
          code: HTTPS_CODES.CONFLICT,
          message: 'Record already exists',
          errors: {
            field: error.meta?.target as string[],
            message: `A record with this ${(error.meta?.target as string[])?.join(', ')} already exists`,
          },
        };

      case 'P2003': // Foreign key constraint violation
        return {
          code: HTTPS_CODES.CONFLICT,
          message: 'Related record exists',
          errors: {
            field: error.meta?.field_name,
            message: 'Cannot delete record because it has related records',
          },
        };

      case 'P2025': // Record not found
        return {
          code: HTTPS_CODES.NOT_FOUND,
          message: 'Record not found',
          errors: {
            message: 'The requested record does not exist',
          },
        };

      case 'P2014': // The change you are trying to make would violate the required relation
        return {
          code: HTTPS_CODES.BAD_REQUEST,
          message: 'Invalid relation',
          errors: {
            message: 'Invalid relationship between records',
          },
        };

      case 'P2021': // Table does not exist
        return {
          code: HTTPS_CODES.INTERNAL_SERVER_ERROR,
          message: 'Database schema error',
          errors: {
            message: 'Database table does not exist',
          },
        };

      default:
        return {
          code: HTTPS_CODES.INTERNAL_SERVER_ERROR,
          message: 'Database error',
          errors: {
            code: error.code,
            message: error.message,
          },
        };
    }
  }

  // Handle Zod Validation Errors
  if (error instanceof ZodError) {
    return {
      code: HTTPS_CODES.BAD_REQUEST,
      message: 'Validation error',
      errors: error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    };
  }

  // Handle standard JavaScript errors
  if (error instanceof Error) {
    return {
      code: HTTPS_CODES.INTERNAL_SERVER_ERROR,
      message: error.message,
      errors: {
        message: error.message,
      },
    };
  }

  // Handle unknown errors
  return {
    code: HTTPS_CODES.INTERNAL_SERVER_ERROR,
    message: 'An unexpected error occurred',
    errors: {
      message: 'Unknown error',
    },
  };
};
