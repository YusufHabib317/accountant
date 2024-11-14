'use client';

import ProductForm from '@/components/products/product-form';
import { getProductQuery } from '@/query/products';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function Supplier() {
  const params = useParams();
  const { index: id } = params;
  const { data, isLoading } = useQuery(getProductQuery(id ? `${id}` : ''));

  if (isLoading) {
    return <div className="h-[calc(100vh-60px)] w-full flex justify-center items-center"><Loader2 className="animate-spin" /></div>;
  }
  return (
    <div><ProductForm mode="update" productData={data.details.data} /></div>
  );
}
