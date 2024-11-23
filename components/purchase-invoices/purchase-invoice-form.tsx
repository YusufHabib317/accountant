/* eslint-disable max-lines */
/* eslint-disable react/require-default-props */

'use client';

import { useFieldArray, useForm } from 'react-hook-form';
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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { createPurchaseSchema, updatePurchaseSchema } from '@/schema/purchase-invoices';
import { cretePurchaseInvoiceMutation, updatePurchaseInvoiceMutation } from '@/query/purchase-invoice';
import { PurchaseInvoiceApiResponse, PurchaseInvoiceCreateForm, PurchaseInvoiceUpdateForm } from '@/query/purchase-invoice/types';
import { serializer } from '@/components/purchase-invoices/form-serializer';
import { suppliersApiResponse } from '@/query/suppliers/types';
import { ProductsApiResponse } from '@/query/products/types';
import dayjs from 'dayjs';

type PurchaseInvoiceFormProps = {
  mode: 'create' | 'update';
  purchaseInvoiceData: PurchaseInvoiceApiResponse[number] | undefined;
  suppliers?: suppliersApiResponse;
  products?: ProductsApiResponse;
}

type FormData = PurchaseInvoiceCreateForm;

export default function PurchaseInvoiceForm(props: PurchaseInvoiceFormProps) {
  const {
    purchaseInvoiceData, mode, suppliers, products,
  } = props;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(mode === 'update' ? updatePurchaseSchema : createPurchaseSchema),
    defaultValues: serializer(purchaseInvoiceData, mode),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const { mutate: createMutate, isLoading: isLoadingCreate } = useMutation({
    mutationFn: cretePurchaseInvoiceMutation().mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['purchase-invoice-create'],
        exact: true,
      });
      router.push(ROUTES.purchaseInvoice.path);
      toast({
        title: 'Success',
        description: 'New purchase invoice created',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create purchase invoice',
      });
    },
  });

  const { mutate: updateMutate, isLoading: isLoadingUpdate } = useMutation({
    mutationFn: updatePurchaseInvoiceMutation().mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['purchase-invoice-update'],
        exact: true,
      });
      toast({
        title: 'Success',
        description: 'Purchase invoice updated',
      });
      window.location.reload();
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update purchase invoice',
      });
    },
  });

  const isLoading = isLoadingUpdate || isLoadingCreate;

  const onSubmit = async (values: FormData) => {
    try {
      if (mode === 'create') {
        createMutate({ body: values });
      } else {
        if (!purchaseInvoiceData?.id) {
          throw new Error('Purchase Invoice ID is required for updates');
        }
        updateMutate({ id: purchaseInvoiceData.id, body: values as PurchaseInvoiceUpdateForm });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong',
      });
    }
  };

  const updateTotals = () => {
    const items = form.watch('items') || [];
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const tax = form.watch('tax') || 0;
    const total = subtotal + tax;

    form.setValue('subtotal', subtotal);
    form.setValue('total', total);
    form.setValue('remaining', total - (form.watch('paid') || 0));
  };

  const calculateItemTotal = (index: number) => {
    const item = form.watch(`items.${index}`);
    if (item.quantity && item.cost) {
      const total = item.quantity * item.cost;
      form.setValue(`items.${index}.total`, total);
      updateTotals();
    }
  };

  const onProductSelect = (productId: string, index: number) => {
    const product = products?.find((p) => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.cost`, product.cost);
      calculateItemTotal(index);
    }
  };

  return (
    <section className="mt-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading || !form.watch('supplierId')} isLoading={isLoading}>
              {mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            <FormField
              control={form.control}
              name="supplierId"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {suppliers?.map((supplier) => (
                        supplier.id && (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                        )
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
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
                      value={
                        field.value
                          ? dayjs(field.value).format('YYYY-MM-DDTHH:mm')
                          : dayjs().format('YYYY-MM-DDTHH:mm')
                        }
                      onChange={(e) => {
                        const newValue = dayjs(e.target.value).toISOString();
                        field.onChange(newValue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4 border bg-slate-900 rounded-md p-5">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Items</h3>
              <Button
                type="button"
                variant="outline"
                onClick={() => append({
                  productId: '', quantity: 0, cost: 0, total: 0,
                })}
              >
                Add Item
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields?.map((item, index) => (
                  <TableRow key={item.id || index}>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`items.${index}.productId`}
                        render={({ field }) => (
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              onProductSelect(value, index);
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products?.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => {
                              field.onChange(Number(e.target.value));
                              calculateItemTotal(index);
                            }}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`items.${index}.cost`}
                        render={({ field }) => (
                          <Input
                            type="number"
                            readOnly
                            disabled
                            {...field}
                            onChange={(e) => {
                              field.onChange(Number(e.target.value));
                              calculateItemTotal(index);
                            }}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`items.${index}.total`}
                        render={({ field }) => (
                          <Input type="number" {...field} readOnly disabled />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <FormField
              control={form.control}
              name="subtotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtotal</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} readOnly disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                        updateTotals();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="total"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} readOnly disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paid</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                        updateTotals();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remaining"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remaining</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} readOnly disabled />
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
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
