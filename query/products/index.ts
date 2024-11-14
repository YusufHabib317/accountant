import { apiEndpoints } from '@/data/api-endpoints';
import { ApiClient } from '@/lib/axios';
import { handleApiError } from '@/utils/api-handlers/handle-backend-error';
import { CreateProductRequest, getProductsQueryProps, UpdateProductRequest } from './types';
import { HTTPS_CODES } from '@/data';

enum queryKeys {
  products = 'products',
  product = 'product',
  create = 'create',
  update = 'update',
}

// get products
const getProductsRequest = (props: getProductsQueryProps) => {
  const {
    pagination = { page: 1, pageSize: 10 },
    filters = {},
    sort = { sortBy: 'createdAt', sortOrder: 'desc' },
    search = '',
  } = props;
  return ApiClient.get(apiEndpoints.products(), {
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
export const getProductsQuery = (props: getProductsQueryProps) => ({
  queryKey: [
    queryKeys.products,
    props?.filters,
    props?.pagination,
    props?.sort,
    props?.search,
  ],
  queryFn: () => getProductsRequest({ ...props }),
  refetchOnWindowFocus: false,
  retry: (failureCount: number, error: { code: HTTPS_CODES }) => error?.code !== HTTPS_CODES.UNAUTHORIZED,
});

// get supplier
const getProductRequest = (id: string) => ApiClient.get(apiEndpoints.productsByIdAsParams(id))
  .then((res) => res.data)
  .catch((err) => {
    handleApiError(err);
    throw err.response.data;
  });
export const getProductQuery = (id: string) => ({
  queryKey: [queryKeys.product, id],
  queryFn: () => getProductRequest(id),
  refetchOnWindowFocus: false,
  retry: (failureCount: number, error: { code: HTTPS_CODES }) => error?.code !== HTTPS_CODES.UNAUTHORIZED,
});

// create
const createProductRequest = ({ body }: { body: CreateProductRequest }) => ApiClient.post(apiEndpoints.products(), body)
  .then((res) => res.data)
  .catch((err) => {
    handleApiError(err);
    throw err;
  });
export const creteProductMutation = () => ({
  mutationKey: [queryKeys.create],
  mutationFn: createProductRequest,
});

// update
const updateProductRequest = ({ id, body }: { id:string, body: UpdateProductRequest }) => ApiClient.put(apiEndpoints.productsByIdAsParams(id), body)
  .then((res) => res.data)
  .catch((err) => {
    handleApiError(err);
    throw err;
  });
export const updateProductMutation = () => ({
  mutationKey: [queryKeys.update],
  mutationFn: updateProductRequest,
});
