import { AxiosError } from 'axios';
import { HTTPS_CODES } from '../../data';
import { FALLBACK_ERROR_MESSAGE, FALLBACK_ERROR_MESSAGE_KEY } from '@/data/constants';

type BackendErrorBody = {
  data: null;
  error: {
    status: number;
    name: string;
    message: string;
    details: {
      key?: string;
      params?: Record<string, string | string[]>;
    };
  };
};

type ApiError = {
  code: number;
  message: {
    fallback: string;
    key: string;
    params?: Record<string, string | string[]>;
  };
  errors?: Error[];
};

type CreateApiError = (args: { error: unknown }) => ApiError;

const createApiError: CreateApiError = ({ error }) => {
  let errorBody: ApiError;
  if (error instanceof AxiosError) {
    const { response } = error as AxiosError<BackendErrorBody>;

    errorBody = {
      code: response?.data?.error?.status || HTTPS_CODES.BAD_REQUEST,
      message: {
        fallback: response?.data?.error?.message || FALLBACK_ERROR_MESSAGE,
        key:
          (response?.data.error?.details?.key as string)
          || response?.data.error?.name
          || FALLBACK_ERROR_MESSAGE_KEY,
        params: response?.data?.error?.details?.params ?? {},
      },
      errors: process.env.DEBUG ? [error as Error] : [],
    };
  } else {
    errorBody = {
      code: HTTPS_CODES.INTERNAL_SERVER_ERROR,
      message: {
        fallback: FALLBACK_ERROR_MESSAGE,
        key: FALLBACK_ERROR_MESSAGE_KEY,
      },
      errors: process.env.DEBUG ? [error as Error] : [],
    };
  }

  // eslint-disable-next-line no-console
  if (process.env.DEBUG) console.log(error);

  return errorBody;
};

export default createApiError;
