'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { getExpenseQuery } from '@/query/expense';
import ExpenseForm from '@/components/expenses/expense-form';

export default function PurchaseInvoice() {
  const params = useParams();
  const { index: id } = params;
  const { data, isLoading: isLoadingExpense } = useQuery(getExpenseQuery(id ? `${id}` : ''));

  if (isLoadingExpense) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <ExpenseForm
      mode="update"
      expenseData={data?.details?.data}
    />
  );
}
