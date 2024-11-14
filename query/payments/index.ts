import { apiEndpoints } from '@/data/api-endpoints';
import { ApiClient } from '@/lib/axios';
import { handleApiError } from '@/utils/api-handlers/handle-backend-error';
import { HTTPS_CODES } from '@/data';
import { getPaymentsQueryProps } from './types';

export enum paymentsQueryKeys {
 payments = 'payments',
  payment = 'payment',
  create = 'payment-create',
  update = 'payment-update',
}

// get payments
const getPaymentsRequest = (props: getPaymentsQueryProps) => {
  const {
    pagination = { page: 1, pageSize: 10 },
    filters = {},
    sort = { sortBy: 'createdAt', sortOrder: 'desc' },
    search = '',
  } = props;
  return ApiClient.get(apiEndpoints.payments(), {
    params: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      search,
      ...filters,
      ...sort,
    },
  })
    .then((res) => res?.data)
    .catch((e) => {
      handleApiError(e);
      throw e.response?.data;
    });
};

export const getPaymentsQuery = (props: getPaymentsQueryProps) => ({
  queryKey: [
    paymentsQueryKeys.payments,
    props?.filters,
    props?.pagination,
    props?.sort,
    props?.search,
  ],
  queryFn: () => getPaymentsRequest({ ...props }),
  refetchOnWindowFocus: false,
  retry: (failureCount: number, error: { code: HTTPS_CODES }) => error?.code !== HTTPS_CODES.UNAUTHORIZED,
});

// get payment
const getPaymentRequest = (id: string) => ApiClient.get(apiEndpoints.paymentsByIdAsParams(id))
  .then((res) => res.data)
  .catch((err) => {
    handleApiError(err);
    throw err.response.data;
  });
export const getPaymentQuery = (id: string) => ({
  queryKey: [paymentsQueryKeys.payment, id],
  queryFn: () => getPaymentRequest(id),
  refetchOnWindowFocus: false,
  retry: (failureCount: number, error: { code: HTTPS_CODES }) => error?.code !== HTTPS_CODES.UNAUTHORIZED,
});
