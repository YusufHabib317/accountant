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
import { ProductsApiResponse } from '@/query/products/types';
import dayjs from 'dayjs';
import { SaleInvoiceApiResponse, SaleInvoiceCreateForm, SaleInvoiceUpdateForm } from '@/query/sale-invoice/types';
import { createSaleSchema, updateSaleSchema } from '@/schema/sale-invoices';
import { creteSaleInvoiceMutation, updateSaleInvoiceMutation } from '@/query/sale-invoice';
import { serializer } from './form-serializer';

type SaleInvoiceFormProps = {
  mode: 'create' | 'update';
  saleInvoiceData: SaleInvoiceApiResponse[number] | undefined;
  products?: ProductsApiResponse;
}

type FormData = SaleInvoiceCreateForm;

export default function SaleInvoiceForm(props: SaleInvoiceFormProps) {
  const {
    saleInvoiceData, mode, products,
  } = props;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(mode === 'update' ? updateSaleSchema : createSaleSchema),
    defaultValues: serializer(saleInvoiceData, mode, products),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const { mutate: createMutate, isLoading: isLoadingCreate } = useMutation({
    mutationFn: creteSaleInvoiceMutation().mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries(['sale-invoice-update']);
      // queryClient.invalidateQueries(['products']);
      router.push(ROUTES.saleInvoice.path);
      toast({
        title: 'Success',
        description: 'New sale invoice created',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create sale invoice',
      });
    },
  });

  const { mutate: updateMutate, isLoading: isLoadingUpdate } = useMutation({
    mutationFn: updateSaleInvoiceMutation().mutationFn,
    onSuccess: () => {
      queryClient.refetchQueries(['sale-invoice-update']);
      toast({
        title: 'Success',
        description: 'Sale invoice updated',
      });
      window.location.reload();
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update sale invoice',
      });
    },
  });

  const isLoading = isLoadingUpdate || isLoadingCreate;

  const onSubmit = async (values: FormData) => {
    try {
      if (mode === 'create') {
        createMutate({ body: values });
      } else {
        if (!saleInvoiceData?.id) {
          throw new Error('Purchase Invoice ID is required for updates');
        }
        updateMutate({ id: saleInvoiceData.id, body: values as SaleInvoiceUpdateForm });
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
    if (item.quantity && item.price) {
      const total = item.quantity * item.price;
      form.setValue(`items.${index}.total`, total);
      updateTotals();
    }
  };

  const onProductSelect = (productId: string, index: number) => {
    const product = products?.find((p) => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.price`, product.price);
      form.setValue(`items.${index}.stock`, product.stock);
      calculateItemTotal(index);
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
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
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
                  productId: '', quantity: 0, price: 0, stock: 0, total: 0,
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
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
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
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(Number(e.target.value));
                                  calculateItemTotal(index);
                                }}
                              />
                            </FormControl>
                            {fieldState.error?.message && (
                            <FormMessage>{fieldState.error.message}</FormMessage>
                            )}
                          </FormItem>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`items.${index}.price`}
                        render={({ field }) => (
                          <Input type="number" readOnly {...field} disabled />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`items.${index}.stock`}
                        render={({ field }) => (
                          <Input type="number" readOnly {...field} disabled />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <FormField
                        control={form.control}
                        name={`items.${index}.total`}
                        render={({ field }) => (
                          <Input type="number" readOnly {...field} disabled />
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
