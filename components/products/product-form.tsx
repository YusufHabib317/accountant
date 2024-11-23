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
import { serializer } from './form-serializer';
import { createProductSchema, updateProductSchema } from '@/schema/products';
import { creteProductMutation, updateProductMutation } from '@/query/products';
import {
  CreateProductRequest,
  ProductsApiResponse,
  UpdateProductRequest,
} from '@/query/products/types';
import { Label } from '../ui/label';
import { z } from 'zod';

type ProductFormProps = {
  mode: 'create' | 'update';
  productData: ProductsApiResponse[number] | undefined;
}

type FormData = z.infer<typeof createProductSchema>;

export default function ProductForm(props: ProductFormProps) {
  const { productData, mode } = props;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(mode === 'update' ? updateProductSchema : createProductSchema),
    defaultValues: serializer(productData, mode),
  });

  const { mutate: createMutate, isLoading: isLoadingCreate } = useMutation({
    mutationFn: creteProductMutation().mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['products'],
        exact: true,
      });
      router.push(ROUTES.product.path);
      toast({
        title: 'Success',
        description: 'New product created',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create product',
      });
    },
  });

  const { mutate: updateMutate, isLoading: isLoadingUpdate } = useMutation({
    mutationFn: updateProductMutation().mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['product', productData?.id],
        exact: true,
      });
      toast({
        title: 'Success',
        description: 'Product updated',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update product',
      });
    },
  });

  const isLoadingPage = isLoadingUpdate || isLoadingCreate;

  const onSubmit = async (values: FormData) => {
    try {
      if (mode === 'create') {
        createMutate({ body: values as CreateProductRequest });
      } else {
        if (!productData?.id) {
          throw new Error('Product ID is required for updates');
        }
        updateMutate({ id: productData.id, body: values as UpdateProductRequest });
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
            <Button type="submit" disabled={isLoadingPage} isLoading={isLoadingPage}>
              {mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="product name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Code</FormLabel>
                  <FormControl>
                    <Input placeholder="product code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost</FormLabel>
                  <FormControl>
                    <Input placeholder="cost" {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input placeholder="price" {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="salePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sale Price</FormLabel>
                  <FormControl>
                    <Input placeholder="sale price" {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {mode === 'update' && (
              <div className="mt-2">
                <Label>Stock</Label>
                <Input placeholder="stock" value={productData?.stock} readOnly />
              </div>
            )}
          </div>
        </form>
      </Form>
    </section>
  );
}
