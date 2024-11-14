import { ErrorBackendType, ErrorFrontendType } from '@/types/error.type';
import { HTTPS_CODES, HTTPS_CODES_TYPE } from '../../data';
import { signOut } from '@/lib/auth-client';
import { toast } from 'sonner';

interface ErrorItem {
  message: string;
  key: string;
}

export const handleBackendError = (
  e: ErrorBackendType,
  errors: ErrorItem[],
  throwError: boolean = false,
) => {
  const errorMessageKey = 'generalError';
  const errorMessage = e?.response?.data?.error?.message ?? '';
  const messageItem = errors.find(
    (item) => item.message.trim().toLowerCase() === errorMessage.trim().toLowerCase(),
  );
  if (messageItem && throwError) throw new Error(messageItem.key);
  else if (messageItem) return messageItem.key;
  else return errorMessageKey;
};

export const createApiError = (
  code: HTTPS_CODES_TYPE,
  message: string,
  key: string,
  trace?: string,
  errors?: ErrorItem[],
) => ({
  code,
  message,
  key,
  trace: trace ?? '',
  errors: errors ?? [],
});
const errorCache: { [key: string]: number } = {};
export const handleApiError = (error: ErrorFrontendType) => {
  let errorMessageKey = 'General Error';
  let defaultMessage = '';

  if (
    error.response?.data?.code === HTTPS_CODES.UNAUTHORIZED
    || error.response?.data?.code === HTTPS_CODES.FORBIDDEN
  ) {
    errorMessageKey = 'Unauthorized';
    signOut();
  } else if (error.response) {
    const { data } = error.response;
    const key = data.message?.key ?? '';
    defaultMessage = data.message?.fallback ?? '';
    errorMessageKey = key || 'General Error';
  }
  // else if (error.request) {
  //   // The request was made but no response was received
  //   // `error.request` is an instance of XMLHttpRequest in the browser
  //   // and an instance of http.ClientRequest in node.js
  // } else {
  //   // Something happened in setting up the request that triggered an Error
  // }

  const errorMessage = defaultMessage
    ? `${defaultMessage} `
    : ` ${errorMessageKey}`;

  const canShowNotification = Date.now() - (errorCache[errorMessageKey ?? ''] ?? 0) > 30 * 1000;
  if (typeof window !== 'undefined' && canShowNotification) {
    errorCache[errorMessageKey || ''] = Date.now();
    toast.error(errorMessage);
  }

  // return errorMessageKey;
};
