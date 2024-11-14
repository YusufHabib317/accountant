import { apiEndpoints } from '@/data/api-endpoints';
import { ApiClient } from '@/lib/axios';
import { handleApiError } from '@/utils/api-handlers/handle-backend-error';
import { HTTPS_CODES } from '@/data';
import { getSaleInvoicesQueryProps, SaleInvoiceCreateForm, SaleInvoiceUpdateForm } from './types';

enum queryKeys {
  saleInvoices = 'sale-invoices',
  saleInvoice = 'sale-invoice',
  create = 'sale-invoice-create',
  update = 'sale-invoice-update',
}

// get sale invoices
const getSaleInvoicesRequest = (props: getSaleInvoicesQueryProps) => {
  const {
    pagination = { page: 1, pageSize: 10 },
    filters = {},
    sort = { sortBy: 'createdAt', sortOrder: 'desc' },
    search = '',
  } = props;
  return ApiClient.get(apiEndpoints.saleInvoices(), {
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
export const getSaleInvoicesQuery = (props: getSaleInvoicesQueryProps) => ({
  queryKey: [
    queryKeys.saleInvoice,
    props?.filters,
    props?.pagination,
    props?.sort,
    props?.search,
  ],
  queryFn: () => getSaleInvoicesRequest({ ...props }),
  refetchOnWindowFocus: false,
  retry: (failureCount: number, error: { code: HTTPS_CODES }) => error?.code !== HTTPS_CODES.UNAUTHORIZED,
});

// get Sale invoice
const getSaleInvoiceRequest = (id: string) => ApiClient.get(apiEndpoints.saleInvoicesByIdAsParams(id))
  .then((res) => res.data)
  .catch((err) => {
    handleApiError(err);
    throw err.response.data;
  });
export const getSaleInvoiceQuery = (id: string) => ({
  queryKey: [queryKeys.saleInvoice, id],
  queryFn: () => getSaleInvoiceRequest(id),
  refetchOnWindowFocus: false,
  retry: (failureCount: number, error: { code: HTTPS_CODES }) => error?.code !== HTTPS_CODES.UNAUTHORIZED,
});

// create
const createSaleInvoiceRequest = ({ body }: { body: SaleInvoiceCreateForm }) => ApiClient.post(apiEndpoints.saleInvoices(), body)
  .then((res) => res.data)
  .catch((err) => {
    handleApiError(err);
    throw err;
  });
export const creteSaleInvoiceMutation = () => ({
  mutationKey: [queryKeys.create],
  mutationFn: createSaleInvoiceRequest,
});

// update
const updateSaleInvoiceRequest = ({ id, body }: { id:string, body: SaleInvoiceUpdateForm }) => ApiClient.put(apiEndpoints.saleInvoicesByIdAsParams(id), body)
  .then((res) => res.data)
  .catch((err) => {
    handleApiError(err);
    throw err;
  });
export const updateSaleInvoiceMutation = () => ({
  mutationKey: [queryKeys.update],
  mutationFn: updateSaleInvoiceRequest,
});
