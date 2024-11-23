import { apiEndpoints } from '@/data/api-endpoints';
import { ApiClient } from '@/lib/axios';
import { handleApiError } from '@/utils/api-handlers/handle-backend-error';
import { getSuppliersQueryProps, supplierFormRequest } from './types';
import { HTTPS_CODES } from '@/data';

enum queryKeys {
  suppliers = 'suppliers',
  supplier = 'supplier',
  create = 'create',
  update = 'update',
  delete = 'supplier-delete',
}

// get suppliers
const getSuppliersRequest = (props: getSuppliersQueryProps) => {
  const {
    pagination = { page: 1, pageSize: 10 },
    filters = {},
    sort = { sortBy: 'createdAt', sortOrder: 'desc' },
    search = '',
  } = props;
  return ApiClient.get(apiEndpoints.suppliers(), {
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
export const getSuppliersQuery = (props: getSuppliersQueryProps) => ({
  queryKey: [
    queryKeys.suppliers,
    props?.filters,
    props?.pagination,
    props?.sort,
    props?.search,
  ],
  queryFn: () => getSuppliersRequest({ ...props }),
  refetchOnWindowFocus: false,
  retry: (failureCount: number, error: { code: HTTPS_CODES }) => error?.code !== HTTPS_CODES.UNAUTHORIZED,
});

// get supplier
const getSupplierRequest = (id: string) => ApiClient.get(apiEndpoints.suppliersByIdAsParams(id))
  .then((res) => res.data)
  .catch((err) => {
    handleApiError(err);
    throw err.response.data;
  });
export const getSupplierQuery = (id: string) => ({
  queryKey: [queryKeys.supplier, id],
  queryFn: () => getSupplierRequest(id),
  refetchOnWindowFocus: false,
  retry: (failureCount: number, error: { code: HTTPS_CODES }) => error?.code !== HTTPS_CODES.UNAUTHORIZED,
});

// create
const createSupplierRequest = ({ body }: { body: supplierFormRequest }) => ApiClient.post(apiEndpoints.suppliers(), body)
  .then((res) => res.data)
  .catch((err) => {
    handleApiError(err);
    throw err;
  });
export const creteSupplierMutation = () => ({
  mutationKey: [queryKeys.create],
  mutationFn: createSupplierRequest,
});

// update
const updateSupplierRequest = ({ id, body }: { id:string, body: supplierFormRequest }) => ApiClient.put(apiEndpoints.suppliersByIdAsParams(id), body)
  .then((res) => res.data)
  .catch((err) => {
    handleApiError(err);
    throw err;
  });
export const updateSupplierMutation = () => ({
  mutationKey: [queryKeys.update],
  mutationFn: updateSupplierRequest,
});

// delete
const deleteSupplierRequest = (id: string) => ApiClient.delete(apiEndpoints.suppliersByIdAsParams(id))
  .then((res) => res.data)
  .catch((err) => {
    handleApiError(err);
    throw err.response.data;
  });
export const deleteSupplierMutation = (id: string) => ({
  mutationKey: ['supplier-delete', id],
  mutationFn: async () => {
    const response = await deleteSupplierRequest(id);
    if (!response) {
      throw new Error('Failed to delete supplier');
    }
    return response;
  },
});
