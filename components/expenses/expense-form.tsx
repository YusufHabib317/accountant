'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/data';
import dayjs from 'dayjs';
import { ExpenseCreateForm, ExpensesApiResponse, ExpenseUpdateForm } from '@/query/expense/types';
import { serializer } from './form-serializer';
import { creteExpenseMutation, expensesQueryKeys, updateExpenseMutation } from '@/query/expense';
import { createExpenseSchema, updateExpenseSchema } from '@/schema/expenses';

type ExpenseFormProps = {
  mode: 'create' | 'update';
  expenseData: ExpensesApiResponse[number] | undefined;
}

type FormData = ExpenseCreateForm;

export default function ExpenseForm(props: ExpenseFormProps) {
  const {
    expenseData, mode,
  } = props;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(mode === 'update' ? updateExpenseSchema : createExpenseSchema),
    defaultValues: serializer(expenseData, mode),
  });

  const { mutate: createMutate, isLoading: isLoadingCreate } = useMutation({
    mutationFn: creteExpenseMutation().mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [expensesQueryKeys.create],
        exact: true,
      });
      router.push(ROUTES.expense.path);
      toast({
        title: 'Success',
        description: 'New expense invoice created',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create expense',
      });
    },
  });

  const { mutate: updateMutate, isLoading: isLoadingUpdate } = useMutation({
    mutationFn: updateExpenseMutation().mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [expensesQueryKeys.update],
        exact: true,
      });
      toast({
        title: 'Success',
        description: 'Expense updated',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update expense',
      });
    },
  });

  const isLoading = isLoadingUpdate || isLoadingCreate;

  const onSubmit = async (values: FormData) => {
    try {
      if (mode === 'create') {
        createMutate({ body: values });
      } else {
        if (!expenseData?.id) {
          throw new Error('Expense ID is required for updates');
        }
        updateMutate({ id: expenseData.id, body: values as ExpenseUpdateForm });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong',
      });
    }
  };

  return (
    <section className="mt-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} isLoading={isLoading}>
              {mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="category"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      value={field.value || dayjs().format('YYYY-MM-DDTHH:mm')}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </section>
  );
}
