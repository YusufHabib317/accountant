import { ExpensesApiResponse } from '@/query/expense/types';

export const serializer = (
  data: ExpensesApiResponse[number] | undefined,
  mode: 'create' | 'update',
) => {
  if (mode === 'update' && data) {
    return {
      id: data.id,
      date: data.date,
      name: data.name,
      amount: data.amount,
      category: data.category,
      createAt: data.createAt,
      updateAt: data.updateAt,
    };
  }

  return {
    date: undefined,
    name: '',
    amount: 0,
    category: '',
  };
};
