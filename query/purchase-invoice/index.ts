import { apiEndpoints } from '@/data/api-endpoints';
import { ApiClient } from '@/lib/axios';
import { handleApiError } from '@/utils/api-handlers/handle-backend-error';
import { HTTPS_CODES } from '@/data';
import { getPurchaseInvoicesQueryProps, PurchaseInvoiceCreateForm, PurchaseInvoiceUpdateForm } from './types';

enum queryKeys {
  purchaseInvoices = 'purchase-invoices',
  purchaseInvoice = 'purchase-invoice',
  create = 'purchase-invoice-create',
  update = 'purchase-invoice-update',
}

// get purchase invoices
const getPurchaseInvoicesRequest = (props: getPurchaseInvoicesQueryProps) => {
  const {
    pagination = { page: 1, pageSize: 10 },
    filters = {},
    sort = { sortBy: 'createdAt', sortOrder: 'desc' },
    search = '',
  } = props;
  return ApiClient.get(apiEndpoints.purchaseInvoices(), {
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
export const getPurchaseInvoicesQuery = (props: getPurchaseInvoicesQueryProps) => ({
  queryKey: [
    queryKeys.purchaseInvoices,
    props?.filters,
    props?.pagination,
    props?.sort,
    props?.search,
  ],
  queryFn: () => getPurchaseInvoicesRequest({ ...props }),
  refetchOnWindowFocus: false,
  retry: (failureCount: number, error: { code: HTTPS_CODES }) => error?.code !== HTTPS_CODES.UNAUTHORIZED,
});

// get purchase invoice
const getPurchaseInvoiceRequest = (id: string) => ApiClient.get(apiEndpoints.purchaseInvoicesByIdAsParams(id))
  .then((res) => res.data)
  .catch((err) => {
    handleApiError(err);
    throw err.response.data;
  });
export const getPurchaseInvoiceQuery = (id: string) => ({
  queryKey: [queryKeys.purchaseInvoice, id],
  queryFn: () => getPurchaseInvoiceRequest(id),
  refetchOnWindowFocus: false,
  retry: (failureCount: number, error: { code: HTTPS_CODES }) => error?.code !== HTTPS_CODES.UNAUTHORIZED,
});

// create
const createPurchaseInvoiceRequest = ({ body }: { body: PurchaseInvoiceCreateForm }) => ApiClient.post(apiEndpoints.purchaseInvoices(), body)
  .then((res) => res.data)
  .catch((err) => {
    handleApiError(err);
    throw err;
  });
export const cretePurchaseInvoiceMutation = () => ({
  mutationKey: [queryKeys.create],
  mutationFn: createPurchaseInvoiceRequest,
});

// update
const updatePurchaseInvoiceRequest = ({ id, body }: { id:string, body: PurchaseInvoiceUpdateForm }) => ApiClient.put(apiEndpoints.purchaseInvoicesByIdAsParams(id), body)
  .then((res) => res.data)
  .catch((err) => {
    handleApiError(err);
    throw err;
  });
export const updatePurchaseInvoiceMutation = () => ({
  mutationKey: [queryKeys.update],
  mutationFn: updatePurchaseInvoiceRequest,
});
