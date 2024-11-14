import { apiEndpoints } from '@/data/api-endpoints';
import { ApiClient } from '@/lib/axios';
import { handleApiError } from '@/utils/api-handlers/handle-backend-error';
import { HTTPS_CODES } from '@/data';
import { ExpenseCreateForm, ExpenseUpdateForm, getExpenseQueryProps } from './types';

export enum expensesQueryKeys {
 expenses = 'expenses',
  expense = 'expense',
  create = 'expense-create',
  update = 'expense-update',
}

// get expense
const getExpensesRequest = (props: getExpenseQueryProps) => {
  const {
    pagination = { page: 1, pageSize: 10 },
    filters = {},
    sort = { sortBy: 'createdAt', sortOrder: 'desc' },
    search = '',
  } = props;
  return ApiClient.get(apiEndpoints.expenses(), {
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

export const getExpensesQuery = (props: getExpenseQueryProps) => ({
  queryKey: [
    expensesQueryKeys.expenses,
    props?.filters,
    props?.pagination,
    props?.sort,
    props?.search,
  ],
  queryFn: () => getExpensesRequest({ ...props }),
  refetchOnWindowFocus: false,
  retry: (failureCount: number, error: { code: HTTPS_CODES }) => error?.code !== HTTPS_CODES.UNAUTHORIZED,
});

// get expense
const getExpenseRequest = (id: string) => ApiClient.get(apiEndpoints.expensesByIdAsParams(id))
  .then((res) => res.data)
  .catch((err) => {
    handleApiError(err);
    throw err.response.data;
  });
export const getExpenseQuery = (id: string) => ({
  queryKey: [expensesQueryKeys.expense, id],
  queryFn: () => getExpenseRequest(id),
  refetchOnWindowFocus: false,
  retry: (failureCount: number, error: { code: HTTPS_CODES }) => error?.code !== HTTPS_CODES.UNAUTHORIZED,
});

// create
const createExpenseRequest = ({ body }: { body: ExpenseCreateForm }) => ApiClient.post(apiEndpoints.expenses(), body)
  .then((res) => res.data)
  .catch((err) => {
    handleApiError(err);
    throw err;
  });
export const creteExpenseMutation = () => ({
  mutationKey: [expensesQueryKeys.create],
  mutationFn: createExpenseRequest,
});

// update
const updateExpenseRequest = ({ id, body }: { id:string, body: ExpenseUpdateForm }) => ApiClient.put(apiEndpoints.expensesByIdAsParams(id), body)
  .then((res) => res.data)
  .catch((err) => {
    handleApiError(err);
    throw err;
  });
export const updateExpenseMutation = () => ({
  mutationKey: [expensesQueryKeys.update],
  mutationFn: updateExpenseRequest,
});
