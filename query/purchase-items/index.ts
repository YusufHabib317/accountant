import { apiEndpoints } from '@/data/api-endpoints';
import { ApiClient } from '@/lib/axios';
import { handleApiError } from '@/utils/api-handlers/handle-backend-error';
import { HTTPS_CODES } from '@/data';

enum queryKeys {
  purchaseItems = 'purchase-items',
  purchaseItem = 'purchase-item',
}

// get purchase items
const getPurchaseItemsRequest = (purchaseInvoiceId: string) => ApiClient.get(apiEndpoints.purchaseItemsByPurchaseInvoice(purchaseInvoiceId))
  .then((res) => res?.data)
  .catch((e) => {
    handleApiError(e);
    throw e.response?.data;
  });

export const getPurchaseItemsQuery = (purchaseInvoiceId: string) => ({
  queryKey: [queryKeys.purchaseItems, purchaseInvoiceId],
  queryFn: () => getPurchaseItemsRequest(purchaseInvoiceId),
  refetchOnWindowFocus: false,
  retry: (failureCount: number, error: { code: HTTPS_CODES }) => error?.code !== HTTPS_CODES.UNAUTHORIZED,
});

// get purchase invoice
const getPurchaseItemRequest = (id: string) => ApiClient.get(apiEndpoints.purchaseInvoicesByIdAsParams(id))
  .then((res) => res.data)
  .catch((err) => {
    handleApiError(err);
    throw err.response.data;
  });
export const getPurchaseItemQuery = (id: string) => ({
  queryKey: [queryKeys.purchaseItem, id],
  queryFn: () => getPurchaseItemRequest(id),
  refetchOnWindowFocus: false,
  retry: (failureCount: number, error: { code: HTTPS_CODES }) => error?.code !== HTTPS_CODES.UNAUTHORIZED,
});
