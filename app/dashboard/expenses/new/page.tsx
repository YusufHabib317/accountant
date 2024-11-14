'use client';

import ExpenseForm from '@/components/expenses/expense-form';

export default function ExpenseCreate() {
  return (
    <div>
      <ExpenseForm
        mode="create"
        expenseData={undefined}
      />
    </div>
  );
}
