/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-unused-vars */

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
import { createSupplierSchema, supplierApiResponse, supplierBackendSchema } from '@/schema/suppliers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { creteSupplierMutation, updateSupplierMutation } from '@/query/suppliers';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/data';
import { supplierFormRequest, suppliersApiResponse } from '@/query/suppliers/types';
import { serializer } from './form-serializer';

type SupplierFormProps = {
   mode: 'create' | 'update';
   supplierData: suppliersApiResponse[number] | undefined;
}

export default function SupplierForm(props:SupplierFormProps) {
  const { supplierData, mode } = props;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: serializer(supplierData, mode),
  });

  const { mutate: createMutate, isLoading: isLoadingCreate } = useMutation({
    mutationFn: creteSupplierMutation().mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['supplier', supplierData?.id],
        exact: true,
      });
      router.push(`${ROUTES.supplier.path}`);
      toast({
        title: 'Supplier',
        description: 'New supplier created',
      });
    },
  });

  const { mutate: updateMutate, isLoading: isLoadingUpdate } = useMutation({
    mutationFn: updateSupplierMutation().mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['supplier', supplierData?.id],
        exact: true,
      });
      toast({
        title: 'Supplier',
        description: 'Supplier updated',
      });
    },
  });

  const isLoading = isLoadingUpdate || isLoadingCreate;

  const onSubmit = async (values: supplierFormRequest) => {
    try {
      if (mode === 'update') {
        if (!values.id) {
          throw new Error('Supplier ID is required for updates');
        }
        updateMutate({ id: values.id, body: values });
      } else {
        createMutate({ body: values });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong',
      });
    }
  };

  return (
    <section className="mt-5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} isLoading={isLoading}>
              { mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <FormField
              control={form.control}
              name="name"
              defaultValue="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Supplier Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              defaultValue="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              defaultValue="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              defaultValue="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              defaultValue="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companyName"
              defaultValue="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Company Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              defaultValue="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Additional Notes" {...field} />
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
