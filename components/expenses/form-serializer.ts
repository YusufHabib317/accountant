import { ExpensesApiResponse } from '@/query/expense/types';
import dayjs from 'dayjs';

export const serializer = (
  data: ExpensesApiResponse[number] | undefined,
  mode: 'create' | 'update',
) => {
  if (mode === 'update' && data) {
    return {
      id: data.id,
      date: data?.date ? dayjs(data.date).format('YYYY-MM-DDTHH:mm') : '',
      name: data.name,
      notes: data.notes ?? '',
      amount: data.amount,
      category: data.category,
    };
  }

  return {
    date: undefined,
    name: '',
    amount: 0,
    category: '',
    notes: '',
  };
};
